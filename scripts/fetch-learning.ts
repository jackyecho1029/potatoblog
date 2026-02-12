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
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
你是一位资深的知识策展人和学习顾问。请用"金字塔原理"深度解析这个视频内容。

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

### 观点一：[核心观点标题]

[2-3句话解释这个观点的核心含义]

**因為：**
- [论据1]
- [论据2]

**案例/证据：** [如有相关案例，简要说明；如无，可省略此行]

---

### 观点二：[核心观点标题]

[2-3句话解释这个观点的核心含义]

**因為：**
- [论据1]
- [论据2]

---

### 观点三：[核心观点标题]

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

**💼 案例：** [描述一个知名公司或人物如何成功运用这个概念的真实案例。2-3句话，不需要提供链接。]

---

**2. [中文术语]（[English Term]）**

> **含义：** [简明解释这个词的意思，2-3句话]

**💼 案例：** [描述一个真实案例，不需要提供链接。]

---

[以此类推，最多5个关键词。注意排版要有足够留白和空间]

---

**特别注意：** 在所有输出内容中，请将"邮箱"替换为"电邮"，将"邮箱列表"替换为"电邮清单"。不要生成任何URL链接或时间戳。

## 💎 金句精选

> "[优美的中文翻译]"
> 
> （原文：[English original quote]）

---

> "[优美的中文翻译]"
> 
> （原文：[English original quote]）

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
转录内容：
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

async function summarizeLennyVideo(guestName: string, transcriptText: string): Promise<string | null> {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
你是一位顶级商业分析师和"一人公司"实战专家，深度推崇查理·芒格的多元思维模型和金字塔原理。
请深度剖析 Lenny's Podcast 的访谈文稿（受访者：${guestName}）。

### 要求：
1. **语言**：必须使用**简体中文**。
2. **核心原则**：
   - **金字塔原理**：结论先行，逻辑推进，案例支撑。
   - **查理·芒格思维**：挖掘其背后的思维模型（如反向思维、格栅效应、激励机制等）。
   - **AI/提效赋能**：聚焦 AI 前沿科技如何赋能生活、个人效率或**电商业务**。
   - **认知重构**：重点对比"旧时代观念" vs "AI 时代新现实"。

### 输出格式：

# 🎯 核心结论

[用一段话总结该嘉宾最核心、最具颠覆性的观点]

---

# 🏛️ 核心分析（金字塔原理）

## 1. [核心逻辑 A]
- **深度剖析**：[背后的因果关系或逻辑支撑]
- **实战案例**：[文稿中提及的具体案例细节]

## 2. [核心逻辑 B]
- **深度剖析**：[背后的因果关系或逻辑支撑]
- **实战案例**：[文稿中提及的具体案例细节]

## 3. [核心逻辑 C]
- **深度剖析**：[背后的因果关系或逻辑支撑]
- **实战案例**：[文稿中提及的具体案例细节]

---

# 🧠 芒格格栅：思维模型拆解

- **[模型 1]**：[描述受访者如何应用该思维模型，以及它如何提升了认知水平]
- **[模型 2]**：[描述受访者如何应用该思维模型，以及它如何提升了认知水平]

---

# ⚡ AI 时代的赋能与重塑

- **前沿应用**：[文稿中提到的具体 AI 技术或趋势]
- **商务/电商实战建议**：[如何直接应用到电商运营或个人提效中]
- **观念打破 (Old vs New)**：
    *   **旧观念**：[描述具体的旧观点]
    *   **新现实**：[描述 AI 时代带来的重塑性变化]

---

# 💡 行动建议 (Steve Jobs 风格)

1. **[行动1]**：[简洁有力的建议]
2. **[行动2]**：[简洁有力的建议]
3. **[行动3]**：[简洁有力的建议]

---
转录文稿内容：
${transcriptText.substring(0, 30000)}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Error for Lenny:", error);
        return null;
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

const BLOCKED_IDS = new Set([
    '7ndW5kb7HsA', // Be Still (Slice)
    'y36uEmFz2Ys', // Sleep Drug (Slice)
    'qSUqZtipYf0', // Half-ass your dreams (Slice)
]);

// Helper to extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
}

// Helper to get all existing video IDs from posts directory
function getExistingVideoIds(postsDir: string): Set<string> {
    const existingIds = new Set<string>();
    if (!fs.existsSync(postsDir)) return existingIds;

    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
        const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
        const match = content.match(/source_url: "https:\/\/www\.youtube\.com\/watch\?v=([^"]+)"/);
        if (match && match[1]) {
            existingIds.add(match[1]);
        }
    }
    return existingIds;
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

    // Build index of existing videos
    const existingIds = getExistingVideoIds(postsDir);
    console.log(`📚 Found ${existingIds.size} existing videos in library.`);

    for (const handle of CHANNELS) {
        const channelId = await getChannelId(handle);
        if (!channelId) continue;

        console.log(`Processing ${handle}...`);

        const response = await youtube.search.list({
            key: YOUTUBE_API_KEY,
            channelId: channelId,
            part: ['snippet'],
            order: 'date',
            // Increase fetch limit to find long-form videos buried by Shorts
            maxResults: 20,
            type: ['video']
        });

        const videos = response.data.items || [];
        for (const video of videos) {
            if (!video.id?.videoId) continue;

            const videoId = video.id.videoId;
            const title = video.snippet?.title || 'Unknown Title';

            // 1. Check strict duplicates via ID
            if (existingIds.has(videoId)) {
                console.log(`Skipping already processed (ID match): ${title}`);
                continue;
            }

            // 2. Check Blocklist
            if (BLOCKED_IDS.has(videoId)) {
                console.log(`Skipping blocked video: ${title}`);
                continue;
            }

            // Skip YouTube Shorts
            if (title.toLowerCase().includes('#shorts') || title.toLowerCase().includes('shorts')) {
                console.log(`Skipping Shorts: ${title}`);
                continue;
            }

            // Get video duration to filter out short clips (<15 min)
            try {
                const videoDetails = await youtube.videos.list({
                    key: YOUTUBE_API_KEY,
                    id: [videoId],
                    part: ['contentDetails']
                });

                const duration = videoDetails.data.items?.[0]?.contentDetails?.duration;
                if (duration) {
                    // Parse ISO 8601 duration (PT1M30S, PT5M, PT1H2M3S)
                    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                    if (match) {
                        const hours = parseInt(match[1] || '0');
                        const minutes = parseInt(match[2] || '0');
                        const seconds = parseInt(match[3] || '0');
                        const totalMinutes = hours * 60 + minutes + seconds / 60;

                        // Channel-specific duration thresholds
                        let minDuration = 15; // Default
                        if (handle === '@joanna-wiebe') minDuration = 7;
                        if (handle === '@GregIsenberg') minDuration = 25;

                        // Skip videos shorter than threshold
                        if (totalMinutes < minDuration) {
                            console.log(`Skipping short video (${Math.round(totalMinutes)}min < ${minDuration}m): ${title}`);
                            continue;
                        }
                    }
                }
            } catch (durationError) {
                console.log(`Could not check duration for: ${title}, processing anyway...`);
            }

            // 4. Check Recency (Last 2 months / 60 days)
            const publishedAt = video.snippet?.publishedAt;
            if (publishedAt) {
                const pubDate = new Date(publishedAt);
                const now = new Date();
                const diffDays = (now.getTime() - pubDate.getTime()) / (1000 * 3600 * 24);

                if (diffDays > 60) {
                    console.log(`Skipping old video (${Math.round(diffDays)} days ago > 60 days): ${title}`);
                    continue;
                }
            }

            const date = video.snippet?.publishedAt?.split('T')[0] || '2026-01-01';
            const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 50);
            const filename = `${date}-${cleanTitle}.md`;
            const filePath = path.join(postsDir, filename);

            if (fs.existsSync(filePath)) {
                console.log(`Skipping already processed (File match): ${title}`);
                continue;
            }

            console.log(`🎥 Found new video: ${title}`);

            // Get YouTube thumbnail (high quality)
            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

            try {
                console.log("   Fetching transcript...");
                const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
                const transcriptText = transcriptItems.map(item => item.text).join(' ');

                // Use the official channel title instead of the handle for display
                const authorName = video.snippet?.channelTitle || handle.replace('@', '');

                // Check if this is a Lenny's Podcast video
                const isLennyPodcast = authorName.toLowerCase().includes("lenny") &&
                    (authorName.toLowerCase().includes("podcast") || authorName.toLowerCase().includes("rachitsky"));

                if (isLennyPodcast) {
                    console.log(`🎙️ Detected Lenny's Podcast: ${title}`);

                    // Extract guest name from title with improved heuristics
                    // Common formats: 
                    // - "Guest Name: Topic" (most common)
                    // - "Topic | Guest Name"
                    // - "Guest Name | Topic"
                    let guestName = 'unknown-guest';

                    // First try colon separator (most reliable for Lenny's format)
                    if (title.includes(':')) {
                        const colonParts = title.split(':').map(p => p.trim());
                        const firstPart = colonParts[0];

                        // Check if first part looks like a name (contains capital letters, short, no common topic words)
                        const topicKeywords = ['how', 'why', 'what', 'the', 'this', 'best', 'secrets', 'guide', 'tips'];
                        const hasTopicKeyword = topicKeywords.some(kw => firstPart.toLowerCase().includes(kw));

                        if (!hasTopicKeyword && firstPart.length < 50 && firstPart.split(' ').length <= 5) {
                            guestName = firstPart;
                        }
                    }

                    // Fallback to pipe separator
                    if (guestName === 'unknown-guest' && title.includes('|')) {
                        const parts = title.split('|').map(p => p.trim());
                        // Heuristic: The guest name is usually the shorter part and doesn't contain question words
                        const sortedParts = parts.sort((a, b) => a.length - b.length);
                        for (const part of sortedParts) {
                            if (!part.toLowerCase().match(/\b(how|why|what|when|where)\b/) && part.length < 50) {
                                guestName = part;
                                break;
                            }
                        }
                    }

                    // Clean up the guest name
                    guestName = guestName
                        .replace(/\s*\(.*?\)\s*/g, '') // Remove parentheses content like "(2x unicorn founder)"
                        .replace(/\s*\[.*?\]\s*/g, '') // Remove brackets
                        .replace(/[""]/g, '') // Remove quotes
                        .trim();

                    console.log(`   Generating Lenny-style deep analysis...`);
                    const summaryText = await summarizeLennyVideo(guestName, transcriptText);

                    if (summaryText) {
                        const lennyFilename = `${date}-lenny-${guestName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 50)}.md`;
                        const lennyFilePath = path.join(postsDir, lennyFilename);

                        const lennyFileContent = `---
title: "Lenny's Podcast 笔记：${guestName} 深度访谈"
original_title: "${title.replace(/"/g, '\\"')}"
author: "Lenny's Podcast"
category: "生活与效率"
date: "${date}"
tags:
  - AI 与技术
  - 生活与效率
source_url: "https://www.youtube.com/watch?v=${videoId}"
---

${summaryText}
`;

                        fs.writeFileSync(lennyFilePath, lennyFileContent);
                        console.log(`✅ Saved Lenny episode: ${lennyFilename}`);
                        existingIds.add(videoId);
                        continue; // Skip normal Learning processing
                    } else {
                        console.log(`   ⚠️  Lenny analysis failed, falling back to normal processing`);
                    }
                }

                // Normal Learning video processing
                console.log("   Summarizing with Gemini...");
                const { hookTitle, category, summary } = await summarizeVideo(title, transcriptText);

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
                existingIds.add(videoId); // Add to set to prevent duplicate in same run

            } catch (err) {
                console.error(`   Failed to process ${title}: No transcript or error.`);
            }
        }
    }
}

fetchLatestVideos();
