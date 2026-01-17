import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

// RSSHub base URL - change this to your own instance if you deploy one
const RSSHUB_BASE = process.env.RSSHUB_BASE || 'https://rsshub.app';

// Accounts to monitor
const X_ACCOUNTS = [
    'naval',
    'levelsio',
    'SahilBloom',
    'Codie_Sanchez',
    'paulg',
    'elonmusk',
    'Nicolascole77',
    'dickiebush',
    'swyx',
    'visualizevalue'
];

// Categories for classification
const CATEGORIES = {
    'AI': ['AI', 'GPT', 'LLM', 'agent', 'machine learning', 'neural', 'robot', 'automation', 'Cursor', 'Claude', 'OpenAI', 'Gemini', 'Anthropic'],
    'Wealth': ['money', 'wealth', 'invest', 'business', 'startup', 'entrepreneur', 'revenue', 'profit', 'income', 'financial', 'capital'],
    'Marketing': ['marketing', 'brand', 'content', 'audience', 'growth', 'viral', 'creator', 'audience', 'newsletter', 'writing'],
    'Wisdom': ['mindset', 'productivity', 'habit', 'think', 'wisdom', 'life', 'learn', 'focus', 'time', 'decision']
};

interface Tweet {
    author: string;
    content: string;
    link: string;
    pubDate: string;
}

interface CategorizedTweets {
    ai: Tweet[];
    wealth: Tweet[];
    marketing: Tweet[];
    wisdom: Tweet[];
}

// Simple XML parser for RSS
function parseRSSItem(itemXml: string): Tweet | null {
    const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s) ||
        itemXml.match(/<title>(.*?)<\/title>/s);
    const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
    const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
    const authorMatch = itemXml.match(/<author>(.*?)<\/author>/) ||
        itemXml.match(/<dc:creator>(.*?)<\/dc:creator>/);

    if (!titleMatch || !linkMatch) return null;

    return {
        author: authorMatch ? authorMatch[1] : 'Unknown',
        content: titleMatch[1].replace(/<[^>]*>/g, '').trim(),
        link: linkMatch[1],
        pubDate: pubDateMatch ? pubDateMatch[1] : new Date().toISOString()
    };
}

function parseRSS(xml: string): Tweet[] {
    const items: Tweet[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
        const tweet = parseRSSItem(match[1]);
        if (tweet) items.push(tweet);
    }

    return items;
}

async function fetchRSSFeed(username: string): Promise<Tweet[]> {
    const url = `${RSSHUB_BASE}/twitter/user/${username}`;
    console.log(`   Fetching RSS for @${username}...`);

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            console.log(`   ⚠️ Failed to fetch @${username}: ${response.status}`);
            return [];
        }

        const xml = await response.text();
        const tweets = parseRSS(xml);

        // Add author to each tweet
        return tweets.map(t => ({ ...t, author: username }));
    } catch (error) {
        console.log(`   ⚠️ Error fetching @${username}:`, error);
        return [];
    }
}

function categorizeTweet(tweet: Tweet): string {
    const content = tweet.content.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORIES)) {
        for (const keyword of keywords) {
            if (content.includes(keyword.toLowerCase())) {
                return category;
            }
        }
    }

    return 'Wisdom'; // Default category
}

function filterTodaysTweets(tweets: Tweet[]): Tweet[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return tweets.filter(tweet => {
        const tweetDate = new Date(tweet.pubDate);
        return tweetDate >= yesterday;
    });
}

async function generateXSignalContent(categorized: CategorizedTweets): Promise<string> {
    const today = new Date().toISOString().split('T')[0];

    const prompt = `
你是一位资深的科技和商业情报策展人。请根据以下从 X (Twitter) 收集的推文，生成一份 X Signal 日报。

## 今日收集的推文

### AI & Tech 类
${categorized.ai.map(t => `- @${t.author}: "${t.content}" [Source](${t.link})`).join('\n') || '(无内容)'}

### Wealth & Business 类
${categorized.wealth.map(t => `- @${t.author}: "${t.content}" [Source](${t.link})`).join('\n') || '(无内容)'}

### Marketing 类
${categorized.marketing.map(t => `- @${t.author}: "${t.content}" [Source](${t.link})`).join('\n') || '(无内容)'}

### Wisdom & Productivity 类
${categorized.wisdom.map(t => `- @${t.author}: "${t.content}" [Source](${t.link})`).join('\n') || '(无内容)'}

## 输出要求

请生成完整的 X Signal 文章，格式如下：

1. 为每个有内容的分类生成：
   - 几条精选要点（带 emoji 和 Source 链接）
   - **Potato's Take** 部分，包含：
     - 重要观点（深度分析，用通俗的语言解释）
     - 行动建议（1-2条具体可执行的建议）

2. 最后生成一条 **今日金句**（中英双语）

3. 风格要求：
   - 用词亲切，像朋友聊天
   - 专业术语要加"人话解释"
   - 保持 Source 链接

请直接输出 markdown 内容，从 "### 🤖 AI & Future Tech" 开始。
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API error:', error);
        return '(AI 生成失败，请手动补充内容)';
    }
}

function generateFrontmatter(date: string, title: string, thought: string): string {
    return `---
title: "Daily X Signals: ${date}"
date: "${date}"
category: "X Signal"
tags: ["X", "AI", "Wealth", "Productivity", "Entrepreneurship"]
title_best: "${title}"
anchor_thought: "${thought}"
---

> 借全球智慧之光，筑个人认知之塔。

`;
}

async function main() {
    console.log('🚀 X Signal Auto-Generator');
    console.log('='.repeat(50));

    // Step 1: Fetch all RSS feeds
    console.log('\n📡 Step 1: Fetching RSS feeds...');
    let allTweets: Tweet[] = [];

    for (const account of X_ACCOUNTS) {
        const tweets = await fetchRSSFeed(account);
        allTweets = allTweets.concat(tweets);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`   Total tweets fetched: ${allTweets.length}`);

    // Step 2: Filter to recent tweets
    console.log('\n🔍 Step 2: Filtering recent tweets...');
    const recentTweets = filterTodaysTweets(allTweets);
    console.log(`   Recent tweets (last 24h): ${recentTweets.length}`);

    if (recentTweets.length === 0) {
        console.log('\n⚠️ No recent tweets found. RSS feeds might be blocked or accounts inactive.');
        console.log('   Try using your own RSSHub instance by setting RSSHUB_BASE in .env.local');
        return;
    }

    // Step 3: Categorize tweets
    console.log('\n📂 Step 3: Categorizing tweets...');
    const categorized: CategorizedTweets = {
        ai: [],
        wealth: [],
        marketing: [],
        wisdom: []
    };

    for (const tweet of recentTweets) {
        const category = categorizeTweet(tweet);
        switch (category) {
            case 'AI': categorized.ai.push(tweet); break;
            case 'Wealth': categorized.wealth.push(tweet); break;
            case 'Marketing': categorized.marketing.push(tweet); break;
            case 'Wisdom': categorized.wisdom.push(tweet); break;
        }
    }

    console.log(`   AI: ${categorized.ai.length}, Wealth: ${categorized.wealth.length}, Marketing: ${categorized.marketing.length}, Wisdom: ${categorized.wisdom.length}`);

    // Step 4: Generate content with Gemini
    console.log('\n✨ Step 4: Generating content with Gemini...');
    const content = await generateXSignalContent(categorized);

    // Step 5: Create the file
    console.log('\n📝 Step 5: Creating X Signal file...');
    const today = new Date().toISOString().split('T')[0];
    const filename = `${today}-daily-signals.md`;
    const filepath = path.join(process.cwd(), 'posts/x-signals', filename);

    // Generate a title and thought (simplified for now)
    const frontmatter = generateFrontmatter(
        today,
        'AI 与超级个体的新纪元',
        '在信息爆炸的时代，真正的竞争力不是获取信息的能力，而是筛选和整合信息的智慧。'
    );

    const fullContent = frontmatter + content;

    fs.writeFileSync(filepath, fullContent);
    console.log(`   ✅ Saved to: ${filepath}`);

    console.log('\n🎉 Done! You can now review and publish the file.');
    console.log(`   File: posts/x-signals/${filename}`);
}

main().catch(console.error);
