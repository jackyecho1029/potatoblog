
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const youtube = google.youtube('v3');
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// User Preferences
const MAX_SUBSCRIBERS = 10000; // Define "Low Subscriber"
const MIN_VIEWS = 1000;       // Minimum views to consider valid
const CATEGORIES = [
    "个人成长", "哲学", "AI", "创业", "学习", "心理学", "营销", "文案"
];

interface HiddenGem {
    title: string;
    videoId: string;
    channelTitle: string;
    subscriberCount: number;
    viewCount: number;
    publishDate: string;
    gemScore: number; // Ratio of Views / Subscribers
    url: string;
}

async function getChannelSubscribers(channelId: string): Promise<number | null> {
    try {
        const response = await youtube.channels.list({
            key: YOUTUBE_API_KEY,
            part: ['statistics'],
            id: [channelId]
        });
        const subs = response.data.items?.[0]?.statistics?.subscriberCount;
        return subs ? parseInt(subs) : null;
    } catch (error) {
        console.error(`Error fetching channel stats for ${channelId}:`, error);
        return null;
    }
}

async function searchHiddenGems(keyword: string): Promise<HiddenGem[]> {
    console.log(`\n🔍 Searching for hidden gems in "${keyword}"...`);
    const gems: HiddenGem[] = [];

    try {
        // Step 1: Search for videos by keyword
        // We look for 'relevance' or 'viewCount' to get a mix. 
        // Note: 'viewCount' might bias towards big channels, so 'relevance' or 'date' might be better to cast a wide net,
        // but user specifically wants "High Views" (bao kuan), so viewCount sort is safer, then we filter DOWN by subs.
        const searchResponse = await youtube.search.list({
            key: YOUTUBE_API_KEY,
            part: ['snippet'],
            q: keyword,
            type: ['video'],
            maxResults: 50, // Fetch enough to filter
            order: 'viewCount',
            publishedAfter: '2025-01-01T00:00:00Z' // Limit to recent videos (last year/month?) - adjusting to recent relative to 2026
        });

        const videos = searchResponse.data.items || [];

        // Enhance with video statistics (view count) - Search API doesn't give view count
        const videoIds = videos.map(v => v.id?.videoId).filter(id => id) as string[];

        if (videoIds.length === 0) return [];

        const videoStatsResponse = await youtube.videos.list({
            key: YOUTUBE_API_KEY,
            part: ['statistics', 'snippet'],
            id: videoIds
        });

        const detailedVideos = videoStatsResponse.data.items || [];

        for (const video of detailedVideos) {
            const channelId = video.snippet?.channelId;
            const viewCount = parseInt(video.statistics?.viewCount || '0');

            if (!channelId || viewCount < MIN_VIEWS) continue;

            // Step 2: Check Channel Subscribers
            const subs = await getChannelSubscribers(channelId);

            if (subs !== null && subs < MAX_SUBSCRIBERS) {
                // Found a gem!
                const gemScore = subs > 0 ? (viewCount / subs) : viewCount;

                gems.push({
                    title: video.snippet?.title || 'Unknown',
                    videoId: video.id || '',
                    channelTitle: video.snippet?.channelTitle || 'Unknown',
                    subscriberCount: subs,
                    viewCount: viewCount,
                    publishDate: video.snippet?.publishedAt || '',
                    gemScore: parseFloat(gemScore.toFixed(2)),
                    url: `https://www.youtube.com/watch?v=${video.id}`
                });

                process.stdout.write('.'); // Progress indicator
            }
        }

    } catch (error) {
        console.error("Search failed:", error);
    }

    return gems.sort((a, b) => b.gemScore - a.gemScore); // Best gems first
}

async function run() {
    console.log("💎 Starting Hidden Gem Hunt...");
    console.log(`Target: < ${MAX_SUBSCRIBERS} subs, High Views`);

    let allGems: HiddenGem[] = [];

    for (const category of CATEGORIES) {
        const categoryGems = await searchHiddenGems(category);
        allGems = [...allGems, ...categoryGems];
    }

    // Deduplicate
    allGems = allGems.filter((gem, index, self) =>
        index === self.findIndex((t) => (
            t.videoId === gem.videoId
        ))
    );

    // Sort by Gem Score (highest viral factor first)
    allGems.sort((a, b) => b.gemScore - a.gemScore);

    console.log(`\n\n✨ Search Complete! Found ${allGems.length} hidden gems.\n`);

    // Output to file
    const outputDir = path.join(process.cwd(), 'reports/gems');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const date = new Date().toISOString().split('T')[0];
    const outputFile = path.join(outputDir, `${date}-hidden-gems.md`);

    let content = `# 💎 YouTube Hidden Gems Report (${date})\n\n`;
    content += `**Criteria**: < ${MAX_SUBSCRIBERS.toLocaleString()} Subscribers | High View Count\n\n`;

    // Top 20 Gems
    content += `## Top 20 Viral Videos from Small Channels\n\n`;
    content += `| Gem Score | Views | Subs | Video |\n`;
    content += `|-----------|-------|------|-------|\n`;

    allGems.slice(0, 20).forEach(gem => {
        content += `| 🔥 ${gem.gemScore}x | ${gem.viewCount.toLocaleString()} | ${gem.subscriberCount.toLocaleString()} | [${gem.title.replace('|', '-')}](${gem.url}) by **${gem.channelTitle}** |\n`;
    });

    content += `\n\n## 📂 Categorized Findings (Top 5 per Category)\n`;

    // We already flattened the list, but for display we might want to re-group or just list all sorted.
    // Let's just list the rest cleanly.

    content += `\n*Generated by Antigravity Gem Hunter*`;

    fs.writeFileSync(outputFile, content);
    console.log(`✅ Report saved to: ${outputFile}`);

    // Export Top IDs for deeper analysis
    const topIdsFile = path.join(outputDir, 'top-ids.json');
    const topIds = allGems.slice(0, 5).map(gem => gem.videoId);
    fs.writeFileSync(topIdsFile, JSON.stringify(topIds, null, 2));
    console.log(`✅ Top IDs exported to: ${topIdsFile}`);
}

run();
