
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
const GEMINI_API_KEY = process.env.gemini_api_key;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

const VIDEO_IDS = [
    '_HslddU8kwQ', // Perception vs Reality - 15M views
    'EUkenxUzlRo', // Jungian Psychology - 3M views
    'Kp2wWFO3BOE', // $100M Silicone Ring Story - 971k views
    '2UHLcJbgrJ4', // Timothee Chalamet Marketing - 2.6M views
    'AHXuHHwOBjk'  // Metaphysics for Self-Growth - 428k views
];

async function analyzeVideo(videoId: string) {
    console.log(`\n🔍 Analyzing video ID: ${videoId}...`);

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
        const views = video.statistics?.viewCount || '0';

        let transcript = '';
        try {
            const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
            transcript = transcriptItems.map(item => item.text).join(' ').substring(0, 10000); // Limit to 10k chars
        } catch (e) {
            console.log(`   (No transcript available for ${videoId}, using description)`);
            transcript = description;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `
你是一位顶级的 YouTube 爆款内容拆解专家和营销策略师。
我们将研究一个“低粉爆款”视频（粉丝极少但播放量惊人）。

**视频标题:** ${title}
**播放量:** ${views}
**内容片段/转录:** ${transcript}

请根据你的专业知识，给出以下深度的拆解：

1. **爆火原因 (The Why):** 为什么订阅者不到1万，播放量却能达到百万甚至千万？是中了什么算法趋势，还是解决了什么深刻的人性痛点？
2. **内容优势 (Content Edge):** 这个视频相比同类型的“平庸”视频，赢在哪里？（例如：视觉张力、讲故事的能力、独特的切入点、反直觉的观点等）
3. **结构框架 (Framework):** 视频的前10秒是如何留人的？中间是如何承接的？最后的结尾是如何引导互动或留存的？（给出结构模型，如：Hook -> Conflict -> Solution -> Payoff）
4. **受众与需求 (Audience & Needs):** 它的目标受众是谁？满足了受众的什么核心需求？（好奇心、焦虑缓解、金钱欲望、认同感、审美需求等）
5. **核心观点 (Core Insights):** 视频传递的最核心的一个真相或观点是什么？
6. **借镜与参考 (Benchmarks):** 作为内容创作者，我们可以从这个视频搬走哪3个具体的“武器”？（比如：特定的标题模版、剪辑节奏、甚至是一个特定的心理学效应的应用）

请用中文回答，排版清晰美观。
`;

        const result = await model.generateContent(prompt);
        return result.response.text();

    } catch (error) {
        console.error(`Error analyzing ${videoId}:`, error);
        return null;
    }
}

async function run() {
    const results = [];
    for (const id of VIDEO_IDS) {
        const analysis = await analyzeVideo(id);
        if (analysis) results.push(analysis);
    }

    const reportPath = path.join(process.cwd(), 'reports/gems/deep-analysis.md');
    const content = `# 🧬 YouTube 低粉爆款深度拆解报告\n\n` + results.join('\n\n---\n\n');

    fs.writeFileSync(reportPath, content);
    console.log(`\n✅ Deep analysis saved to: ${reportPath}`);
}

run();
