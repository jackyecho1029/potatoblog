import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface LennyPost {
    id: string;
    guest: string;
    category: string;
    summary: string;
    quote: string;
    link: string;
}

const LEARNING_DIR = path.join(process.cwd(), 'posts', 'learning');

// Category definitions based on content themes
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'AI构建者': ['AI', 'OpenAI', 'Anthropic', 'LLM', 'Agent', 'Codex', 'GPT', 'Claude'],
    '产品与战略': ['产品', 'Product', 'Strategy', '战略', 'PM', 'CPO', 'Positioning'],
    '增长与分发': ['Growth', '增长', 'Marketing', 'PLG', 'Acquisition', 'Retention'],
    '领导力与文化': ['Leadership', 'CEO', 'Culture', '领导力', 'Management', 'Coach'],
    '创业与融资': ['Startup', 'Founder', 'VC', 'Venture', '创业', 'Investment'],
    '设计与体验': ['Design', 'UX', 'Designer', '设计', 'Experience'],
};

function inferCategory(content: string, tags: string[]): string {
    const fullText = content + ' ' + tags.join(' ');

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (fullText.toLowerCase().includes(keyword.toLowerCase())) {
                return category;
            }
        }
    }
    return '产品与战略'; // Default category
}

function extractGuestName(filename: string, title: string): string {
    // Try to extract from filename: 2026-01-20-lenny-adam-fishman.md -> adam-fishman
    const match = filename.match(/lenny-(.+)\.md$/);
    if (match) {
        // Convert kebab-case to Title Case
        return match[1]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    // Fallback: extract from title
    const titleMatch = title.match(/：(.+?)(?:深度|访谈|$)/);
    return titleMatch ? titleMatch[1].trim() : 'Unknown';
}

function extractSummary(content: string): string {
    // Find the first meaningful paragraph after # 🎯 核心结论
    // Use [\s\S] instead of . with s flag for compatibility
    const conclusionMatch = content.match(/# 🎯 核心结论[\s\S]*?\n\n(.+?)(?:\n\n|---)/);
    if (conclusionMatch) {
        const summary = conclusionMatch[1].trim();
        // Limit to ~50 chars
        return summary.length > 60 ? summary.slice(0, 57) + '...' : summary;
    }
    return '深度访谈笔记';
}


function extractQuote(content: string): string {
    // Look for quotes in various formats
    const patterns = [
        /「([^」]+)」/,  // Chinese quotes
        /"([^"]+)"/,    // English quotes
        /\*\*\[([^\]]+)\]\*\*/,  // Bold brackets
        /> (.+)/        // Blockquote
    ];

    for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match && match[1].length > 10 && match[1].length < 80) {
            return match[1];
        }
    }

    // Fallback: first sentence of summary
    const summaryMatch = content.match(/# 🎯 核心结论\s*\n\n([^。！？]+[。！？])/);
    return summaryMatch ? summaryMatch[1].slice(0, 50) : '';
}

export function getAllLennyPosts(): LennyPost[] {
    const files = fs.readdirSync(LEARNING_DIR);
    const lennyFiles = files.filter(f => f.includes('lenny-') && f.endsWith('.md'));

    const posts: LennyPost[] = [];

    for (const file of lennyFiles) {
        try {
            const filePath = path.join(LEARNING_DIR, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const { data, content } = matter(fileContent);

            const id = file.replace('.md', '');
            const guest = extractGuestName(file, data.title || '');
            const tags: string[] = data.tags || [];
            const category = inferCategory(content, tags);
            const summary = extractSummary(content);
            const quote = extractQuote(content);

            posts.push({
                id,
                guest,
                category,
                summary,
                quote,
                link: `/learning/${id}`
            });
        } catch (err) {
            console.error(`Error processing ${file}:`, err);
        }
    }

    // Sort by category, then by guest name
    return posts.sort((a, b) => {
        if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
        }
        return a.guest.localeCompare(b.guest);
    });
}

export function getLennyCategories(): string[] {
    return Object.keys(CATEGORY_KEYWORDS);
}
