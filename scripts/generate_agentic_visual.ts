import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_ID = 'gemini-3-pro-image-preview'; // Nano Banana Pro
const OUTPUT_PATH = path.join(process.cwd(), 'public', 'agentic-shift-visual.png');

async function generateImage() {
    if (!GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is missing');
        return;
    }

    // Use generateContent for Gemini models
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${GEMINI_API_KEY}`;

    // Prompt design for "Chatbot vs Agentic AI" - Doraemon Style
    const prompt = "A split-screen manga illustration in the style of Doraemon. Left side: A cute blue robot cat (Doraemon) standing passively behind a counter, looking bored and waiting, with a speech bubble or label text in Chinese: '聊天机器人'. Right side: The same blue robot cat transformed into a super-agent with multiple futuristic gadgets and arms, busily building a city and sorting files, energetic expression. Label text in Chinese: '智能体'. Style: Classic Doraemon anime style, vibrant blue and white, thick outlines, fun and expressive.";

    // Gemini Image Generation Payload
    const requestBody = {
        contents: [
            {
                parts: [
                    { text: prompt }
                ]
            }
        ]
    };

    console.log(`Generating image with model: ${MODEL_ID}...`);
    console.log(`Prompt: ${prompt}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        // Check for inlineData (standard Gemini image response)
        const candidate = data.candidates?.[0];
        const part = candidate?.content?.parts?.[0];

        if (part && part.inlineData && part.inlineData.data) {
            const base64Image = part.inlineData.data;
            const buffer = Buffer.from(base64Image, 'base64');

            // Ensure public dir exists
            const publicDir = path.join(process.cwd(), 'public');
            if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
            }

            fs.writeFileSync(OUTPUT_PATH, buffer);
            console.log(`Success! Image saved to: ${OUTPUT_PATH}`);
        } else {
            console.log("Unexpected response structure:", JSON.stringify(data).substring(0, 500));
        }

    } catch (error) {
        console.error("Error generating image:", error);
    }
}

generateImage();
