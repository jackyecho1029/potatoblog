import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import Parser from 'rss-parser';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const parser = new Parser();

// High-intent subreddits for discovery
const SUBREDDITS = [
    'smallbusiness',
    'entrepreneur',
    'SaaS',
    'marketing',
    'realestate',
    'ecommerce',
    'productivity'
];

// Keywords that indicate pain/intent
const PAIN_KEYWORDS = [
    'is there a tool',
    'I wish there was',
    'too expensive',
    'is so buggy',
    'hard to use',
    'alternative to',
    'why is it so hard',
    'tedious',
    'manual task'
];

interface Complaint {
    title: string;
    content: string;
    link: string;
    subreddit: string;
    author: string;
}

async function fetchRedditComplaints(subreddit: string): Promise<Complaint[]> {
    const feedUrl = `https://www.reddit.com/r/${subreddit}/new/.rss`;
    console.log(`📡 Scanning r/${subreddit}...`);

    try {
        const feed = await parser.parseURL(feedUrl);
        return feed.items.filter(item => {
            const combinedText = (item.title + ' ' + (item.contentSnippet || '')).toLowerCase();
            return PAIN_KEYWORDS.some(k => combinedText.includes(k.toLowerCase()));
        }).map(item => ({
            title: item.title || '',
            content: item.contentSnippet || '',
            link: item.link || '',
            subreddit: subreddit,
            author: item.author || 'anonymous'
        }));
    } catch (error) {
        console.error(`❌ Error scanning r/${subreddit}:`, error);
        return [];
    }
}

async function analyzeWithGemini(complaints: Complaint[]): Promise<string> {
    if (complaints.length === 0) return "No significant complaints found in this batch.";

    const prompt = `
    You are an expert business analyst and product strategist in the style of Greg Isenberg.
    Your goal is to transform Reddit complaints into "Validated Business Opportunities".

    INPUT COMPLAINTS from Reddit:
    ${complaints.map(c => `[r/${c.subreddit}] ${c.title}\nContent: ${c.content}\nLink: ${c.link}\n---`).join('\n')}

    TASK:
    1. Identify the TOP 3 most promising business opportunities.
    2. For each, provide:
       - **The Pain Point**: Why are they complaining?
       - **Market Gap**: Why do existing tools fail them?
       - **The "Skill" Idea**: What specific service or tool would solve this?
       - **Validation Score**: (1-10) Based on how "desperate" the complaint sounds.

    3. Format as a high-signal Markdown report.
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    if (!response.ok) throw new Error(`Gemini Error: ${await response.text()}`);
    const data = await response.json() as any;
    return data.candidates[0].content.parts[0].text;
}

async function main() {
    console.log("🚀 Starting Reddit Complaint Miner...");

    let allComplaints: Complaint[] = [];
    for (const sub of SUBREDDITS) {
        const complaints = await fetchRedditComplaints(sub);
        allComplaints = allComplaints.concat(complaints);
    }

    console.log(`✨ Found ${allComplaints.length} potential leads.`);

    if (allComplaints.length > 0) {
        const report = await analyzeWithGemini(allComplaints);

        const reportPath = path.join(process.cwd(), 'reports/reddit-opportunities.md');
        if (!fs.existsSync(path.dirname(reportPath))) fs.mkdirSync(path.dirname(reportPath), { recursive: true });

        fs.writeFileSync(reportPath, report);
        console.log(`✅ Success! Opportunity report generated at: ${reportPath}`);
    } else {
        console.log("⏸️ No high-intent complaints found right now. Try again later or add more subreddits.");
    }
}

main().catch(console.error);
