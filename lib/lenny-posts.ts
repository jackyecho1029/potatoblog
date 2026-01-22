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
    'AI构建者': [
        'OpenAI', 'Anthropic', 'Replit', 'Codex', 'GPT', 'Claude',
        'LLM', 'Agent', 'AI 产品', 'AI Platform', '大模型',
        'Cursor', 'Github Copilot', 'AI工程', 'Gemini', 'AI安全',
        'Lovable', 'GPT Engineer', 'AI构建'
    ],
    '产品与战略': [
        'Product Manager', 'PM', 'CPO', '产品经理', '产品战略',
        'Product Strategy', 'Positioning', '定位', 'PRD',
        'Product-Market Fit', 'PMF', 'Jobs-to-be-Done', 'JTBD',
        '品牌', 'Brand', 'Roadmap', '产品路线', '产品开发',
        'Onboarding', '新手引导', 'Feature', '功能'
    ],
    '增长与分发': [
        'Growth', '增长', 'Marketing', '营销', 'PLG',
        'Product-Led Growth', 'Acquisition', '获客', 'Retention', '留存',
        'Viral', '病毒增长', 'Funnel', '漏斗', 'A/B Test',
        'Analytics', '数据分析', 'CAC', 'LTV', 'Conversion',
        '转化', 'Monetization', '变现'
    ],
    '领导力与文化': [
        'Leadership', 'CEO', 'CTO', 'Executive', '领导力',
        'Management', '管理', 'Coach', '教练', 'Culture', '文化',
        'Team', '团队', 'Hiring', '招聘', 'Org', '组织',
        '决策', 'Decision', '沟通', 'Communication'
    ],
    '创业与融资': [
        'Startup', 'Founder', '创始人', '创业', 'VC', 'Venture Capital',
        'Investment', '投资', 'Fundraising', '融资', 'Seed', 'Series',
        'Unicorn', '独角兽', 'Exit', 'IPO', 'a16z',
        'Bootstrapping', '自举', 'Acquisition', '收购'
    ],
    '设计与体验': [
        'Design', '设计', 'UX', 'UI', 'User Experience',
        '用户体验', 'Designer', '设计师', 'Prototype', '原型',
        'Figma', 'Interaction', '交互', 'Visual', '视觉',
        'Interface', '界面', 'Usability', '可用性'
    ],
};

function inferCategory(content: string, tags: string[], title: string): string {
    // 组合分析文本：标题权重最高，然后是 tags，最后是内容片段
    const titleText = title.toLowerCase();
    const tagsText = tags.join(' ').toLowerCase();
    const contentText = content.slice(0, 2000).toLowerCase(); // 只分析前2000字符

    // 为每个分类计算匹配分数
    const scores: Record<string, number> = {};

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        let score = 0;

        for (const keyword of keywords) {
            const lowerKeyword = keyword.toLowerCase();

            // 标题匹配：权重 x5
            if (titleText.includes(lowerKeyword)) {
                score += 5;
            }

            // Tags 匹配：权重 x3
            if (tagsText.includes(lowerKeyword)) {
                score += 3;
            }

            // 内容匹配：权重 x1
            if (contentText.includes(lowerKeyword)) {
                score += 1;
            }
        }

        scores[category] = score;
    }

    // 找到得分最高的分类
    let maxScore = 0;
    let bestCategory = '产品与战略'; // 默认分类

    for (const [category, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            bestCategory = category;
        }
    }

    return bestCategory;
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
            const category = inferCategory(content, tags, data.title || '');
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
