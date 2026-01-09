import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_ID = 'gemini-3-pro-image-preview'; // Nano Banana Pro
const OUTPUT_PATH = path.join(process.cwd(), 'public', 'ai-steam-engine.png');

async function generateImage() {
    if (!GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is missing');
        return;
    }

    // Use generateContent for Gemini models
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${GEMINI_API_KEY}`;

    // Prompt: Developer as Architect, AI as Steam Engine - Doraemon Style
    const prompt = "A manga illustration in the style of Doraemon. A blue robot cat (Doraemon) wearing a yellow construction helmet and holding a blueprint, standing proudly. He is controlling a giant, whimsical, complex steam engine machine that is building things automatically. The machine has a large sign or label in Chinese text: 'AI 蒸汽机'. Background: A futuristic city with flying gadgets. Style: Classic Doraemon anime style, colorful, cute, detailed machinery.";

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
