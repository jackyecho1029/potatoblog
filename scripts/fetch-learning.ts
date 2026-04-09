import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fetchTranscript } from './lib/transcript';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: '.env.local' });

const youtube = google.youtube('v3');
const YOUTUBE_API_KEYS = [
    process.env.YOUTUBE_API_KEY,
    process.env.YOUTUBE_API_KEY_2,
].filter(Boolean) as string[];
let currentKeyIndex = 0;
function getApiKey(): string {
    return YOUTUBE_API_KEYS[currentKeyIndex];
}
function switchToNextKey(): boolean {
    if (currentKeyIndex + 1 < YOUTUBE_API_KEYS.length) {
        currentKeyIndex++;
        console.log(`🔄 Switched to YouTube API Key #${currentKeyIndex + 1}`);
        return true;
    }
    return false;
}
function isQuotaError(err: any): boolean {
    return err?.response?.status === 403 ||
        err?.errors?.some((e: any) => e.reason === 'quotaExceeded');
}
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

const CHANNELS = process.env.YOUTUBE_CHANNELS?.split(',') || [];

async function getChannelId(handle: string) {
    try {
        const response = await youtube.search.list({
            key: getApiKey(),
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
你是一位頂級知識策展人和深度學習顧問。請嚴格按照以下結構深度解析這個視頻內容。

**原視頻標題:** "${originalTitle}"

---

---HOOK_TITLE_START---
[寫一個簡短有力的繁體中文標題，激發好奇心。例如：「為什麼90%的人永遠無法財務自由？」]
---HOOK_TITLE_END---

---CATEGORY_START---
[根據視頻內容選擇最合適的一個分類標籤，只能從以下選項中選擇一個：
思維成長 | 商業創業 | 健康生活 | 職場效率 | 人際關係 | 科技趨勢 | 投資理財 | 創意藝術]
---CATEGORY_END---

## 📋 Brief

[用2-3句話簡潔介紹這支視頻在講什麼，像是給朋友的一句話推薦。用繁體中文。]

---

## ⏱️ 內容分段導航

| 時間段 | 內容摘要 |
|--------|----------|
| [MM:SS] - [MM:SS] | [這段講了什麼，一句話] |
| [MM:SS] - [MM:SS] | [這段講了什麼] |
| [MM:SS] - [MM:SS] | [這段講了什麼] |
| [MM:SS] - [MM:SS] | [這段講了什麼] |
| [MM:SS] - [MM:SS] | [這段講了什麼] |

（請根據轉錄稿中的時間戳，合理劃分5-8個段落）

---

## 📖 詳細內容

### 01｜[第一段主題標題]

**核心觀點：** [2-3句話深度闡述這段的要點]

**重要原話：**
> "[最能代表這段觀點的原話，如果是英文請附上中文翻譯]"
>
> （原文：[English original quote，如果原文是中文則省略此行]）

**個人感受：** [1-2句話，用第一人稱，像跟朋友聊天一樣自然的感受]

**延伸思考：** [1-2句話，從這個點延伸出去的更大思考]

**可參考的行動：** [基於這個觀點，讀者可以馬上做的一件具體的事]

---

### 02｜[第二段主題標題]

（重複上述子結構：核心觀點 → 重要原話 → 個人感受 → 延伸思考 → 可參考的行動）

---

### 03｜[第三段主題標題]

（同上結構）

---

（以此類推，每個主要段落一個小節。通常3-6個小節）

---

## 💎 精華收穫

[用2-3句話總結整支視頻最大的價值，像是在書末寫的一段話]

---

**特別注意：**
1. 所有內容必須使用繁體中文（除了英文原文引用）
2. 在所有輸出內容中，請將「郵箱」替換為「電郵」，將「郵箱列表」替換為「電郵清單」
3. 不要生成任何URL鏈接
4. 請根據轉錄稿中的時間戳來標注內容分段的時間
5. 如果視頻是中文的，原話部分不需要附上「原文」行
6. 如果視頻是英文的，原話部分必須附上英文原文
7. 「可參考的行動」要非常具體，讀者看完就能直接做
8. 排版要有留白，不要太緊湊

**⚠️ 去除 AI 寫作痕跡（極其重要）：**
你必須讓所有文字讀起來像一個真實的人寫的，而不是 AI 生成的。嚴格遵守以下規則：

- **禁止 AI 高頻詞彙**：不得使用「此外」「至關重要」「深入探討」「格局」「充滿活力的」「織錦」「彰顯」「凸顯」「永恆的」「持久的」「開創性的」「深刻的」「寶貴的」「作為……的證明/體現」「為……奠定基礎」「不斷演變的格局」等 AI 味道濃厚的詞
- **禁止誇大象徵意義**：不要把任何小事包裝成「標誌著一個新時代」「反映了更廣泛的趨勢」。直接說具體的事實
- **禁止三段式排比**：不要總是把東西分成三個來列舉（「無縫、直觀且強大」），兩個或四個更好
- **禁止否定式排比**：不要用「這不僅僅是 X，而是 Y」的句式。直接說 Y
- **禁止模糊歸因**：不要說「專家認為」「研究顯示」卻不給具體來源。要麼具體引用，要麼用自己的話說
- **禁止宣傳語氣**：不要用「令人嘆為觀止」「必看」「迷人」「令人印象深刻」等廣告詞
- **變化句長**：短句和長句交錯使用。不要每句話都是一樣的長度和結構
- **直接了當**：不要繞圈子的開場白。直接說重點
- **用「我」的語氣**：個人感受部分要像真的人在跟朋友聊天，不是在寫維基百科
- **承認複雜性**：真實的感受不是非黑即白。可以說「這讓我興奮但也有點不安」而不是單純的「這令人印象深刻」
- **對感受要具體**：不要說「這令人擔憂」，要說「凌晨三點想到這件事會睡不著」這種具體的畫面

轉錄內容：
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
        const category = categoryMatch ? categoryMatch[1].trim() : '思維成長';

        // Remove the markers from summary
        let summary = text.replace(/---HOOK_TITLE_START---[\s\S]*?---HOOK_TITLE_END---/, '').trim();
        summary = summary.replace(/---CATEGORY_START---[\s\S]*?---CATEGORY_END---/, '').trim();

        return { hookTitle, category, summary };
    } catch (error) {
        console.error("Gemini Error:", error);
        return { hookTitle: originalTitle, category: '思維成長', summary: "AI Summarization Failed." };
    }
}

async function summarizeLennyVideo(guestName: string, transcriptText: string): Promise<string | null> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
你是一位頂級商業分析師和知識策展人，深度推崇查理·芒格的多元思維模型和金字塔原理。
請深度剖析 Lenny's Podcast 的訪談文稿（受訪者：${guestName}）。

嚴格按照以下結構輸出：

## 📋 Brief

[用2-3句話簡潔介紹這集訪談的核心主題和受訪者背景，像是給朋友的一句話推薦。用繁體中文。]

---

## ⏱️ 內容分段導航

| 時間段 | 內容摘要 |
|--------|----------|
| [MM:SS] - [MM:SS] | [這段講了什麼] |
| [MM:SS] - [MM:SS] | [這段講了什麼] |
| [MM:SS] - [MM:SS] | [這段講了什麼] |
| [MM:SS] - [MM:SS] | [這段講了什麼] |
| [MM:SS] - [MM:SS] | [這段講了什麼] |

（請根據轉錄稿中的時間戳，合理劃分5-8個段落）

---

## 📖 詳細內容

### 01｜[第一段主題標題]

**核心觀點：** [2-3句話深度闡述這段的要點，結合芒格思維模型分析]

**重要原話：**
> "[中文翻譯]"
>
> （原文：[English original quote]）

**個人感受：** [1-2句話，用第一人稱，像跟朋友聊天一樣自然的感受]

**延伸思考：** [1-2句話，從這個點延伸到AI時代、商業趨勢或個人成長的更大思考]

**可參考的行動：** [基於這個觀點，讀者可以馬上做的一件具體的事]

---

### 02｜[第二段主題標題]

（重複上述子結構）

---

（以此類推，每個主要段落一個小節。通常3-6個小節）

---

## 💎 精華收穫

[用2-3句話總結整集訪談最大的價值]

---

**特別注意：**
1. 所有內容必須使用繁體中文（除了英文原文引用）
2. 所有原話必須附上英文原文
3. 不要生成任何URL鏈接
4. 請根據轉錄稿中的時間戳來標注內容分段的時間
5. 聚焦 AI 前沿科技如何賦能生活、個人效率或電商業務
6. 重點對比「舊時代觀念」vs「AI 時代新現實」
7. 「可參考的行動」要非常具體，讀者看完就能直接做
8. 排版要有留白，不要太緊湊

**⚠️ 去除 AI 寫作痕跡（極其重要）：**
你必須讓所有文字讀起來像一個真實的人寫的，而不是 AI 生成的。嚴格遵守以下規則：

- **禁止 AI 高頻詞彙**：不得使用「此外」「至關重要」「深入探討」「格局」「充滿活力的」「織錦」「彰顯」「凸顯」「永恆的」「持久的」「開創性的」「深刻的」「寶貴的」「作為……的證明/體現」「為……奠定基礎」「不斷演變的格局」等 AI 味道濃厚的詞
- **禁止誇大象徵意義**：不要把任何小事包裝成「標誌著一個新時代」「反映了更廣泛的趨勢」。直接說具體的事實
- **禁止三段式排比**：不要總是把東西分成三個來列舉（「無縫、直觀且強大」），兩個或四個更好
- **禁止否定式排比**：不要用「這不僅僅是 X，而是 Y」的句式。直接說 Y
- **禁止模糊歸因**：不要說「專家認為」「研究顯示」卻不給具體來源。要麼具體引用，要麼用自己的話說
- **禁止宣傳語氣**：不要用「令人嘆為觀止」「必看」「迷人」「令人印象深刻」等廣告詞
- **變化句長**：短句和長句交錯使用。不要每句話都是一樣的長度和結構
- **直接了當**：不要繞圈子的開場白。直接說重點
- **用「我」的語氣**：個人感受部分要像真的人在跟朋友聊天，不是在寫維基百科
- **承認複雜性**：真實的感受不是非黑即白。可以說「這讓我興奮但也有點不安」而不是單純的「這令人印象深刻」
- **對感受要具體**：不要說「這令人擔憂」，要說「凌晨三點想到這件事會睡不著」這種具體的畫面

轉錄文稿內容：
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
    if (!YOUTUBE_API_KEYS.length || !GEMINI_API_KEY) {
        console.error('API Keys are missing');
        return;
    }

    try {
        const videoId = extractVideoId(videoUrl);
        if (!videoId) {
            console.error("Invalid YouTube URL: Could not extract video ID");
            return;
        }

        console.log(`Processing specific video: ${videoId}`);

        // Fetch video details to get title and channel
        const response = await youtube.videos.list({
            key: getApiKey(),
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
        const transcriptItems = await fetchTranscript(videoId);
        const transcriptText = transcriptItems.map(item => {
            // Add timestamps to transcript for Gemini context
            // We need to inject timestamps into the text for Gemini if we want it to use them.
            // The library returns {text: string, duration: number, offset: number}
            const minutes = Math.floor(item.offset / 60000);
            const seconds = Math.floor((item.offset % 60000) / 1000);
            const timeStr = `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}]`;
            return `${timeStr} ${item.text}`;
        }).join(' ');

        console.log("   Summarizing with Gemini...");
        
        // Use the official channel title instead of the handle for display
        const authorName = channelTitle;
        const isLennyPodcast = authorName.toLowerCase().includes("lenny") &&
            (authorName.toLowerCase().includes("podcast") || authorName.toLowerCase().includes("rachitsky"));

        if (isLennyPodcast) {
            console.log(`🎙️ Detected Lenny's Podcast: ${title}`);
            // Extract guest name from title
            let guestName = 'unknown-guest';
            if (title.includes(':')) {
                guestName = title.split(':')[0].trim();
            } else if (title.includes('|')) {
                const parts = title.split('|').map(p => p.trim());
                guestName = parts.sort((a, b) => a.length - b.length)[0];
            }
            
            guestName = guestName.replace(/\s*\(.*?\)\s*/g, '').replace(/\s*\[.*?\]\s*/g, '').trim();
            
            const summaryText = await summarizeLennyVideo(guestName, transcriptText);
            if (summaryText) {
                const lennyFilename = `${dateString}-lenny-${guestName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 50)}.md`;
                const lennyFilePath = path.join(postsDir, lennyFilename);
                const lennyFileContent = `---
title: "Lenny's Podcast 笔记：${guestName} 深度访谈"
original_title: "${title.replace(/"/g, '\\"')}"
author: "Lenny's Podcast"
category: "生活与效率"
date: "${dateString}"
tags: ["AI 与技术", "生活与效率"]
source_url: "https://www.youtube.com/watch?v=${videoId}"
---

${summaryText}`;
                fs.writeFileSync(lennyFilePath, lennyFileContent);
                console.log(`✅ Saved Lenny episode: ${lennyFilename}`);
                return;
            }
        }

        const { hookTitle, category, summary } = await summarizeVideo(title, transcriptText);
        const linkedSummary = linkTimestamp(summary, videoId);

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
    // Matches:
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // https://www.youtube.com/embed/VIDEO_ID
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
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
    if (specificUrl && (specificUrl.includes('youtube.com') || specificUrl.includes('youtu.be'))) {
        await fetchVideoByUrl(specificUrl);
        return;
    }

    if (!YOUTUBE_API_KEYS.length || !GEMINI_API_KEY) {
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

    for (let i = 0; i < CHANNELS.length; i++) {
      const handle = CHANNELS[i];
      try {
        const channelId = await getChannelId(handle);
        if (!channelId) continue;

        console.log(`Processing ${handle}...`);

        const response = await youtube.search.list({
            key: getApiKey(),
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
                    key: getApiKey(),
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
                const transcriptItems = await fetchTranscript(videoId);
                const transcriptText = transcriptItems.map(item => {
                    const minutes = Math.floor(item.offset / 60000);
                    const seconds = Math.floor((item.offset % 60000) / 1000);
                    const timeStr = `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}]`;
                    return `${timeStr} ${item.text}`;
                }).join(' ');

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
      } catch (err: any) {
        if (isQuotaError(err)) {
          if (switchToNextKey()) {
            console.log(`⚠️ Quota exceeded on ${handle}, retrying with next key...`);
            i--; // retry same channel with new key
            continue;
          }
          console.error(`⚠️ All YouTube API keys exceeded quota. Stopping.`);
          break;
        }
        console.error(`Error processing channel ${handle}: ${err?.message || err}`);
      }
    }
}

fetchLatestVideos();
