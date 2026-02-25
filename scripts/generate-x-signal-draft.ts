import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import Parser from 'rss-parser';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const RSSHUB_BASE_URL = 'http://localhost:1200';
const SOURCES_CONFIG_PATH = path.join(process.cwd(), 'config/x-sources-categorized.json');
const POSTS_DIR = path.join(process.cwd(), 'posts/x-signals');

// API Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GLM_API_KEY = process.env.GLM_API_KEY;
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const GLM_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

const parser = new Parser();

// ─── Type Definitions ───────────────────────────────────────────────────────

interface TweetItem {
    author: string;
    content: string;
    link: string;
    pubDate: string;
    fingerprint: string; // content hash for dedup
}

interface CategoryConfig {
    description: string;
    accounts: string[];
}

interface SourcesConfig {
    categories: Record<string, CategoryConfig>;
}

// ─── Deduplication ──────────────────────────────────────────────────────────

function getContentFingerprint(content: string): string {
    return crypto.createHash('md5').update(content.slice(0, 100).toLowerCase().trim()).digest('hex');
}

function getExistingDedupeSet(): Set<string> {
    const existing = new Set<string>();
    if (!fs.existsSync(POSTS_DIR)) return existing;

    const files = fs.readdirSync(POSTS_DIR)
        .filter(f => f.endsWith('.md'))
        .sort().reverse()
        .slice(0, 7);

    for (const file of files) {
        const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
        // Collect tweet links
        const links = content.match(/https?:\/\/(x\.com|twitter\.com)\/[a-zA-Z0-9_]+\/status\/\d+/g);
        if (links) links.forEach(l => existing.add(l));
        // Collect content fingerprints stored in comments
        const fps = content.match(/<!--fp:([a-f0-9]{32})-->/g);
        if (fps) fps.forEach(fp => existing.add(fp.replace(/<!--fp:|-->/g, '')));
    }
    return existing;
}

// ─── Source Loading ──────────────────────────────────────────────────────────

function loadCategorizedSources(): SourcesConfig {
    if (!fs.existsSync(SOURCES_CONFIG_PATH)) {
        console.error(`Config not found: ${SOURCES_CONFIG_PATH}`);
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(SOURCES_CONFIG_PATH, 'utf-8'));
}

// ─── Fetching ────────────────────────────────────────────────────────────────

// Twitter API v2 user ID cache to avoid repeated lookups
const userIdCache: Record<string, string> = {};

async function fetchTweetsFromTwitterAPI(username: string): Promise<TweetItem[]> {
    if (!TWITTER_BEARER_TOKEN) return [];

    try {
        // Step 1: Resolve username to user ID (with cache)
        if (!userIdCache[username]) {
            const userRes = await fetch(
                `https://api.twitter.com/2/users/by/username/${username}?user.fields=id`,
                { headers: { Authorization: `Bearer ${TWITTER_BEARER_TOKEN}` } }
            );
            if (!userRes.ok) {
                console.log(`  ⚠ Twitter API: user lookup failed for @${username} (${userRes.status})`);
                return [];
            }
            const userData = await userRes.json() as any;
            if (!userData.data?.id) return [];
            userIdCache[username] = userData.data.id;
        }

        const userId = userIdCache[username];

        // Step 2: Fetch recent tweets (last 3 days)
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 3);
        const startTime = cutoff.toISOString();

        const tweetsRes = await fetch(
            `https://api.twitter.com/2/users/${userId}/tweets` +
            `?max_results=10&start_time=${startTime}` +
            `&tweet.fields=created_at,text` +
            `&exclude=retweets,replies`,
            { headers: { Authorization: `Bearer ${TWITTER_BEARER_TOKEN}` } }
        );

        if (!tweetsRes.ok) {
            console.log(`  ⚠ Twitter API: tweets fetch failed for @${username} (${tweetsRes.status})`);
            return [];
        }

        const tweetsData = await tweetsRes.json() as any;
        const items: TweetItem[] = (tweetsData.data || []).map((tweet: any) => {
            const content = tweet.text || '';
            return {
                author: username,
                content,
                link: `https://x.com/${username}/status/${tweet.id}`,
                pubDate: tweet.created_at || '',
                fingerprint: getContentFingerprint(content)
            };
        });

        return items;
    } catch (e) {
        console.log(`  ⚠ Twitter API error for @${username}: ${e}`);
        return [];
    }
}

async function fetchTweetsFromRSSHub(username: string): Promise<TweetItem[]> {
    const feedUrl = `${RSSHUB_BASE_URL}/twitter/user/${username}`;
    try {
        const feed = await parser.parseURL(feedUrl);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 3);

        return feed.items
            .filter(item => {
                const pubDate = item.pubDate ? new Date(item.pubDate) : new Date(0);
                return pubDate > cutoff;
            })
            .map(item => {
                const content = item.contentSnippet || item.content || '';
                return {
                    author: username,
                    content,
                    link: item.link || '',
                    pubDate: item.pubDate || '',
                    fingerprint: getContentFingerprint(content)
                };
            });
    } catch {
        return [];
    }
}

async function fetchTweetsFromSource(username: string): Promise<TweetItem[]> {
    // Tier 1: Twitter API v2 (direct, fastest)
    if (TWITTER_BEARER_TOKEN) {
        const tweets = await fetchTweetsFromTwitterAPI(username);
        if (tweets.length > 0) return tweets;
    }

    // Tier 2: RSSHub fallback
    return fetchTweetsFromRSSHub(username);
}

// ─── AI Generation ───────────────────────────────────────────────────────────

async function callAI(prompt: string): Promise<string> {
    if (GEMINI_API_KEY) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        if (!res.ok) throw new Error(`Gemini error: ${res.status} - ${await res.text()}`);
        const data = await res.json() as any;
        return data.candidates[0].content.parts[0].text;
    } else if (GLM_API_KEY) {
        const res = await fetch(GLM_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GLM_API_KEY}` },
            body: JSON.stringify({ model: 'glm-4-plus', messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 4096 })
        });
        if (!res.ok) throw new Error(`GLM error: ${res.status} - ${await res.text()}`);
        const data = await res.json() as { choices: { message: { content: string } }[] };
        return data.choices[0].message.content;
    } else {
        throw new Error('No API keys found in .env.local (GEMINI_API_KEY or GLM_API_KEY).');
    }
}

// ─── Category Signal Generation ──────────────────────────────────────────────

interface CategorySignal {
    categoryName: string;
    selectedItems: SelectedItem[];
    summary: string;
    actions: string[];
}

interface SelectedItem {
    author: string;
    signal: string; // one-sentence Chinese distillation
    link: string;
    fingerprint: string;
}

async function generateCategorySignal(
    categoryName: string,
    description: string,
    tweets: TweetItem[],
    dateStr: string
): Promise<CategorySignal | null> {
    if (tweets.length === 0) {
        console.log(`  📭 No tweets available for ${categoryName}, skipping.`);
        return null;
    }

    const tweetList = tweets.map((t, i) =>
        `[${i + 1}] @${t.author}\n内容: ${t.content.slice(0, 300)}\n链接: ${t.link}`
    ).join('\n---\n');

    const prompt = `你是"Potato"，一位顶级信息策展人。今天是 ${dateStr}。

你负责管理板块「${categoryName}」（主题：${description}）。

以下是从该板块订阅账号抓取到的最新内容（最多${tweets.length}条）：

${tweetList}

## 你的任务

1. **内容筛选**：从以上内容中，选出最有价值、信号最强的 5~10 条。如果内容少于5条，则全部选入。
2. **信号提炼**：对每条选中的内容，用一句话（中文，≤60字）提炼核心洞见。要犀利有力，不要废话。
3. **板块总结**：为本板块写一段今日总结（100-160字），揭示这些信号背后的宏观趋势或共同主题。
4. **行动建议**：给出 2~3 条具体可执行的行动建议，以"主权构建者"的视角来写。

## 输出格式（严格遵守，不要多余文字）

ITEMS_START
序号|@账号|信号提炼（一句话）|原文链接
1|@karpathy|...|https://...
2|@levelsio|...|https://...
ITEMS_END
SUMMARY_START
[板块总结内容]
SUMMARY_END
ACTIONS_START
- [行动建议1]
- [行动建议2]
- [行动建议3]
ACTIONS_END`;

    console.log(`  🤖 Generating signals for ${categoryName} (${tweets.length} tweets)...`);

    try {
        const raw = await callAI(prompt);
        return parseCategoryResponse(categoryName, tweets, raw);
    } catch (e) {
        console.error(`  ❌ AI generation failed for ${categoryName}:`, e);
        return null;
    }
}

function parseCategoryResponse(categoryName: string, sourceTweets: TweetItem[], raw: string): CategorySignal {
    // Parse ITEMS
    const itemsMatch = raw.match(/ITEMS_START\n([\s\S]*?)\nITEMS_END/);
    const selectedItems: SelectedItem[] = [];

    if (itemsMatch) {
        const lines = itemsMatch[1].trim().split('\n').filter(l => l.includes('|'));
        for (const line of lines) {
            const parts = line.split('|');
            if (parts.length >= 4) {
                const authorHandle = parts[1]?.trim().replace('@', '').toLowerCase();
                const signal = parts[2]?.trim();
                const link = parts[3]?.trim();

                // Find fingerprint from source tweets
                const sourceTweet = sourceTweets.find(t =>
                    t.author.toLowerCase() === authorHandle ||
                    t.link === link
                );

                selectedItems.push({
                    author: parts[1]?.trim(),
                    signal,
                    link,
                    fingerprint: sourceTweet?.fingerprint || getContentFingerprint(signal)
                });
            }
        }
    }

    // Parse SUMMARY
    const summaryMatch = raw.match(/SUMMARY_START\n([\s\S]*?)\nSUMMARY_END/);
    const summary = summaryMatch ? summaryMatch[1].trim() : '暂无总结。';

    // Parse ACTIONS
    const actionsMatch = raw.match(/ACTIONS_START\n([\s\S]*?)\nACTIONS_END/);
    const actions = actionsMatch
        ? actionsMatch[1].trim().split('\n').map(a => a.replace(/^-\s*/, '').trim()).filter(Boolean)
        : [];

    return { categoryName, selectedItems, summary, actions };
}

// ─── Markdown Rendering ───────────────────────────────────────────────────────

function renderCategorySection(signal: CategorySignal): string {
    const itemRows = signal.selectedItems.map((item, i) =>
        `| ${i + 1} | ${item.author} | ${item.signal} <!--fp:${item.fingerprint}--> | [→ 原文](${item.link}) |`
    ).join('\n');

    const actionList = signal.actions.map(a => `- 💡 ${a}`).join('\n');

    return `## ${signal.categoryName}

| # | 来源 | 今日信号 | 链接 |
|---|------|---------|------|
${itemRows}

> **板块总结** | ${signal.summary}

**⚡ 行动建议**
${actionList}

`;
}

function buildFallbackContent(dateStr: string): string {
    return `---
title: "Daily X Signals: ${dateStr}"
date: "${dateStr}"
category: "X Signal"
tags: ["X", "AI", "财富", "营销", "智慧"]
---

> ⚠️ **今日信号：RSSHub 连接异常，无法抓取实时数据。**
> 建议检查 RSSHub 服务状态（\`http://localhost:1200\`）后重新运行。

---
*Curated by Potato | Powered by Antigravity*
`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('═══════════════════════════════════════');
    console.log('  🛰  X Signal Categorized Briefing');
    console.log('═══════════════════════════════════════');

    const config = loadCategorizedSources();
    const dedupeSet = getExistingDedupeSet();
    console.log(`📚 Dedup set loaded: ${dedupeSet.size} known items\n`);

    // ── Date Setup ──
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    const localDate = new Date(today.getTime() - offset);
    const dateStr = localDate.toISOString().split('T')[0];
    const filename = `${dateStr}-daily-signals.md`;
    const filepath = path.join(POSTS_DIR, filename);

    // ── Fetch all tweets per category ──
    const categoryTweets: Record<string, TweetItem[]> = {};
    let totalFetched = 0;

    for (const [categoryName, categoryConfig] of Object.entries(config.categories)) {
        console.log(`\n📡 Fetching [${categoryName}]...`);
        let catTweets: TweetItem[] = [];

        for (const username of categoryConfig.accounts) {
            const tweets = await fetchTweetsFromSource(username);
            const fresh = tweets.filter(t => !dedupeSet.has(t.link) && !dedupeSet.has(t.fingerprint));
            catTweets = catTweets.concat(fresh);
            totalFetched += fresh.length;
        }

        // Sort newest-first, limit to 30 for prompt efficiency
        catTweets.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        categoryTweets[categoryName] = catTweets.slice(0, 30);
        console.log(`  ✅ ${catTweets.length} fresh tweets`);
    }

    console.log(`\n📊 Total fresh tweets: ${totalFetched}`);

    // ── Handle no data ──
    if (totalFetched === 0) {
        console.log('\n⚠️  No live data available. RSSHub may be offline.');
        console.log('💡 Tip: Start RSSHub with `npx rsshub` or check http://localhost:1200');

        if (!fs.existsSync(filepath)) {
            if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
            fs.writeFileSync(filepath, buildFallbackContent(dateStr));
            console.log(`📝 Created fallback file: ${filename}`);
        }
        return;
    }

    // ── Generate category signals ──
    const categorySignals: CategorySignal[] = [];

    for (const [categoryName, tweets] of Object.entries(categoryTweets)) {
        const description = config.categories[categoryName].description;
        const signal = await generateCategorySignal(categoryName, description, tweets, dateStr);
        if (signal && signal.selectedItems.length > 0) {
            categorySignals.push(signal);
            // Add selected items to dedup set for future runs
            signal.selectedItems.forEach(item => {
                dedupeSet.add(item.link);
                dedupeSet.add(item.fingerprint);
            });
        }
    }

    if (categorySignals.length === 0) {
        console.log('❌ No category signals generated. Check AI API keys.');
        return;
    }

    // ── Build the final Markdown ──
    const totalItems = categorySignals.reduce((sum, s) => sum + s.selectedItems.length, 0);

    const categorySections = categorySignals.map(renderCategorySection).join('---\n\n');

    const fullContent = `---
title: "X Signal Daily Briefing: ${dateStr}"
date: "${dateStr}"
category: "X Signal"
tags: ["X", "AI", "财富", "营销", "智慧", "日报"]
---

> **Potato's Daily Briefing** · ${dateStr} · 今日精选 **${totalItems}** 条信号，覆盖 **${categorySignals.length}** 个板块

---

${categorySections}---

*Curated by Potato · Powered by Antigravity · ${new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })}*
`;

    if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });

    if (fs.existsSync(filepath)) {
        // Append as a new update block
        const existing = fs.readFileSync(filepath, 'utf-8');
        const updateBlock = `\n\n## 🔄 更新 ${localDate.getHours()}:${localDate.getMinutes().toString().padStart(2, '0')}\n\n${categorySections}`;
        fs.writeFileSync(filepath, existing + updateBlock);
        console.log(`\n✅ Appended update to: ${filename}`);
    } else {
        fs.writeFileSync(filepath, fullContent);
        console.log(`\n✅ Created new briefing: ${filename}`);
    }

    console.log(`\n📋 Summary:`);
    categorySignals.forEach(s => console.log(`  ${s.categoryName}: ${s.selectedItems.length} signals`));
    console.log('═══════════════════════════════════════\n');
}

main().catch(console.error);
