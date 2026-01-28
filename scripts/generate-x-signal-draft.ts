import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const RSSHUB_BASE_URL = 'http://localhost:1200';
const SOURCES_CONFIG_PATH = path.join(process.cwd(), 'config/x-sources.json');
const POSTS_DIR = path.join(process.cwd(), 'posts/x-signals');

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

// Helper: Get existing links from the last 7 days of posts to avoid duplicates
function getExistingLinks(): Set<string> {
    const existingLinks = new Set<string>();
    if (!fs.existsSync(POSTS_DIR)) return existingLinks;

    const files = fs.readdirSync(POSTS_DIR)
        .filter(f => f.endsWith('.md'))
        .sort()
        .reverse()
        .slice(0, 7); // Check last 7 files

    for (const file of files) {
        const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
        // Simple regex to find links (imperfect but good enough for dedupe)
        const links = content.match(/https?:\/\/(x\.com|twitter\.com)\/[a-zA-Z0-9_]+\/status\/\d+/g);
        if (links) {
            links.forEach(link => existingLinks.add(link));
        }
    }
    return existingLinks;
}

async function getSources(): Promise<string[]> {
    if (!fs.existsSync(SOURCES_CONFIG_PATH)) {
        console.error(`Config file not found: ${SOURCES_CONFIG_PATH}`);
        return [];
    }
    return JSON.parse(fs.readFileSync(SOURCES_CONFIG_PATH, 'utf-8'));
}

async function fetchTweetsFromSource(username: string): Promise<TweetItem[]> {
    const feedUrl = `${RSSHUB_BASE_URL}/twitter/user/${username}`;
    console.log(`Fetching ${username}...`);
    try {
        const feed = await parser.parseURL(feedUrl);
        // Filter for last 24 hours
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
        // console.error(`Error fetching ${username}:`, error);
        console.log(`Error fetching ${username}: Link unavailable (503/404)`);
        return [];
    }
}

async function generateDailySignal(tweets: TweetItem[], dateStr: string): Promise<string> {
    const tweetsText = tweets.map(t => `Author: ${t.author}\nContent: ${t.content}\nLink: ${t.link}\n---`).join('\n');

    const prompt = `
   You are "Potato", a tech-savvy, insightful curator of the "X Signal" daily newsletter.
   Your goal is to filter through the noise of Twitter and find the high-signal insights for your readers (Solopreneurs, AI enthusiasts, Builders).

   TODAY'S DATE: ${dateStr}

   INPUT TWEETS:
   ${tweetsText}

   TASK:
   1. Analyze the tweets and identify the top 3-5 most valuable, insightful, or trend-setting topics. Ignore noise, shitposting, or generic news.
   2. Categorize them into one of these standard sections (use only valid sections):
      - 🤖 AI & Future Tech
      - 💰 Wealth & Solo-preneurship
      - 📢 Marketing & Branding
      - 🧠 Wisdom & Productivity
   3. Draft the newsletter in valid Markdown.

   STYLE GUIDE:
   - **Important Viewpoint (重要观点)**: Extract the core insight. Be specific.
   - **Potato's Take**: Write a personal, conversational, yet professional reflection. Use "I" (as Potato).
   - **Language**: Chinese (Simplified).
   - **Structure**:
     For each section:
     ### [Section Icon] [Section Name]
     * [Emoji] **[Headline]**: [Author Name]([Source Link]) [Summary of the tweet/topic].
     * ...
     (Make sure to hyperlink the Author Name with the provided Link)

     **Potato's Take**

     重要观点
     [Explain the deep insight here. Why does this matter?]

     行动建议
     1. **[Action Item 1]**: [Specific advice]
     ...

     ---

   OUTPUT FORMAT:
   
   TITLE_BEST: [A single, punchy headline summarizing the most important trend today. Chinese.]
   ANCHOR_THOUGHT: [A 1-2 sentence overview of the whole daily signal. What's the vibe? Chinese.]
   CONTENT_START
   (The content sections in Markdown...)
   `;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

interface ParsedContent {
    titleBest: string;
    anchorThought: string;
    body: string;
}

function parseGeneratedContent(text: string): ParsedContent {
    const lines = text.split('\n');
    let titleBest = "Daily Signal";
    let anchorThought = "Insights from the X sphere.";
    let bodyLines: string[] = [];
    let isBody = false;

    for (const line of lines) {
        if (line.includes("CONTENT_START")) {
            isBody = true;
            continue;
        }
        if (line.includes("CONTENT_END")) {
            break;
        }
        if (isBody) {
            bodyLines.push(line);
        } else {
            if (line.startsWith("TITLE_BEST:")) titleBest = line.replace("TITLE_BEST:", "").trim();
            if (line.startsWith("ANCHOR_THOUGHT:")) anchorThought = line.replace("ANCHOR_THOUGHT:", "").trim();
        }
    }
    return { titleBest, anchorThought, body: bodyLines.join('\n').trim() };
}

async function main() {
    console.log("--- Starting X Signal Generation ---");
    const sources = await getSources();
    if (sources.length === 0) return;

    // 1. Fetch
    let allTweets: TweetItem[] = [];
    for (const source of sources) {
        const tweets = await fetchTweetsFromSource(source);
        allTweets = allTweets.concat(tweets);
    }

    // Mock Data Fallback
    if (process.env.MOCK_MODE === 'true' || allTweets.length === 0) {
        console.log("⚠️ No live tweets found. Using MOCK DATA...");
        allTweets = [
            {
                author: "naval",
                content: "Wealth is assets that earn while you sleep.",
                link: "https://x.com/naval/status/123456789",
                pubDate: new Date().toISOString()
            },
            {
                author: "paulg",
                content: "The best way to get rich is to start a startup.",
                link: "https://x.com/paulg/status/987654321",
                pubDate: new Date().toISOString()
            },
            {
                author: "karpathy",
                content: "AGI is just a matter of scale now. The gradients are flowing nicely.",
                link: "https://x.com/karpathy/status/1122334455",
                pubDate: new Date().toISOString()
            }
        ];
    }

    // 2. Deduplicate
    const existingLinks = getExistingLinks();
    const uniqueTweets = allTweets.filter(t => !existingLinks.has(t.link));

    console.log(`Fetched: ${allTweets.length}, Existing Links: ${existingLinks.size}, Unique: ${uniqueTweets.length}`);

    if (uniqueTweets.length === 0) {
        console.log("✅ No new unique tweets found today. Exiting.");
        return;
    }

    // 3. Generate Content
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    const localDate = new Date(today.getTime() - offset);
    const dateStr = localDate.toISOString().split('T')[0];
    const filename = `${dateStr}-daily-signals.md`;
    const filepath = path.join(POSTS_DIR, filename);

    // Initial File Template
    let fullContent = "";
    let isNewFile = false;

    // Generate Content & Metadata
    const rawContent = await generateDailySignal(uniqueTweets, dateStr);
    const { titleBest, anchorThought, body } = parseGeneratedContent(rawContent);

    if (!fs.existsSync(filepath)) {
        isNewFile = true;
        fullContent = `---
title: "Daily X Signals: ${dateStr}"
date: "${dateStr}"
category: "X Signal"
tags: ["X", "AI", "Wealth", "Productivity", "Entrepreneurship"]
title_best: "${titleBest}"
anchor_thought: "${anchorThought}"
---

> Daily Curator: Potato.

`;
        fullContent += body;
    } else {
        console.log(`File exists (${filename}). Appending new updates...`);
        fullContent = fs.readFileSync(filepath, 'utf-8');
        fullContent += `\n\n## 🔄 Update ${localDate.getHours()}:${localDate.getMinutes().toString().padStart(2, '0')}\n\n`;
        fullContent += body;
    }

    if (!fs.existsSync(POSTS_DIR)) {
        fs.mkdirSync(POSTS_DIR, { recursive: true });
    }

    fs.writeFileSync(filepath, fullContent);
    console.log(`✅ ${isNewFile ? 'Created' : 'Updated'} draft: ${filepath}`);
}

main().catch(console.error);
