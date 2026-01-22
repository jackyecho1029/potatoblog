
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const LOCAL_EPISODES_DIR = 'D:/Antigravity/Jackypotato/lennys_transcripts/episodes';
const POSTS_DIR = path.join(process.cwd(), 'potatoblog/posts/learning');

function findYoutubeLinks() {
    const files = fs.readdirSync(POSTS_DIR);
    const lennyFiles = files.filter(f => f.includes('lenny-') && f.endsWith('.md'));

    const results: Array<{
        post: string,
        guest: string,
        youtube_url: string | null,
        duration: string | null,
        duration_seconds: number | null,
        is_long: boolean
    }> = [];

    for (const file of lennyFiles) {
        // Extract guest name from filename: 2026-01-20-lenny-ada-chen-rekhi.md -> ada-chen-rekhi
        const match = file.match(/lenny-(.+)\.md$/);
        if (!match) continue;

        const guestSlug = match[1];
        const transcriptPath = path.join(LOCAL_EPISODES_DIR, guestSlug, 'transcript.md');

        if (fs.existsSync(transcriptPath)) {
            const transcriptContent = fs.readFileSync(transcriptPath, 'utf8');
            const { data } = matter(transcriptContent);

            const durationSeconds = data.duration_seconds || null;
            const isLong = durationSeconds ? durationSeconds > 35 * 60 : false;

            results.push({
                post: file,
                guest: guestSlug,
                youtube_url: data.youtube_url || null,
                duration: data.duration || null,
                duration_seconds: durationSeconds,
                is_long: isLong
            });
        } else {
            // Try to find the folder if guestSlug is slightly different?
            // For now, assume exact match
            results.push({
                post: file,
                guest: guestSlug,
                youtube_url: null,
                duration: null,
                duration_seconds: null,
                is_long: false
            });
        }
    }

    return results;
}

const allLinks = findYoutubeLinks();
const longLinks = allLinks.filter(l => l.is_long);

console.log(`Total Lenny Posts: ${allLinks.length}`);
console.log(`Matched with Transcripts: ${allLinks.filter(l => l.youtube_url).length}`);
console.log(`Long-Form Videos (>35m): ${longLinks.length}`);

fs.writeFileSync('youtube_matches.json', JSON.stringify(allLinks, null, 2));
console.log('Results saved to youtube_matches.json');
