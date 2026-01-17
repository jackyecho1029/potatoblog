import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const IMAGE_MODEL_ID = 'gemini-3-pro-image-preview'; // Nano Banana Pro

// Initialize Gemini for text (Prompt Engineering)
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const textModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

const POSTS_DIR = path.join(process.cwd(), 'posts/x-signals');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

async function getLatestPost(): Promise<string | null> {
    if (!fs.existsSync(POSTS_DIR)) return null;
    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).sort().reverse();
    return files.length > 0 ? path.join(POSTS_DIR, files[0]) : null;
}

async function generatePromptsForViewpoints(viewpoints: string[]): Promise<string[]> {
    const prompts: string[] = [];

    for (const viewpoint of viewpoints) {
        console.log(`   Generative Prompt for: "${viewpoint.substring(0, 30)}..."`);

        const systemInstruction = `
        You are an expert AI artist prompter.
        Task: Convert the provided "Important Viewpoint" text into a specific image generation prompt.
        Style Requirement: "Doraemon manga style" (Classic anime style, vibrant blue/white, thick outlines).
        Character: Doraemon (cute blue robot cat) interacting with futuristic or abstract concepts.
        Text Requirement: Include a short Chinese label in the image illustrating the key concept (max 4 chars).
        
        Input Text: "${viewpoint}"
        
        Output Format: Just the prompt string, nothing else.
        Example Output: A manga illustration in Doraemon style. Doraemon is holding a giant magnet labeled '吸引力' attracting coins. Background is a simple city.
        `;

        try {
            const result = await textModel.generateContent(systemInstruction);
            const response = await result.response;
            prompts.push(response.text().trim());
        } catch (e) {
            console.error("Error generating prompt:", e);
            prompts.push(""); // Fallback or skip
        }
    }
    return prompts;
}

// NEW: Simplify jargon-heavy content for AI beginners
async function simplifyContent(originalText: string): Promise<string> {
    console.log(`   Simplifying content for beginners...`);

    const styleGuide = `
    你是一位专业的科技内容编辑，擅长把复杂的 AI 概念翻译成普通人能懂的语言。

    ## 你的任务
    将下面的文字改写成 AI 小白也能秒懂的版本。

    ## 改写规则
    1. **专业术语必须加"人话翻译"**
       - 例如：LLM → "大语言模型（可以理解为一个读过整个互联网的超级读书人）"
       - 例如：Agentic AI → "智能体（不只会回答问题，还能自己动手干活的 AI）"
    2. **多用类比**
       - 用"就像...一样"来解释抽象概念
       - 例如：固态电池之于电池，就像抗生素之于医学——一种革命性突破
    3. **保持核心意思不变**，只是让表达更通俗
    4. **保留原有的 markdown 格式**（链接、加粗等）
    5. **语气要亲切**，像朋友在聊天

    ## 常见术语对照
    - LLM → 大语言模型（超级读书人）
    - Agentic → 智能体/代理式（能自己动手干活）
    - Prompt → 提示词（跟AI说话的方式）
    - Token → AI的阅读单位
    - Fine-tuning → 专项培训
    - API → 程序之间的沟通接口
    - Open Source → 开源（免费公开的代码）

    ## 原文
    ${originalText}

    ## 输出
    直接输出改写后的文字，不要加任何解释或前缀。
    `;

    try {
        const result = await textModel.generateContent(styleGuide);
        const response = await result.response;
        return response.text().trim();
    } catch (e) {
        console.error("Error simplifying content:", e);
        return originalText; // Fallback to original
    }
}

async function generateImage(prompt: string, outputPath: string) {
    if (!GEMINI_API_KEY) return;

    console.log(`   Generating Image... Prompt: ${prompt.substring(0, 50)}...`);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL_ID}:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
        contents: [{ parts: [{ text: prompt }] }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) throw new Error(response.statusText);

        const data = await response.json();
        const base64Image = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (base64Image) {
            fs.writeFileSync(outputPath, Buffer.from(base64Image, 'base64'));
            console.log(`   Saved to: ${outputPath}`);
            return true;
        }
    } catch (error) {
        console.error("   Image Generation Error:", error);
    }
    return false;
}

async function processPost(filePath: string) {
    console.log(`Processing file: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf-8');
    const date = path.basename(filePath).split('-daily')[0]; // e.g., 2026-01-08

    // Regex to find "重要观点" blocks and extract the text following them up to the next section or bold header
    // This is a bit tricky. Let's look for " **重要观点**" followed by text paragraphs.
    // We want to insert the image immediately AFTER "**重要观点**" line.

    const lines = content.split('\n');
    let newContentLines = [];
    let viewpointIndex = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip lines marked as replaced
        if (line === '___REPLACED___') continue;

        newContentLines.push(line);

        if (line.trim() === '**重要观点**' || line.trim() === '### 重要观点' || line.trim() === '重要观点') {
            // Check if image already exists next
            if (i + 1 < lines.length && lines[i + 1].trim().startsWith('![')) {
                console.log("   Skipping, image already exists.");
                continue;
            }

            // Extract context for prompt (next ~5 non-empty lines)
            let context = "";
            let contextStartIndex = i + 1;
            let contextEndIndex = i + 1;
            for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
                if (lines[j].trim().startsWith('#') || lines[j].trim().startsWith('---')) break;
                context += lines[j] + "\n";
                contextEndIndex = j;
            }
            context = context.trim();
            if (!context) continue;

            viewpointIndex++;
            console.log(`   Found Viewpoint ${viewpointIndex}`);

            // NEW: Simplify content for beginners
            const simplifiedContext = await simplifyContent(context);

            // Replace original lines with simplified version
            const simplifiedLines = simplifiedContext.split('\n');
            for (let k = contextStartIndex; k <= contextEndIndex; k++) {
                // Mark as replaced (will be skipped in output)
                lines[k] = '___REPLACED___';
            }

            // Generate Prompt
            const [prompt] = await generatePromptsForViewpoints([simplifiedContext]);
            if (!prompt) continue;

            // Generate Image
            const filename = `x-signal-${date}-v${viewpointIndex}.png`;
            const publicRelPath = `images/x-signals/${date}`;
            const fullDir = path.join(PUBLIC_DIR, publicRelPath);
            if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });

            const fullPath = path.join(fullDir, filename);
            const success = await generateImage(prompt, fullPath);

            if (success) {
                // Insert Image Markdown + Simplified Content
                const markdownImage = `\n![Viewpoint Visualization](/${publicRelPath.replace(/\\/g, '/')}/${filename})\n`;
                newContentLines.push(markdownImage);
                newContentLines.push(...simplifiedLines);
                newContentLines.push('');
            } else {
                // Fallback: just add simplified content without image
                newContentLines.push('');
                newContentLines.push(...simplifiedLines);
                newContentLines.push('');
            }
        }
    }

    const newContent = newContentLines.join('\n');
    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Updated ${filePath}`);
    } else {
        console.log("No changes made.");
    }
}

// Run
(async () => {
    const latestPost = await getLatestPost();
    if (latestPost) {
        await processPost(latestPost);
    } else {
        console.log("No X Signal posts found.");
    }
})();
