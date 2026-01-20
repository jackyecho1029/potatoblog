import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

const LOCAL_EPISODES_DIR = 'D:/Antigravity/Jackypotato/lennys_transcripts/episodes';
const POSTS_DIR = path.join(process.cwd(), 'posts/learning');

async function summarizeTranscript(guestName: string, transcript: string, retries = 3) {
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

    for (let i = 0; i <= retries; i++) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error: any) {
            console.error(`Gemini Error for ${guestName} (Attempt ${i + 1}/${retries + 1}):`, error.message);
            if (i < retries) {
                const delay = Math.pow(2, i) * 2000;
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                return null;
            }
        }
    }
}

async function processEpisode(guestName: string) {
    const transcriptPath = path.join(LOCAL_EPISODES_DIR, guestName, 'transcript.md');

    // Check if transcript exists
    if (!fs.existsSync(transcriptPath)) {
        console.log(`⚠️ Transcript not found for ${guestName}, skipping.`);
        return;
    }

    // Check if already processed (idempotency)
    // We look for any file in POSTS_DIR that matches *lenny-${guestName}.md
    const existingFiles = fs.readdirSync(POSTS_DIR);
    const alreadyDone = existingFiles.find(f => f.includes(`lenny-${guestName}.md`));
    if (alreadyDone) {
        console.log(`⏩ Already processed ${guestName}, skipping.`);
        return;
    }

    try {
        console.log(`📄 Reading: ${guestName}`);
        const transcript = fs.readFileSync(transcriptPath, 'utf8');

        console.log(`🧠 AI Summarizing ${guestName}...`);
        const summary = await summarizeTranscript(guestName, transcript);

        if (summary) {
            const date = new Date().toISOString().split('T')[0];
            const filename = `${date}-lenny-${guestName}.md`;
            const filePath = path.join(POSTS_DIR, filename);

            fs.writeFileSync(filePath, summary);
            console.log(`✅ Saved: ${filename}`);
        }
    } catch (error: any) {
        console.error(`❌ Failed ${guestName}:`, error.message);
    }
}

async function main() {
    const args = process.argv.slice(2);

    if (args[0] === '--all') {
        process.stdout.write("Scanning episodes directory...\n");
        const allGuests = fs.readdirSync(LOCAL_EPISODES_DIR).filter(file => {
            return fs.statSync(path.join(LOCAL_EPISODES_DIR, file)).isDirectory();
        });

        console.log(`Found ${allGuests.length} episodes. Starting batch processing...`);

        // Process in small batches or sequence to avoid rate limits
        for (const guest of allGuests) {
            await processEpisode(guest);
            // Small delay to be polite to the API
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    } else if (args.length > 0) {
        for (const guest of args) {
            await processEpisode(guest);
        }
    } else {
        console.log("Usage:");
        console.log("  npx tsx scripts/lennys-podcast-processor.ts --all");
        console.log("  npx tsx scripts/lennys-podcast-processor.ts <guest-name> <guest-name2> ...");
    }
}

main().catch(console.error);
