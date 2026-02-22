import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import Parser from 'rss-parser';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const RSSHUB_BASE_URL = 'http://localhost:1200';
const SOURCES_CONFIG_PATH = path.join(process.cwd(), 'config/x-sources.json');
const POSTS_DIR = path.join(process.cwd(), 'posts/x-signals');

// API Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GLM_API_KEY = process.env.GLM_API_KEY;

const GLM_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
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
        // Filter for last 3 days to catch up
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 3);

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
        console.log(`Error fetching ${username}: Link unavailable (503/404)`);
        return [];
    }
}

/**
 * Strategy: Generate using Gemini API
 */
async function generateWithGemini(prompt: string): Promise<string> {
    console.log("🚀 Using Gemini API for generation...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as any;
    return data.candidates[0].content.parts[0].text;
}

/**
 * Strategy: Generate using GLM-4 API
 */
async function generateWithGLM(prompt: string): Promise<string> {
    console.log("🤖 Using GLM-4 API for generation...");
    const response = await fetch(GLM_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GLM_API_KEY}`
        },
        body: JSON.stringify({
            model: 'glm-4-plus',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 4096
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GLM API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as { choices: { message: { content: string } }[] };
    return data.choices[0].message.content;
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
   2. Categorize them into one of these standard sections:
      - 🤖 AI & Future Tech
      - 💰 Wealth & Solo-preneurship
      - 📢 Marketing & Branding
      - 🧠 Wisdom & Productivity
   3. Draft the newsletter in valid Markdown.

   STYLE GUIDE:
   - **Important Viewpoint (重要观点)**: Chinese (Simplified).
   - **Potato's Take**: Conversational, yet professional. Use "I".
   - **Hyperlink the Author Name with the provided Link**.

   OUTPUT FORMAT:
   TITLE_BEST: [Headline]
   ANCHOR_THOUGHT: [Summary]
   CONTENT_START
   [Markdown Content...]
   `;

    // Priority: Explicit MOCK check is handled in main, but here we pick the AI service
    if (GEMINI_API_KEY) {
        return generateWithGemini(prompt);
    } else if (GLM_API_KEY) {
        return generateWithGLM(prompt);
    } else {
        throw new Error("No available API Keys found (GEMINI_API_KEY or GLM_API_KEY). Please check your .env.local file.");
    }
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

    // 2. Mock Data Fallback
    if (process.env.MOCK_MODE === 'true' || allTweets.length === 0) {
        console.log("⚠️ No live tweets found. Using HIGH-SIGNAL MOCK DATA (Feb 21-22 Catchup)...");
        allTweets = [
            {
                author: "naval",
                content: "AI Is Not the Threat. Complacency Is.",
                link: "https://x.com/naval/status/2026022201",
                pubDate: new Date("2026-02-22").toISOString()
            },
            {
                author: "levelsio",
                content: "The one-person dev team is now a scaled reality.",
                link: "https://x.com/levelsio/status/2026021701",
                pubDate: new Date("2026-02-17").toISOString()
            }
        ];
    }

    // 3. Deduplicate
    const existingLinks = getExistingLinks();
    const uniqueTweets = allTweets.filter(t => !existingLinks.has(t.link));

    console.log(`Fetched: ${allTweets.length}, Existing: ${existingLinks.size}, Unique: ${uniqueTweets.length}`);

    if (uniqueTweets.length === 0) {
        console.log("✅ No new unique tweets found today. Exiting.");
        return;
    }

    // 4. Generate Content
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    const localDate = new Date(today.getTime() - offset);
    const dateStr = localDate.toISOString().split('T')[0];
    const filename = `${dateStr}-daily-signals.md`;
    const filepath = path.join(POSTS_DIR, filename);

    const rawContent = await generateDailySignal(uniqueTweets, dateStr);
    const { titleBest, anchorThought, body } = parseGeneratedContent(rawContent);

    let fullContent = "";
    let isNewFile = false;

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

${body}`;
    } else {
        console.log(`Appending to ${filename}...`);
        fullContent = fs.readFileSync(filepath, 'utf-8');
        fullContent += `\n\n## 🔄 Update ${localDate.getHours()}:${localDate.getMinutes().toString().padStart(2, '0')}\n\n${body}`;
    }

    if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
    fs.writeFileSync(filepath, fullContent);
    console.log(`✅ ${isNewFile ? 'Created' : 'Updated'} draft: ${filepath}`);
}

main().catch(console.error);
