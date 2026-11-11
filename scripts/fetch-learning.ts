import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fetchTranscript } from './lib/transcript';

// Load environment variables
dotenv.config({ path: '.env.local' });

/** YAML-safe scalar: single-quote + double internal single quotes.
 *  Robust against " and \ in titles/authors (the old \" escape broke on backslashes). */
function yq(s: string): string {
    return "'" + String(s).replace(/'/g, "''") + "'";
}

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
// GLM (Zhipu) via Anthropic-compatible gateway — replaces Mimo for summarization.
const GLM_API_KEY = process.env.GLM_API_KEY || process.env.ZHIPU_API_KEY;
const GLM_BASE_URL = process.env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/anthropic';
const GLM_MODEL = process.env.GLM_MODEL || 'glm-5.3-flash';

/** Summarize via GLM's Anthropic-compatible endpoint. GLM is a reasoning model
 *  whose response mixes `text` and `thinking` blocks; we disable thinking (faster,
 *  and avoids max_tokens contention on long transcripts) and keep only the text. */
async function summarizeWithGLM(prompt: string): Promise<string> {
    const response = await fetch(`${GLM_BASE_URL}/v1/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GLM_API_KEY}`,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            model: GLM_MODEL,
            max_tokens: 16000,
            thinking: { type: 'disabled' },
            messages: [{ role: 'user', content: prompt }],
        }),
    });
    if (!response.ok) {
        throw new Error(`GLM API error ${response.status}: ${await response.text()}`);
    }
    const data: any = await response.json();
    const text = (data.content || [])
        .filter((b: any) => b.type === 'text')
        .map((b: any) => b.text || '')
        .join('');
    if (!text) throw new Error('GLM returned no text content');
    return text;
}

const CHANNELS = process.env.YOUTUBE_CHANNELS?.split(',') || [];
// Max age (in days) of a video to be processed. Default 60. Override via MAX_DAYS env var.
const MAX_DAYS = parseInt(process.env.MAX_DAYS || '60', 10);

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

// Fetch the uploads playlist ID for a channel (the authoritative, paginated list
// of its videos — unlike search.list, it surfaces every upload, not just the newest 20).
async function getUploadsPlaylist(channelId: string): Promise<string | null> {
    try {
        const response = await youtube.channels.list({
            key: getApiKey(),
            part: ['contentDetails'],
            id: [channelId],
        });
        return response.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads || null;
    } catch (error) {
        console.error(`Error fetching uploads playlist for ${channelId}:`, error);
        return null;
    }
}

// Paginate a channel's uploads playlist (newest-first), collecting videos published
// within the last MAX_DAYS. Stops early once it crosses the age cutoff. This replaces
// the old search.list(maxResults:20) call that silently dropped long-form videos
// buried under a flood of Shorts.
async function listUploadVideos(uploadsPlaylistId: string): Promise<{ videoId: string; title: string; publishedAt: string }[]> {
    const results: { videoId: string; title: string; publishedAt: string }[] = [];
    const cutoffMs = Date.now() - MAX_DAYS * 24 * 3600 * 1000;
    let pageToken: string | undefined;
    let pageCount = 0;
    const MAX_PAGES = 10; // safety cap (10 pages × 50 = 500 videos)
    do {
        const response: any = await youtube.playlistItems.list({
            key: getApiKey(),
            part: ['snippet', 'contentDetails'],
            playlistId: uploadsPlaylistId,
            maxResults: 50,
            ...(pageToken ? { pageToken } : {}),
        });
        const items = response.data.items || [];
        let reachedOld = false;
        for (const it of items) {
            const videoId = it.contentDetails?.videoId;
            const title = it.snippet?.title || 'Unknown Title';
            const publishedAt = it.contentDetails?.videoPublishedAt || it.snippet?.publishedAt || '';
            if (!videoId) continue;
            // uploads playlist is newest-first: once we hit a video older than cutoff, stop.
            if (publishedAt) {
                const ts = new Date(publishedAt).getTime();
                if (ts < cutoffMs) {
                    reachedOld = true;
                    break;
                }
            }
            results.push({ videoId, title, publishedAt });
        }
        if (reachedOld) break;
        pageToken = response.data.nextPageToken;
        pageCount++;
    } while (pageToken && pageCount < MAX_PAGES);
    return results;
}

async function summarizeVideo(originalTitle: string, transcriptText: string): Promise<{ hookTitle: string, category: string, summary: string }> {
    const prompt = `
你是一位顶级知识策展人和深度学习顾问。请严格按照以下结构深度解析这个视频内容。

**原视频标题:** "${originalTitle}"

---

---HOOK_TITLE_START---
[写一个简短有力的简体中文标题，激发好奇心。例如：「为什么90%的人永远无法财务自由？」]
---HOOK_TITLE_END---

---CATEGORY_START---
[根据视频内容选择最合适的一个分类标签，只能从以下选项中选择一个：
思维成长 | 商业创业 | 健康生活 | 职场效率 | 人际关系 | 科技趋势 | 投资理财 | 创意艺术]
---CATEGORY_END---

## 📋 Brief

[用2-3句话简洁介绍这支视频在讲什么，像是给朋友的一句话推荐。用简体中文。]

---

## ⏱️ 内容分段导航

| 时间段 | 内容摘要 |
|--------|----------|
| [MM:SS] - [MM:SS] | [这段讲了什么，一句话] |
| [MM:SS] - [MM:SS] | [这段讲了什么] |
| [MM:SS] - [MM:SS] | [这段讲了什么] |
| [MM:SS] - [MM:SS] | [这段讲了什么] |
| [MM:SS] - [MM:SS] | [这段讲了什么] |

（请根据转录稿中的时间戳，合理划分5-8个段落）

---

## 📖 详细内容

### 01｜[第一段主题标题]

**核心观点：** [2-3句话深度阐述这段的要点]

**重要原话：**
> "[最能代表这段观点的原话，如果是英文请附上中文翻译]"
>
> （原文：[English original quote，如果原文是中文则省略此行]）

**个人感受：** [1-2句话，用第一人称，像跟朋友聊天一样自然的感受]

**延伸思考：** [1-2句话，从这个点延伸出去的更大思考]

**可参考的行动：** [基于这个观点，读者可以马上做的一件具体的事]

---

### 02｜[第二段主题标题]

（重复上述子结构：核心观点 → 重要原话 → 个人感受 → 延伸思考 → 可参考的行动）

---

### 03｜[第三段主题标题]

（同上结构）

---

（以此类推，每个主要段落一个小节。通常3-6个小节）

---

## 🧭 导师带你想：他最想让你带走的 3-5 课

（想象说话者是你的导师。他讲这么多，真正想让你学会的是哪 3-5 件事？每一课按以下结构写。）

### 第一课｜[一句话课题]

**他想让你先想一想：** [一个引发思考的问题，让读者先停下来自己想，而不是直接给答案]

**他的答案（术）：** [他给出的具体方法、工具或做法，讲清楚怎么做]

**学以致用：** [这周就能做的一个练习，写清楚做什么、做多久、在什么场景做]

**怎么知道学会了：** [一个可观察的检验标准，例如「能用自己的话向别人解释 X」「连续 7 天做到 Y」]

（第二课到第五课重复以上结构，总共 3-5 课，宁缺毋滥）

---

## 🌳 背后的道：他的思想「树干」

（前面的观点都是枝叶。这里要挖出让他长出这些观点的根和树干。要从他的原话、经历和反复出现的主题中推导，不要套用空泛的大道理。）

**树根｜他最底层的信念：** [他对世界、人性或成功最根本的一两个判断。例如「人会高估短期、低估长期」]

**树干｜核心思考框架：** [贯穿整个视频的那一条主逻辑，用「因为……所以……于是……」的推理链写出来，再给它起一个好记的名字]

**枝叶对照：**

| 他的观点（枝叶） | 是怎么从树干长出来的 |
|------------------|----------------------|
| [观点一] | [推导关系] |
| [观点二] | [推导关系] |
| [观点三] | [推导关系] |

**这棵树的边界：** [这套框架在什么情况下不适用，或者他可能忽略了什么。要具体，给出反例或适用前提]

**带走一句心法：** [把树干压缩成一句能贴在桌前的话]

---

## 💎 精华收获

[用2-3句话总结整支视频最大的价值，像是在书末写的一段话]

---

**特别注意：**
1. 所有内容必须使用简体中文（除了英文原文引用），严禁出现任何繁体字
2. 在所有输出内容中，请将「邮箱」替换为「电邮」，将「邮箱列表」替换为「电邮清单」
3. 不要生成任何URL链接
4. 请根据转录稿中的时间戳来标注内容分段的时间
5. 如果视频是中文的，原话部分不需要附上「原文」行
6. 如果视频是英文的，原话部分必须附上英文原文
7. 「可参考的行动」要非常具体，读者看完就能直接做
8. 排版要有留白，不要太紧凑

**⚠️ 去除 AI 写作痕迹（极其重要）：**
你必须让所有文字读起来像一个真实的人写的，而不是 AI 生成的。严格遵守以下规则：

- **禁止 AI 高频词汇**：不得使用「此外」「至关重要」「深入探讨」「格局」「充满活力的」「织锦」「彰显」「凸显」「永恒的」「持久的」「开创性的」「深刻的」「宝贵的」「作为……的证明/体现」「为……奠定基础」「不断演变的格局」等 AI 味道浓厚的词
- **禁止夸大象征意义**：不要把任何小事包装成「标志著一个新时代」「反映了更广泛的趋势」。直接说具体的事实
- **禁止三段式排比**：不要总是把东西分成三个来列举（「无缝、直观且强大」），两个或四个更好
- **禁止否定式排比**：不要用「这不仅仅是 X，而是 Y」的句式。直接说 Y
- **禁止模糊归因**：不要说「专家认为」「研究显示」却不给具体来源。要么具体引用，要么用自己的话说
- **禁止宣传语气**：不要用「令人叹为观止」「必看」「迷人」「令人印象深刻」等广告词
- **变化句长**：短句和长句交错使用。不要每句话都是一样的长度和结构
- **直接了当**：不要绕圈子的开场白。直接说重点
- **用「我」的语气**：个人感受部分要像真的人在跟朋友聊天，不是在写维基百科
- **承认复杂性**：真实的感受不是非黑即白。可以说「这让我兴奋但也有点不安」而不是单纯的「这令人印象深刻」
- **对感受要具体**：不要说「这令人担忧」，要说「凌晨三点想到这件事会睡不著」这种具体的画面

转录内容：
${transcriptText.substring(0, 25000)}
`;

    try {
        const text = await summarizeWithGLM(prompt);

        // Extract hook title / category. GLM sometimes renders the `---X---` markers
        // as `**X**`, so accept either delimiter.
        const M = '(?:-{3}|\\*{2})';
        const block = (name: string) => new RegExp(`${M}${name}_START${M}([\\s\\S]*?)${M}${name}_END${M}`);
        const titleMatch = text.match(block('HOOK_TITLE'));
        const hookTitle = titleMatch ? titleMatch[1].trim() : originalTitle;

        const categoryMatch = text.match(block('CATEGORY'));
        const category = categoryMatch ? categoryMatch[1].trim() : '思维成长';

        // Remove the markers from summary
        let summary = text.replace(block('HOOK_TITLE'), '').trim();
        summary = summary.replace(block('CATEGORY'), '').trim();

        return { hookTitle, category, summary };
    } catch (error) {
        console.error("GLM Error:", error);
        return { hookTitle: originalTitle, category: '思维成长', summary: "AI Summarization Failed." };
    }
}

async function summarizeLennyVideo(guestName: string, transcriptText: string): Promise<string | null> {
    const prompt = `
你是一位顶级商业分析师和知识策展人，深度推崇查理·芒格的多元思维模型和金字塔原理。
请深度剖析 Lenny's Podcast 的访谈文稿（受访者：${guestName}）。

严格按照以下结构输出：

## 📋 Brief

[用2-3句话简洁介绍这集访谈的核心主题和受访者背景，像是给朋友的一句话推荐。用简体中文。]

---

## ⏱️ 内容分段导航

| 时间段 | 内容摘要 |
|--------|----------|
| [MM:SS] - [MM:SS] | [这段讲了什么] |
| [MM:SS] - [MM:SS] | [这段讲了什么] |
| [MM:SS] - [MM:SS] | [这段讲了什么] |
| [MM:SS] - [MM:SS] | [这段讲了什么] |
| [MM:SS] - [MM:SS] | [这段讲了什么] |

（请根据转录稿中的时间戳，合理划分5-8个段落）

---

## 📖 详细内容

### 01｜[第一段主题标题]

**核心观点：** [2-3句话深度阐述这段的要点，结合芒格思维模型分析]

**重要原话：**
> "[中文翻译]"
>
> （原文：[English original quote]）

**个人感受：** [1-2句话，用第一人称，像跟朋友聊天一样自然的感受]

**延伸思考：** [1-2句话，从这个点延伸到AI时代、商业趋势或个人成长的更大思考]

**可参考的行动：** [基于这个观点，读者可以马上做的一件具体的事]

---

### 02｜[第二段主题标题]

（重复上述子结构）

---

（以此类推，每个主要段落一个小节。通常3-6个小节）

---

## 🧭 导师带你想：他最想让你带走的 3-5 课

（想象说话者是你的导师。他讲这么多，真正想让你学会的是哪 3-5 件事？每一课按以下结构写。）

### 第一课｜[一句话课题]

**他想让你先想一想：** [一个引发思考的问题，让读者先停下来自己想，而不是直接给答案]

**他的答案（术）：** [他给出的具体方法、工具或做法，讲清楚怎么做]

**学以致用：** [这周就能做的一个练习，写清楚做什么、做多久、在什么场景做]

**怎么知道学会了：** [一个可观察的检验标准，例如「能用自己的话向别人解释 X」「连续 7 天做到 Y」]

（第二课到第五课重复以上结构，总共 3-5 课，宁缺毋滥）

---

## 🌳 背后的道：他的思想「树干」

（前面的观点都是枝叶。这里要挖出让他长出这些观点的根和树干。要从他的原话、经历和反复出现的主题中推导，不要套用空泛的大道理。）

**树根｜他最底层的信念：** [他对世界、人性或成功最根本的一两个判断。例如「人会高估短期、低估长期」]

**树干｜核心思考框架：** [贯穿整个访谈的那一条主逻辑，用「因为……所以……于是……」的推理链写出来，再给它起一个好记的名字]

**枝叶对照：**

| 他的观点（枝叶） | 是怎么从树干长出来的 |
|------------------|----------------------|
| [观点一] | [推导关系] |
| [观点二] | [推导关系] |
| [观点三] | [推导关系] |

**这棵树的边界：** [这套框架在什么情况下不适用，或者他可能忽略了什么。要具体，给出反例或适用前提]

**带走一句心法：** [把树干压缩成一句能贴在桌前的话]

---

## 💎 精华收获

[用2-3句话总结整集访谈最大的价值]

---

**特别注意：**
1. 所有内容必须使用简体中文（除了英文原文引用），严禁出现任何繁体字
2. 所有原话必须附上英文原文
3. 不要生成任何URL链接
4. 请根据转录稿中的时间戳来标注内容分段的时间
5. 聚焦 AI 前沿科技如何赋能生活、个人效率或电商业务
6. 重点对比「旧时代观念」vs「AI 时代新现实」
7. 「可参考的行动」要非常具体，读者看完就能直接做
8. 排版要有留白，不要太紧凑

**⚠️ 去除 AI 写作痕迹（极其重要）：**
你必须让所有文字读起来像一个真实的人写的，而不是 AI 生成的。严格遵守以下规则：

- **禁止 AI 高频词汇**：不得使用「此外」「至关重要」「深入探讨」「格局」「充满活力的」「织锦」「彰显」「凸显」「永恒的」「持久的」「开创性的」「深刻的」「宝贵的」「作为……的证明/体现」「为……奠定基础」「不断演变的格局」等 AI 味道浓厚的词
- **禁止夸大象征意义**：不要把任何小事包装成「标志著一个新时代」「反映了更广泛的趋势」。直接说具体的事实
- **禁止三段式排比**：不要总是把东西分成三个来列举（「无缝、直观且强大」），两个或四个更好
- **禁止否定式排比**：不要用「这不仅仅是 X，而是 Y」的句式。直接说 Y
- **禁止模糊归因**：不要说「专家认为」「研究显示」却不给具体来源。要么具体引用，要么用自己的话说
- **禁止宣传语气**：不要用「令人叹为观止」「必看」「迷人」「令人印象深刻」等广告词
- **变化句长**：短句和长句交错使用。不要每句话都是一样的长度和结构
- **直接了当**：不要绕圈子的开场白。直接说重点
- **用「我」的语气**：个人感受部分要像真的人在跟朋友聊天，不是在写维基百科
- **承认复杂性**：真实的感受不是非黑即白。可以说「这让我兴奋但也有点不安」而不是单纯的「这令人印象深刻」
- **对感受要具体**：不要说「这令人担忧」，要说「凌晨三点想到这件事会睡不著」这种具体的画面

转录文稿内容：
${transcriptText.substring(0, 30000)}
    `;

    try {
        return await summarizeWithGLM(prompt);
    } catch (error) {
        console.error("GLM Error for Lenny:", error);
        return null;
    }
}


async function fetchVideoByUrl(videoUrl: string) {
    if (!YOUTUBE_API_KEYS.length || !GLM_API_KEY) {
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

        console.log("   Summarizing with GLM...");
        
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
title: ${yq(`Lenny's Podcast 笔记：${guestName} 深度访谈`)}
original_title: ${yq(title)}
author: ${yq("Lenny's Podcast")}
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
title: ${yq(hookTitle)}
original_title: ${yq(title)}
author: ${yq(authorName)}
category: ${yq(category)}
date: "${dateString}"
tags: [${yq(category)}, ${yq(authorName)}]
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

    if (!YOUTUBE_API_KEYS.length || !GLM_API_KEY) {
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

        // Use the channel's uploads playlist with pagination (newest-first) instead of
        // search.list(maxResults:20), which missed long-form videos buried under Shorts.
        const uploadsId = await getUploadsPlaylist(channelId);
        if (!uploadsId) {
            console.log(`Could not find uploads playlist for ${handle}, skipping.`);
            continue;
        }
        const videos = await listUploadVideos(uploadsId);

        for (const video of videos) {
            const videoId = video.videoId;
            const title = video.title;

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

            // 4. Check Recency (Last MAX_DAYS, default 60)
            // (listUploadVideos already filters by MAX_DAYS; this is a defensive re-check.)
            const publishedAt = video.publishedAt;
            if (publishedAt) {
                const pubDate = new Date(publishedAt);
                const now = new Date();
                const diffDays = (now.getTime() - pubDate.getTime()) / (1000 * 3600 * 24);

                if (diffDays > MAX_DAYS) {
                    console.log(`Skipping old video (${Math.round(diffDays)} days ago > ${MAX_DAYS} days): ${title}`);
                    continue;
                }
            }

            const date = video.publishedAt?.split('T')[0] || '2026-01-01';
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
title: ${yq(`Lenny's Podcast 笔记：${guestName} 深度访谈`)}
original_title: ${yq(title)}
author: ${yq("Lenny's Podcast")}
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
                console.log("   Summarizing with GLM...");
                const { hookTitle, category, summary } = await summarizeVideo(title, transcriptText);

                const fileContent = `---
title: ${yq(hookTitle)}
original_title: ${yq(title)}
author: ${yq(authorName)}
category: ${yq(category)}
date: "${date}"
tags: [${yq(category)}, ${yq(authorName)}]
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

            } catch (err: any) {
                console.error(`   Failed to process ${title}: ${err?.message || 'No transcript or error.'}`);
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

async function commitAndPushChanges() {
    // NO_PUSH=1: generate posts locally only, so they can be reviewed before publishing.
    if (process.env.NO_PUSH === '1') {
        console.log('ℹ️  NO_PUSH=1 — skipping commit/push.');
        return;
    }
    const { execSync } = await import('child_process');
    const postsDir = path.join(process.cwd(), 'posts/learning');

    try {
        // Check if there are new learning posts to commit
        const status = execSync('git status --short posts/learning/', { encoding: 'utf-8' });
        if (!status.trim()) {
            console.log('ℹ️  No new learning posts to commit.');
            return;
        }

        console.log('\n📤 Committing and pushing new posts to blog...');

        // Stage all learning posts
        execSync('git add posts/learning/', { encoding: 'utf-8' });

        // Get list of new files for commit message
        const newFiles = status.split('\n')
            .filter(line => line.includes('??'))
            .map(line => line.replace('??', '').trim())
            .map(f => path.basename(f));

        const commitMsg = `feat: add ${newFiles.length} new learning video(s)

${newFiles.map(f => `- ${f}`).join('\n')}

[skip ci]`;

        // Commit with detailed message
        execSync(`git commit -m "${commitMsg}"`, { encoding: 'utf-8' });
        console.log('✅ Committed new posts');

        // Push to remote (handle potential conflicts)
        try {
            execSync('git pull --rebase', { encoding: 'utf-8' });
            execSync('git push', { encoding: 'utf-8' });
            console.log('✅ Pushed to blog! Vercel is deploying...');
        } catch (pushErr) {
            console.log('⚠️  Push failed. You may need to resolve conflicts manually.');
            console.log('Run: git pull --rebase && git push');
        }

    } catch (error: any) {
        // Git command failed (might be no changes or other error)
        if (error.message?.includes('nothing to commit')) {
            console.log('ℹ️  No new posts to commit.');
        } else {
            console.error('⚠️  Git operation failed:', error.message);
        }
    }
}

// Run fetch and then commit/push
fetchLatestVideos().then(() => {
    commitAndPushChanges();
}).catch(err => {
    console.error('Script error:', err);
    process.exit(1);
});
