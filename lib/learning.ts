import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

const postsDirectory = path.join(process.cwd(), 'posts/learning');

// Category keywords for Lenny posts intelligent classification
const LENNY_CATEGORY_KEYWORDS: Record<string, string[]> = {
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

function inferLennyCategory(content: string, tags: string[], title: string): string {
    const titleText = title.toLowerCase();
    const tagsText = tags.join(' ').toLowerCase();
    const contentText = content.slice(0, 2000).toLowerCase();

    const scores: Record<string, number> = {};

    for (const [category, keywords] of Object.entries(LENNY_CATEGORY_KEYWORDS)) {
        let score = 0;

        for (const keyword of keywords) {
            const lowerKeyword = keyword.toLowerCase();
            if (titleText.includes(lowerKeyword)) score += 5;
            if (tagsText.includes(lowerKeyword)) score += 3;
            if (contentText.includes(lowerKeyword)) score += 1;
        }

        scores[category] = score;
    }

    let maxScore = 0;
    let bestCategory = '产品与战略';

    for (const [category, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            bestCategory = category;
        }
    }

    return bestCategory;
}

export interface LearningPostData {
    id: string;
    title: string;
    original_title?: string;
    author?: string;
    category?: string;
    date: string;
    tags?: string[];
    source_url?: string;
    thumbnail?: string;
    contentHtml?: string;
    title_best?: string;
    anchor_thought?: string;
    private?: boolean;
    password?: string;
}

export function getSortedLearningPostsData(): LearningPostData[] {
    // Create dir if missing
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory)
        .filter(fileName => {
            const fullPath = path.join(postsDirectory, fileName);
            return fs.statSync(fullPath).isFile() && fileName.endsWith('.md');
        });
    const allPostsData = fileNames.map((fileName) => {
        // Remove ".md" from file name to get id
        const id = fileName.replace(/\.md$/, '');

        // Read markdown file as string
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents);

        // Combine the data with the id
        return {
            id,
            ...matterResult.data as {
                title: string;
                date: string;
                tags?: string[];
                source_url?: string;
                thumbnail?: string;
                original_title?: string;
                title_best?: string;
                anchor_thought?: string;
                private?: boolean;
                password?: string;
            },
        };
    });
    // Sort posts by date
    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

export async function getLearningPostData(id: string): Promise<LearningPostData> {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
        .use(remarkGfm)
        .use(html)
        .process(matterResult.content);
    const contentHtml = processedContent.toString();

    // For Lenny posts, apply intelligent categorization
    const isLennyPost = id.includes('lenny-');
    let category = matterResult.data.category;

    if (isLennyPost) {
        category = inferLennyCategory(
            matterResult.content,
            (matterResult.data.tags as string[]) || [],
            (matterResult.data.title as string) || ''
        );
    }

    // Combine the data with the id and contentHtml
    return {
        id,
        contentHtml,
        ...matterResult.data as { title: string; date: string; tags: string[], source_url?: string },
        category, // Override with intelligent category for Lenny posts
    };
}
