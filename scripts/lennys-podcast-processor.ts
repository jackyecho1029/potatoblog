import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

// Load environment variables
dotenv.config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

const BASE_RAW_URL = 'https://raw.githubusercontent.com/ChatPRD/lennys-podcast-transcripts/main/episodes';

function fetchDataWithRetry(url: string, retries = 3): Promise<string> {
    return new Promise((resolve, reject) => {
        const attempt = (n: number) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    if (data.includes('404: Not Found')) {
                        reject(new Error(`404 Not Found at ${url}`));
                    } else {
                        resolve(data);
                    }
                });
            }).on('error', (err) => {
                if (n > 0) {
                    console.log(`Retrying ${url} (${n} left)...`);
                    setTimeout(() => attempt(n - 1), 2000);
                } else {
                    reject(err);
                }
            });
        };
        attempt(retries);
    });
}

async function summarizeTranscript(guestName: string, transcript: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
你是一位顶级商业分析师和"一人公司"实战专家，深度推崇查理·芒格的多元思维模型和金字塔原理。
请深度剖析 Lenny's Podcast 的访谈文稿（受访者：${guestName}）。

### 要求：
1. **语言**：必须使用**简体中文**。
2. **核心原则**：
   - **金字塔原理**：结论先行，逻辑推进，案例支撑。
   - **查理·芒格思维**：挖掘其背后的思维模型（如反向思维、格栅效应、激励机制等）。
   - **AI/提效赋能**：特别聚焦 AI 前沿科技如何赋能生活、个人效率或**电商业务**。
   - **认知重构**：重点对比“旧时代观念” vs “AI 时代新现实”。

### 输出格式：
---
title: "Lenny's Podcast 笔记：${guestName} 深度访谈"
original_title: "Lenny's Podcast with ${guestName}"
author: "${guestName}"
category: "思维成长"
tags: ["LennyPodcast", "AI", "思维模型", "${guestName}"]
source_url: "[GitHub Raw Link]"
---

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
[3个简洁有力的下一步行动建议]

---
转录文稿内容：
${transcript.substring(0, 30000)}
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error(`Gemini Error for ${guestName}:`, error);
        return null;
    }
}

async function processEpisode(identifier: string) {
    try {
        const url = `${BASE_RAW_URL}/${identifier}/transcript.md`;
        console.log(`Processing: ${identifier}`);
        const transcript = await fetchDataWithRetry(url);

        console.log(`Summarizing ${identifier}...`);
        const summary = await summarizeTranscript(identifier, transcript);

        if (summary) {
            const date = new Date().toISOString().split('T')[0];
            const filename = `${date}-lenny-${identifier}.md`;
            const postsDir = path.join(process.cwd(), 'posts/learning');
            if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });

            const filePath = path.join(postsDir, filename);
            const finalContent = summary.replace('[GitHub Raw Link]', url);

            fs.writeFileSync(filePath, finalContent);
            console.log(`✅ Saved: ${filename}`);
        }
    } catch (error) {
        console.error(`❌ Failed ${identifier}:`, error.message);
    }
}

const targetEpisodes = process.argv.slice(2);

if (targetEpisodes.length === 0) {
    console.log("Usage: npx tsx scripts/lennys-podcast-processor.ts <episode-identifier1> ...");
} else {
    (async () => {
        for (const ep of targetEpisodes) {
            await processEpisode(ep);
        }
    })();
}
