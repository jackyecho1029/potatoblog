
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

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

async function analyzeLongVideo(videoId: string) {
    console.log(`\n🕵️‍♂️ Deep Analyzing Long Video: ${videoId}...`);

    try {
        const videoResponse = await youtube.videos.list({
            key: YOUTUBE_API_KEY,
            part: ['snippet', 'statistics'],
            id: [videoId]
        });

        const video = videoResponse.data.items?.[0];
        if (!video) return null;

        const title = video.snippet?.title || '';
        const description = video.snippet?.description || '';
        const views = parseInt(video.statistics?.viewCount || '0').toLocaleString();
        const url = `https://www.youtube.com/watch?v=${videoId}`;

        // Increase transcript limit for long videos
        let transcript = '';
        try {
            const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
            transcript = transcriptItems.map(item => item.text).join(' ').substring(0, 15000);
        } catch (e) {
            console.log(`   (No transcript available, using description)`);
            transcript = description;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `
你是一位资深的内容商业分析师和深度学习专家。
我们将拆解一个长篇（>6分钟）的“低粉爆款”视频。这种视频能吸引精准流量并建立深厚的信任。

**视频标题:** ${title}
**播放量:** ${views}
**内容转录/描述:** ${transcript}

请根据你的专业洞察，提供以下深度的拆解：

1. **核心价值主张 (Value Proposition):** 为什么观众愿意拿出10分钟甚至更久来看这个视频？它提供了什么不可替代的深度价值？
2. **知识密度与结构 (Knowledge Architecture):** 请拆解视频的内容大纲。它是如何一步步分层展开论点的？
3. **留存钩子 (Retention Mastery):** 在长视频中，它是如何防止观众中途划走的？（关键的转折点、视觉符号或悬念设置）
4. **情感链路 (Emotional Journey):** 视频是如何调动观众情绪，并最终建立对博主/品牌的强烈认同感的？
5. **黄金结论 (Key Takeaways):** 视频最值得被记录并传播的 3 个核心金句或深度见解。
6. **可落地的“长文案/长视频”战术 (Actionable Tactics):** 如果我们要制作类似深度的内容，可以复刻哪 3 个具体的结构或叙事技巧？

请用中文回答，排版要像一篇精美的深度观察文章。开头请注明原视频链接：${url}
`;

        const result = await model.generateContent(prompt);
        return result.response.text();

    } catch (error: any) {
        console.error(`Error analyzing ${videoId}:`, error?.response?.data || error.message || error);
        return null;
    }
}

async function run() {
    const topIdsFile = path.join(process.cwd(), 'reports/gems/top-long-ids.json');
    let videoIds = [];

    if (fs.existsSync(topIdsFile)) {
        videoIds = JSON.parse(fs.readFileSync(topIdsFile, 'utf8'));
    } else {
        console.error('❌ top-long-ids.json not found.');
        process.exit(1);
    }

    const results = [];
    if (videoIds.length === 0) {
        console.log("📭 No new long-form gems to analyze today.");
        return;
    }

    for (const id of videoIds) {
        const analysis = await analyzeLongVideo(id);
        if (analysis) results.push(analysis);
    }

    const date = new Date().toISOString().split('T')[0];

    // Save as Blog Post (Saturday Edition)
    const blogPostPath = path.join(process.cwd(), `posts/${date}-long-form-gems-deep-dive.md`);
    const blogContent = `---
title: "🎥 周六深研：低粉长视频如何建立深度影响力 (${date})"
author: "Antigravity Depth Analyst"
category: "商业洞察"
date: "${date}"
tags: ["YouTube", "深度学习", "内容战略", "长内容爆款"]
---

# YouTube 潜力长视频深度拆解

这是 **Saturday Depth Edition**，专注于挖掘那些时长超过 6 分钟、在小频道中爆发的深度好内容。

相比短视频，长视频的爆发更依赖于**结构化的内容魅力**和**深度的价值交付**。

` + results.join('\n\n---\n\n') + `

---
*Created by Saturday Depth Automation Pipeline*
`;

    fs.writeFileSync(blogPostPath, blogContent);
    console.log(`\n✅ Saturday Blog post generated: ${blogPostPath}`);
}

run();
