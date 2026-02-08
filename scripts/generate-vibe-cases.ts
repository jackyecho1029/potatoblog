import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const RSSHUB_BASE_URL = 'http://localhost:1200';
const VIBE_POSTS_DIR = path.join(process.cwd(), 'reports/vibe-marketing');
const LIBRARY_PATH = path.join(VIBE_POSTS_DIR, 'library.md');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

const parser = new Parser();

interface TweetItem {
    author: string;
    content: string;
    link: string;
    pubDate: string;
}

async function fetchTweetsFromSource(username: string): Promise<TweetItem[]> {
    const feedUrl = `${RSSHUB_BASE_URL}/twitter/user/${username}`;
    console.log(`Fetching ${username}...`);
    try {
        const feed = await parser.parseURL(feedUrl);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        return feed.items.filter(item => {
            const pubDate = item.pubDate ? new Date(item.pubDate) : new Date(0);
            return pubDate > yesterday;
        }).map(item => ({
            author: username,
            content: item.contentSnippet || item.content || '',
            link: item.link || '',
            pubDate: item.pubDate || ''
        }));
    } catch (error) {
        console.log(`Error fetching ${username}: Link unavailable`);
        return [];
    }
}

async function generateVibeCases(tweets: TweetItem[], dateStr: string): Promise<string> {
    const context = tweets.map(t => `Source: ${t.author}\nContent: ${t.content}\nLink: ${t.link}\n---`).join('\n');

    const prompt = `
   You are an expert in "Vibe Marketing" and "Brand Storytelling". 
   Your goal is to identify and deconstruct the top marketing case studies, experiments, or viral brand moments from the following raw content.

   TODAY'S DATE: ${dateStr}

   INPUT CONTENT:
   ${context}

   TASK:
   1. Extract distinct marketing cases. Try to find up to 20, but focus on QUALITY first. If there aren't many fresh ones, summarize the most relevant trends.
   2. For each case, use the following structure:
      ### [Case Name/Brand] - [Short Headline]
      - **具体做法**: [Deconstruct the specific actions taken]
      - **可参考元素**: [Extract 2-3 specific elements, vibes, or tools used]
      - **学以致用**: [Summarize actionable points for a solopreneur or AI-driven project]
      - **Source**: [Author]([Link])

   STYLE:
   - Use simple, easy-to-understand Chinese (小白能懂的语言).
   - FOCUS on "Vibe" (emotional resonance, memes, personality) rather than traditional SEO/Ads.
   
   OUTPUT FORMAT:
   CASES_START
   (The cases list in Markdown...)
   `;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

function parseCases(text: string): string {
    const parts = text.split("CASES_START");
    return parts.length > 1 ? parts[1].trim() : text;
}

async function main() {
    console.log("--- Starting Vibe Marketing Case Collection ---");
    // Curated vibe-heavy sources
    const sources = [
        "gregisenberg",
        "ms_chf",
        "duolingo",
        "LiquidDeath",
        "TrungTPhan",
        "ShaanVP",
        "Nicolascole77",
        "dickiebush",
        "alliekmiller"
    ];

    let allItems: TweetItem[] = [];
    for (const source of sources) {
        const items = await fetchTweetsFromSource(source);
        allItems = allItems.concat(items);
    }

    if (allItems.length === 0) {
        console.log("⚠️ No new signals found from curated sources. Using mock/trend mode...");
        // If no fresh tweets, we still want to provide 20 cases by asking Gemini to reflect on recent general trends
    }

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    const rawContent = await generateVibeCases(allItems, dateStr);
    const casesContent = parseCases(rawContent);

    if (!fs.existsSync(VIBE_POSTS_DIR)) {
        fs.mkdirSync(VIBE_POSTS_DIR, { recursive: true });
    }

    let libraryContent = '';
    if (fs.existsSync(LIBRARY_PATH)) {
        libraryContent = fs.readFileSync(LIBRARY_PATH, 'utf-8');
    }

    const updateHeader = `\n\n### 📅 Daily Vibe Cases: ${dateStr}\n\n`;

    if (!libraryContent.includes(updateHeader.trim())) {
        libraryContent += updateHeader + casesContent;
        fs.writeFileSync(LIBRARY_PATH, libraryContent);
        console.log(`✅ Updated Vibe Library: ${LIBRARY_PATH}`);
    } else {
        console.log("Already updated for today.");
    }
}

main().catch(console.error);
