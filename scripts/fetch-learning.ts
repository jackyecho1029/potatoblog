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

async function summarizeVideo(originalTitle: string, transcriptText: string): Promise<{ hookTitle: string, category: string, summary: string }> {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
你是一位资深的知识策展人和学习顾问。请用"金字塔原理"深度解析这个视频内容。

**重要说明：** 转录内容中包含时间戳信息，请在核心观点和金句旁标注对应的时间戳（格式：[MM:SS]），这样读者可以跳转到原视频的相应位置。

**原视频标题:** "${originalTitle}"

**输出格式要求（注意排版要有留白，不要太紧凑）：**

---HOOK_TITLE_START---
[写一个简短有力的中文标题，激发好奇心。例如："为什么90%的人永远无法财务自由？"]
---HOOK_TITLE_END---

---CATEGORY_START---
[根据视频内容选择最合适的一个分类标签，只能从以下选项中选择一个：
思维成长 | 商业创业 | 健康生活 | 职场效率 | 人际关系 | 科技趋势 | 投资理财 | 创意艺术]
---CATEGORY_END---

## 🎯 核心观点

### 观点一：[核心观点标题] [MM:SS]

[2-3句话解释这个观点的核心含义]

**因為：**
- [论据1]
- [论据2]

**案例/证据：** [如有相关案例，简要说明；如无，可省略此行]

---

### 观点二：[核心观点标题] [MM:SS]

[2-3句话解释这个观点的核心含义]

**因為：**
- [论据1]
- [论据2]

---

### 观点三：[核心观点标题] [MM:SS]

[2-3句话解释这个观点的核心含义]

**因為：**
- [论据1]
- [论据2]

---

**📌 总结：** [用1-2句话总结全文核心思想]

---

## 📚 关键词

从视频中提取最多5个重要的专业词汇或概念（如果没有特别重要的词汇可以少于5个）：

**1. [中文术语]（[English Term]）**

> **含义：** [简明解释这个词的意思，2-3句话]

**💼 案例：**

[描述一个知名公司或人物如何成功运用这个概念的案例。包括：谁在什么情况下使用了这个策略/方法，产生了什么正面效果。2-4句话。如果能找到相关文章或资源，请添加超链接。]

🔗 [了解更多：相关案例文章标题](相关URL链接)

---

**2. [中文术语]（[English Term]）**

> **含义：** [简明解释这个词的意思，2-3句话]

**💼 案例：**

[描述一个知名公司或人物如何成功运用这个概念的案例。]

🔗 [了解更多：相关案例文章标题](相关URL链接)

---

[以此类推，最多5个关键词。注意排版要有足够留白和空间]

---

**特别注意：** 在所有输出内容中，请将"邮箱"替换为"电邮"，将"邮箱列表"替换为"电邮清单"。

## 💎 金句精选

> "[优美的中文翻译]"
> 
> （原文：[English original quote]）
> 
> 📍 [MM:SS]

---

> "[优美的中文翻译]"
> 
> （原文：[English original quote]）
> 
> 📍 [MM:SS]

---

## 💡 行动建议

**第一步：[行动名称]**

[用Steve Jobs的表达风格，简洁有力、充满激情地解释这个行动。语气要像在发布会上对观众说话一样，直击人心。2-3句话。]

---

**第二步：[行动名称]**

[用Steve Jobs的表达风格，简洁有力、充满激情地解释这个行动。语气要像在发布会上对观众说话一样，直击人心。2-3句话。]

---

**第三步：[行动名称]**

[用Steve Jobs的表达风格，简洁有力、充满激情地解释这个行动。语气要像在发布会上对观众说话一样，直击人心。2-3句话。]

---

### One More Thing...

[用1-2句话，以Steve Jobs "One More Thing"的经典方式，给出一个令人惊喜或发人深省的最终总结/洞见。]

---
转录内容（包含时间戳）：
${transcriptText.substring(0, 25000)}
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract hook title
        const titleMatch = text.match(/---HOOK_TITLE_START---([\s\S]*?)---HOOK_TITLE_END---/);
        const hookTitle = titleMatch ? titleMatch[1].trim() : originalTitle;

        // Extract category
        const categoryMatch = text.match(/---CATEGORY_START---([\s\S]*?)---CATEGORY_END---/);
        const category = categoryMatch ? categoryMatch[1].trim() : '思维成长';

        // Remove the markers from summary
        let summary = text.replace(/---HOOK_TITLE_START---[\s\S]*?---HOOK_TITLE_END---/, '').trim();
        summary = summary.replace(/---CATEGORY_START---[\s\S]*?---CATEGORY_END---/, '').trim();

        return { hookTitle, category, summary };
    } catch (error) {
        console.error("Gemini Error:", error);
        return { hookTitle: originalTitle, category: '思维成长', summary: "AI Summarization Failed." };
    }
}

async function fetchVideoByUrl(videoUrl: string) {
    if (!YOUTUBE_API_KEY || !GEMINI_API_KEY) {
        console.error('API Keys are missing');
        return;
    }

    try {
        const urlObj = new URL(videoUrl);
        const videoId = urlObj.searchParams.get("v");
        if (!videoId) {
            console.error("Invalid YouTube URL");
            return;
        }

        console.log(`Processing specific video: ${videoId}`);

        // Fetch video details to get title and channel
        const response = await youtube.videos.list({
            key: YOUTUBE_API_KEY,
            part: ['snippet'],
            id: [videoId]
        });

        const video = response.data.items?.[0];
        if (!video) {
            console.error("Video not found");
            return;
        }

        const title = video.snippet?.title || 'Unknown Title';
        const channelTitle = video.snippet?.channelTitle || 'Unknown Channel';
        const date = video.snippet?.publishedAt?.split('T')[0] || '2026-01-01'; // Use current date for sorting if needed, or actual date

        // Process logic (duplicated from fetchLatestVideos for now to ensure consistency)
        const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 50);
        const dateString = video.snippet?.publishedAt?.split('T')[0] || '2026-01-01';
        const filename = `${dateString}-${cleanTitle}.md`;
        const postsDir = path.join(process.cwd(), 'posts/learning');
        if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });

        const filePath = path.join(postsDir, filename);

        // Auto-link timestamps
        const linkTimestamp = (content: string, videoId: string) => {
            return content.replace(/\[(\d{2}):(\d{2})\]/g, (match, mm, ss) => {
                const totalSeconds = parseInt(mm) * 60 + parseInt(ss);
                const link = `https://www.youtube.com/watch?v=${videoId}&t=${totalSeconds}s`;
                return `<a href="${link}" target="_blank" class="text-xs text-amber-600 hover:underline"><small>[${mm}:${ss}]</small></a>`;
            });
        };

        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

        console.log("   Fetching transcript...");
        const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
        const transcriptText = transcriptItems.map(item => {
            // Basic attempt to keep timestamp if library provides it, but youtube-transcript returns text and offset
            // We need to inject timestamps into the text for Gemini if we want it to use them.
            // The library returns {text: string, duration: number, offset: number}
            const minutes = Math.floor(item.offset / 60000);
            const seconds = Math.floor((item.offset % 60000) / 1000);
            const timeStr = `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}]`;
            return `${timeStr} ${item.text}`;
        }).join(' ');

        console.log("   Summarizing with Gemini...");
        const { hookTitle, category, summary } = await summarizeVideo(title, transcriptText);

        const linkedSummary = linkTimestamp(summary, videoId);

        // Handle might not be available directly from video detail in same format as CHANNELS list
        // We use channelTitle which is "Tim Ferriss" etc.
        const authorName = channelTitle;

        const fileContent = `---
title: "${hookTitle.replace(/"/g, '\\"')}"
original_title: "${title.replace(/"/g, '\\"')}"
author: "${authorName}"
category: "${category}"
date: "${dateString}"
tags: ["${category}", "${authorName}"]
source_url: "https://www.youtube.com/watch?v=${videoId}"
thumbnail: "${thumbnailUrl}"
---

${linkedSummary}`;

        fs.writeFileSync(filePath, fileContent);
        console.log(`✅ Saved: ${filename}`);

    } catch (error) {
        console.error("Error processing specific video:", error);
    }
}

async function fetchLatestVideos() {
    // Check if a specific URL is provided as argument
    const specificUrl = process.argv[2];
    if (specificUrl && specificUrl.includes('youtube.com')) {
        await fetchVideoByUrl(specificUrl);
        return;
    }

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

            // Skip YouTube Shorts
            if (title.toLowerCase().includes('#shorts') || title.toLowerCase().includes('shorts')) {
                console.log(`Skipping Shorts: ${title}`);
                continue;
            }
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
                const { hookTitle, category, summary } = await summarizeVideo(title, transcriptText);

                const authorName = handle.replace('@', '');
                const fileContent = `---
title: "${hookTitle.replace(/"/g, '\\"')}"
original_title: "${title.replace(/"/g, '\\"')}"
author: "${authorName}"
category: "${category}"
date: "${date}"
tags: ["${category}", "${authorName}"]
source_url: "https://www.youtube.com/watch?v=${videoId}"
thumbnail: "${thumbnailUrl}"
---

${summary}

---
*由 PotatoLearning Hub 自动生成*
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
