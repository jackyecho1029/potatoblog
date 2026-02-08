import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

interface BlogPost {
    title: string;
    category: string;
    filePath: string;
    summary: string;
    date: string;
}

interface LibraryEntry {
    序号: number;
    标题: string;
    类别: string;
    文件位置: string;
    简介: string;
}

const POSTS_DIR = path.join(process.cwd(), 'posts');
const LIBRARY_PATH = path.join(process.cwd(), '..', 'content-library.md');

// 类别映射规则
const CATEGORY_MAP: Record<string, string> = {
    'Business': '商业模式',
    'AI': 'AI 工具',
    'Productivity': '生产力',
    'Writing': '内容创作',
    'Marketing': '内容创作',
    'Philosophy': '深度思考',
    'Tech': '技术教程',
    'Growth': '个人成长'
};

function inferCategory(tags: string[], content: string): string {
    // 根据 tags 推断类别
    if (tags.some(t => ['Business', 'Entrepreneurship', 'Revenue'].includes(t))) {
        return '商业模式';
    }
    if (tags.some(t => ['AI', 'Tool', 'Automation'].includes(t))) {
        return 'AI 工具';
    }
    if (tags.some(t => ['Productivity', 'Efficiency', 'System'].includes(t))) {
        return '生产力';
    }
    if (tags.some(t => ['Writing', 'Marketing', 'Storytelling', 'Narrative'].includes(t))) {
        return '内容创作';
    }
    if (tags.some(t => ['Philosophy', 'Thinking', 'Trust', 'Belief'].includes(t))) {
        return '深度思考';
    }

    // 默认为深度思考
    return '深度思考';
}

function extractSummary(content: string, title: string): string {
    // 提取文章前两段或核心观点
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    const firstParagraphs = lines.slice(0, 3).join(' ');

    // 压缩到两句话以内
    const sentences = firstParagraphs.split(/[。！？]/).filter(s => s.trim());
    return sentences.slice(0, 2).join('。') + '。';
}

async function scanBlogPosts(): Promise<BlogPost[]> {
    const posts: BlogPost[] = [];
    const files = fs.readdirSync(POSTS_DIR);

    for (const file of files) {
        if (!file.endsWith('.md')) continue;

        // 跳过 learning 子目录的文章（那些是笔记，不是长文）
        const fullPath = path.join(POSTS_DIR, file);
        if (fs.statSync(fullPath).isDirectory()) continue;

        const content = fs.readFileSync(fullPath, 'utf-8');
        const { data, content: markdown } = matter(content);

        // 只处理有标题的长文
        if (!data.title || markdown.length < 1000) continue;

        posts.push({
            title: data.title,
            category: inferCategory(data.tags || [], markdown),
            filePath: `posts/${file}`,
            summary: data.description || extractSummary(markdown, data.title),
            date: data.date || file.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || ''
        });
    }

    return posts.sort((a, b) => b.date.localeCompare(a.date));
}

function parseLibrary(content: string): LibraryEntry[] {
    const entries: LibraryEntry[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
        if (!line.startsWith('|') || line.includes('序号')) continue;

        const parts = line.split('|').map(p => p.trim()).filter(p => p);
        if (parts.length < 5) continue;

        entries.push({
            序号: parseInt(parts[0]),
            标题: parts[1],
            类别: parts[2],
            文件位置: parts[3].replace(/`/g, ''),
            简介: parts[4]
        });
    }

    return entries;
}

function updateLibrary(posts: BlogPost[], existingEntries: LibraryEntry[]): string {
    const existingPaths = new Set(existingEntries.map(e => e.文件位置));
    const newPosts = posts.filter(p => !existingPaths.has(p.filePath));

    if (newPosts.length === 0) {
        console.log('✅ 素材库已是最新，无需更新。');
        return '';
    }

    console.log(`📝 发现 ${newPosts.length} 篇新文章，正在更新素材库...`);

    // 生成新的表格行
    let nextId = Math.max(...existingEntries.map(e => e.序号), 0) + 1;
    const newRows = newPosts.map(post => {
        const row = `| ${nextId++} | ${post.title} | ${post.category} | \`${post.filePath}\` | ${post.summary} |`;
        console.log(`  + ${post.title}`);
        return row;
    });

    return newRows.join('\n');
}

async function main() {
    console.log('🔍 扫描博客文章...');
    const posts = await scanBlogPosts();
    console.log(`   找到 ${posts.length} 篇长文`);

    console.log('📖 读取现有素材库...');
    const libraryContent = fs.readFileSync(LIBRARY_PATH, 'utf-8');
    const existingEntries = parseLibrary(libraryContent);
    console.log(`   已有 ${existingEntries.length} 条记录`);

    const newRows = updateLibrary(posts, existingEntries);

    if (!newRows) {
        return;
    }

    // 找到表格结束位置并插入新行
    const tableEndIndex = libraryContent.indexOf('\n---\n', libraryContent.indexOf('| 序号 |'));
    const updatedContent =
        libraryContent.slice(0, tableEndIndex) +
        '\n' + newRows +
        libraryContent.slice(tableEndIndex);

    // 更新统计数据
    const totalCount = existingEntries.length + newRows.split('\n').length;
    const today = new Date().toISOString().split('T')[0];

    const finalContent = updatedContent
        .replace(/总素材数:\*\* \d+/, `总素材数:** ${totalCount}`)
        .replace(/最新更新:\*\* \d{4}-\d{2}-\d{2}/, `最新更新:** ${today}`)
        .replace(/待发布数:\*\* \d+/, `待发布数:** ${totalCount}`)
        .replace(/最后更新时间:\*\* \d{4}-\d{2}-\d{2} \d{2}:\d{2}/, `最后更新时间:** ${today} ${new Date().toTimeString().slice(0, 5)}`);

    fs.writeFileSync(LIBRARY_PATH, finalContent);
    console.log(`✅ 素材库更新完成！新增 ${newRows.split('\n').length} 条记录。`);
}

main().catch(console.error);
