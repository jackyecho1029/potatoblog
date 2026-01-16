
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const youtube = google.youtube('v3');
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// User Preferences for Long-form (Optimized for First Run)
const MAX_SUBSCRIBERS = 20000; // Increased slightly for wider net
const MIN_VIEWS = 500;        // Lowered for small channels
const MIN_DURATION_SECONDS = 360; // 6 minutes
const CATEGORIES = [
    "个人成长", "哲学", "AI", "创业", "学习", "心理学", "营销", "商业拆解", "生活黑客", "深度访谈"
];

interface HiddenGem {
    title: string;
    videoId: string;
    channelTitle: string;
    subscriberCount: number;
    viewCount: number;
    publishDate: string;
    duration: string;
    gemScore: number;
    url: string;
}

// Convert ISO 8601 duration (PT6M15S) to seconds
function parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return hours * 3600 + minutes * 60 + seconds;
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
        return null;
    }
}

async function searchLongGems(keyword: string): Promise<HiddenGem[]> {
    console.log(`\n🔍 Searching for long-form gems in "${keyword}"...`);
    const gems: HiddenGem[] = [];

    try {
        const searchResponse = await youtube.search.list({
            key: YOUTUBE_API_KEY,
            part: ['snippet'],
            q: keyword,
            type: ['video'],
            maxResults: 50,
            order: 'viewCount',
            videoDuration: 'medium', // 4-20 mins
            publishedAfter: '2023-01-01T00:00:00Z' // More history
        });

        const searchResponseLong = await youtube.search.list({
            key: YOUTUBE_API_KEY,
            part: ['snippet'],
            q: keyword,
            type: ['video'],
            maxResults: 20,
            order: 'viewCount',
            videoDuration: 'long',
            publishedAfter: '2023-01-01T00:00:00Z'
        });

        const videos = [...(searchResponse.data.items || []), ...(searchResponseLong.data.items || [])];
        const videoIds = videos.map(v => v.id?.videoId).filter(id => id) as string[];

        if (videoIds.length === 0) return [];

        const videoStatsResponse = await youtube.videos.list({
            key: YOUTUBE_API_KEY,
            part: ['statistics', 'snippet', 'contentDetails'],
            id: videoIds
        });

        const detailedVideos = videoStatsResponse.data.items || [];

        for (const video of detailedVideos) {
            const channelId = video.snippet?.channelId;
            const viewCount = parseInt(video.statistics?.viewCount || '0');
            const durationRaw = video.contentDetails?.duration || '';
            const durationSec = parseDuration(durationRaw);
            const title = video.snippet?.title || '';

            if (!channelId || viewCount < MIN_VIEWS || durationSec < MIN_DURATION_SECONDS) continue;

            const lowerTitle = title.toLowerCase();
            if (lowerTitle.includes('clip') || lowerTitle.includes('shorts')) continue;

            const subs = await getChannelSubscribers(channelId);

            if (subs !== null && subs < MAX_SUBSCRIBERS && subs > 0) {
                const gemScore = viewCount / subs;
                if (gemScore < 1.5) continue; // Must have at least 1.5x view-to-sub ratio

                gems.push({
                    title: title,
                    videoId: video.id || '',
                    channelTitle: video.snippet?.channelTitle || 'Unknown',
                    subscriberCount: subs,
                    viewCount: viewCount,
                    duration: video.contentDetails?.duration || '',
                    publishDate: video.snippet?.publishedAt || '',
                    gemScore: parseFloat(gemScore.toFixed(2)),
                    url: `https://www.youtube.com/watch?v=${video.id}`
                });
                process.stdout.write('⭐');
            }
        }
    } catch (error) {
        console.error("Search failed:", error);
    }
    return gems;
}

async function run() {
    console.log("🎥 Starting Long-form Hidden Gem Hunt...");
    let allGems: HiddenGem[] = [];

    for (const category of CATEGORIES) {
        const categoryGems = await searchLongGems(category);
        allGems = [...allGems, ...categoryGems];
    }

    allGems = allGems.filter((gem, index, self) =>
        index === self.findIndex((t) => t.videoId === gem.videoId)
    ).sort((a, b) => b.gemScore - a.gemScore);

    console.log(`\n\n✨ Found ${allGems.length} long-form gems.\n`);

    const outputDir = path.join(process.cwd(), 'reports/gems');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const date = new Date().toISOString().split('T')[0];
    const outputFile = path.join(outputDir, `${date}-long-gems.md`);

    let content = `# 🎥 YouTube Long-form Hidden Gems (${date})\n\n`;

    if (allGems.length === 0) {
        content += "> [!NOTE]\n> 今天未发现符合严苛指标的长视频爆款。系统将继续巡航。\n";
    } else {
        content += `| Gem Score | Views | Subs | Duration | Video |\n`;
        content += `|-----------|-------|------|----------|-------|\n`;
        allGems.slice(0, 10).forEach(gem => {
            content += `| 🔥 ${gem.gemScore}x | ${gem.viewCount.toLocaleString()} | ${gem.subscriberCount.toLocaleString()} | ${gem.duration} | [${gem.title.replace(/\|/g, '-')}](${gem.url}) |\n`;
        });
    }

    fs.writeFileSync(outputFile, content);

    const topIdsFile = path.join(outputDir, 'top-long-ids.json');
    const topIds = allGems.slice(0, 3).map(gem => gem.videoId);
    fs.writeFileSync(topIdsFile, JSON.stringify(topIds, null, 2));

    console.log(`✅ Reports saved.`);
}

run();
