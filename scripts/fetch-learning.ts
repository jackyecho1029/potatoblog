import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: '.env.local' });

const youtube = google.youtube('v3');
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

const CHANNELS = process.env.YOUTUBE_CHANNELS?.split(',') || [];

async function getChannelId(handle: string) {
    try {
        const response = await youtube.search.list({
            key: YOUTUBE_API_KEY,
            part: ['snippet'],
            q: handle,
            type: ['channel'],
            maxResults: 1
        });
        return response.data.items?.[0]?.id?.channelId;
    } catch (error) {
        console.error(`Error fetching ID for ${handle}:`, error);
        return null;
    }
}

async function summarizeVideo(originalTitle: string, transcriptText: string): Promise<{ hookTitle: string, summary: string }> {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
You are an expert content creator and learning assistant. Your task is to:
1. Create a compelling, curiosity-inducing Chinese title (NOT a direct translation)
2. Summarize the video content

**Original Video Title:** "${originalTitle}"

**Your output MUST follow this EXACT format:**

---HOOK_TITLE_START---
[Write a short, punchy Chinese title that creates curiosity or FOMO. Use rhetorical questions, bold claims, or intriguing hooks. Example: "为什么90%的人永远无法财务自由？" or "这个习惯，让我一年多赚了50万"]
---HOOK_TITLE_END---

## 核心观点
- [Point 1 in Chinese]
- [Point 2 in Chinese]
- [Point 3 in Chinese]

### 💎 金句
> "[Impactful quote 1 in Chinese]"
> "[Impactful quote 2 in Chinese]"

### 💡 行动建议
- [Actionable advice 1 in Chinese]
- [Actionable advice 2 in Chinese]

---
Transcript:
${transcriptText.substring(0, 25000)}
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract hook title
        const titleMatch = text.match(/---HOOK_TITLE_START---([\s\S]*?)---HOOK_TITLE_END---/);
        const hookTitle = titleMatch ? titleMatch[1].trim() : originalTitle;

        // Remove the title markers from summary
        const summary = text.replace(/---HOOK_TITLE_START---[\s\S]*?---HOOK_TITLE_END---/, '').trim();

        return { hookTitle, summary };
    } catch (error) {
        console.error("Gemini Error:", error);
        return { hookTitle: originalTitle, summary: "AI Summarization Failed." };
    }
}

async function fetchLatestVideos() {
    if (!YOUTUBE_API_KEY || !GEMINI_API_KEY) {
        console.error('API Keys are missing');
        return;
    }

    console.log(`🔍 Checking ${CHANNELS.length} channels for new content...`);

    // Create learning posts directory
    // content is referenced relative to project root
    const postsDir = path.join(process.cwd(), 'posts/learning');
    if (!fs.existsSync(postsDir)) {
        fs.mkdirSync(postsDir, { recursive: true });
    }

    for (const handle of CHANNELS) {
        const channelId = await getChannelId(handle);
        if (!channelId) continue;

        console.log(`Processing ${handle}...`);

        const response = await youtube.search.list({
            key: YOUTUBE_API_KEY,
            channelId: channelId,
            part: ['snippet'],
            order: 'date',
            maxResults: 1, // Only check the very latest for speed test
            type: ['video']
        });

        const videos = response.data.items || [];
        for (const video of videos) {
            if (!video.id?.videoId) continue;

            const videoId = video.id.videoId;
            const title = video.snippet?.title || 'Unknown Title';
            const date = video.snippet?.publishedAt?.split('T')[0] || '2026-01-01';
            const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 50);
            const filename = `${date}-${cleanTitle}.md`;
            const filePath = path.join(postsDir, filename);

            if (fs.existsSync(filePath)) {
                console.log(`Skipping already processed: ${title}`);
                continue;
            }

            console.log(`🎥 Found new video: ${title}`);

            // Get YouTube thumbnail (high quality)
            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

            try {
                console.log("   Fetching transcript...");
                const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
                const transcriptText = transcriptItems.map(item => item.text).join(' ');

                console.log("   Summarizing with Gemini...");
                const { hookTitle, summary } = await summarizeVideo(title, transcriptText);

                const fileContent = `---
title: "${hookTitle.replace(/"/g, '\\"')}"
original_title: "${title.replace(/"/g, '\\"')}"
date: "${date}"
tags: ["Learning", "YouTube", "${handle.replace('@', '')}"]
source_url: "https://www.youtube.com/watch?v=${videoId}"
thumbnail: "${thumbnailUrl}"
---

${summary}

---
*Auto-generated by PotatoLearning Hub*
`;

                fs.writeFileSync(filePath, fileContent);
                console.log(`✅ Saved: ${filename}`);

            } catch (err) {
                console.error(`   Failed to process ${title}: No transcript or error.`);
            }
        }
    }
}

fetchLatestVideos();
