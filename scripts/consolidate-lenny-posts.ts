/**
 * Script to consolidate Lenny Podcast learning posts
 * - Changes author from individual guest names to "Lenny's Podcast"
 * - Standardizes categories to 6 core types
 */

import fs from 'fs';
import path from 'path';

const LEARNING_DIR = path.join(process.cwd(), 'posts', 'learning');

// Category mapping rules
const CATEGORY_MAP: Record<string, string> = {
    '思维成长': '生活与效率',
    '思维模型': '生活与效率',
    'Wisdom': '生活与效率',
    'Productivity': '生活与效率',
    '增长策略': '创业与变现',
    'Growth': '创业与变现',
    'Startup': '创业与变现',
    'Entrepreneurship': '创业与变现',
    'LennyPodcast': '产品与增长',
    'Product': '产品与增长',
    '产品': '产品与增长',
    'Leadership': '领导力与管理',
    'Management': '领导力与管理',
    'AI': 'AI 与技术',
    'Tech': 'AI 与技术',
    'Technology': 'AI 与技术',
    'Writing': '写作与表达',
    'Storytelling': '写作与表达',
    'Communication': '写作与表达',
};

const STANDARD_CATEGORIES = [
    '产品与增长',
    '领导力与管理',
    'AI 与技术',
    '创业与变现',
    '写作与表达',
    '生活与效率',
];

function normalizeCategory(category: string): string {
    if (STANDARD_CATEGORIES.includes(category)) return category;
    return CATEGORY_MAP[category] || '产品与增长'; // Default for Lenny content
}

function processFile(filePath: string): boolean {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Only process Lenny podcast files
    if (!path.basename(filePath).includes('lenny-')) {
        return false;
    }

    // Parse frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return false;

    let frontmatter = frontmatterMatch[1];
    const body = content.slice(frontmatterMatch[0].length);

    // Extract current author for reference in tags
    const authorMatch = frontmatter.match(/author:\s*"([^"]+)"/);
    const originalAuthor = authorMatch ? authorMatch[1] : null;

    // Update author to "Lenny's Podcast"
    frontmatter = frontmatter.replace(/author:\s*"[^"]+"/, 'author: "Lenny\'s Podcast"');

    // Update category
    const categoryMatch = frontmatter.match(/category:\s*"([^"]+)"/);
    if (categoryMatch) {
        const normalizedCat = normalizeCategory(categoryMatch[1]);
        frontmatter = frontmatter.replace(/category:\s*"[^"]+"/, `category: "${normalizedCat}"`);
    }

    // Simplify tags - remove guest name tag if present, keep only essential tags
    const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/);
    if (tagsMatch) {
        let tagsStr = tagsMatch[1];
        // Parse tags
        const tags = tagsStr.match(/"[^"]+"/g)?.map(t => t.replace(/"/g, '')) || [];

        // Filter and normalize tags
        const filteredTags = tags
            .filter(tag => {
                // Remove guest name tags and redundant tags
                if (tag === originalAuthor) return false;
                if (tag === 'LennyPodcast') return false; // Will be implied by author
                return true;
            })
            .map(tag => CATEGORY_MAP[tag] || tag)
            .filter((tag, idx, arr) => arr.indexOf(tag) === idx); // Dedupe

        // Limit to 3 most relevant tags
        const finalTags = filteredTags.slice(0, 3);
        const newTagsStr = finalTags.map(t => `"${t}"`).join(', ');
        frontmatter = frontmatter.replace(/tags:\s*\[[^\]]*\]/, `tags: [${newTagsStr}]`);
    }

    // Reconstruct file
    const newContent = `---\n${frontmatter}\n---${body}`;
    fs.writeFileSync(filePath, newContent, 'utf-8');
    return true;
}

// Main execution
const files = fs.readdirSync(LEARNING_DIR);
let updatedCount = 0;

for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const filePath = path.join(LEARNING_DIR, file);
    if (processFile(filePath)) {
        updatedCount++;
    }
}

console.log(`✅ Updated ${updatedCount} Lenny Podcast files`);
console.log(`📂 All files now use author: "Lenny's Podcast"`);
console.log(`🏷️ Categories normalized to 6 standard types`);
