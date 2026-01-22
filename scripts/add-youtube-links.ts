/**
 * Script to add YouTube video URLs to Lenny Podcast posts
 * Reads from transcript files and adds source_url to frontmatter
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const LOCAL_EPISODES_DIR = 'D:/Antigravity/Jackypotato/lennys_transcripts/episodes';
const POSTS_DIR = path.join(process.cwd(), 'posts/learning');

function addYoutubeLinks() {
    const files = fs.readdirSync(POSTS_DIR);
    const lennyFiles = files.filter(f => f.includes('lenny-') && f.endsWith('.md'));

    let updated = 0;
    let skipped = 0;
    let noMatch = 0;

    for (const file of lennyFiles) {
        // Extract guest name from filename: 2026-01-20-lenny-ada-chen-rekhi.md -> ada-chen-rekhi
        const match = file.match(/lenny-(.+)\.md$/);
        if (!match) continue;

        const guestSlug = match[1];
        const transcriptPath = path.join(LOCAL_EPISODES_DIR, guestSlug, 'transcript.md');
        const postPath = path.join(POSTS_DIR, file);

        if (fs.existsSync(transcriptPath)) {
            const transcriptContent = fs.readFileSync(transcriptPath, 'utf8');
            const transcriptData = matter(transcriptContent);

            const youtubeUrl = transcriptData.data.youtube_url;
            const durationSeconds = transcriptData.data.duration_seconds || 0;

            // Only add for long-form videos (> 35 minutes = 2100 seconds)
            if (youtubeUrl && durationSeconds > 2100) {
                const postContent = fs.readFileSync(postPath, 'utf8');
                const { data, content } = matter(postContent);

                // Skip if already has source_url
                if (data.source_url) {
                    skipped++;
                    continue;
                }

                // Add source_url to frontmatter
                data.source_url = youtubeUrl;

                // Reconstruct the file
                const newContent = matter.stringify(content, data);
                fs.writeFileSync(postPath, newContent, 'utf-8');
                updated++;
                console.log(`✅ Updated: ${file} -> ${youtubeUrl}`);
            } else {
                skipped++;
            }
        } else {
            noMatch++;
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped (short/already has URL): ${skipped}`);
    console.log(`   No transcript match: ${noMatch}`);
}

addYoutubeLinks();
