
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

const postsDirectory = path.join(process.cwd(), 'posts');

export interface PostData {
    id: string;
    title: string;
    date: string;
    tags?: string[];
    excerpt?: string;
    contentHtml?: string;
    private?: boolean;
    password?: string;
}

/** First real paragraph of the post as plain text (skips headings, images, quotes, tables, code). */
function makeExcerpt(md: string, max = 90): string | undefined {
    let inCode = false;
    for (const raw of md.split('\n')) {
        const line = raw.trim();
        if (line.startsWith('```')) { inCode = !inCode; continue; }
        if (inCode || !line || /^(#|!\[|>|\||-{3,}|<|\*{3,})/.test(line)) continue;
        const text = line
            .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
            .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
            .replace(/[*_`~]/g, '')
            .replace(/^[-+]\s+|^\d+\.\s+/, '')
            .trim();
        if (text.length < 12) continue;
        return text.length > max ? text.slice(0, max) + '…' : text;
    }
    return undefined;
}

export function getSortedPostsData(): PostData[] {
    // Create posts dir if content missing to avoid crash
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory)
        // Filter out directories and non-.md files
        .filter((fileName) => {
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

        const data = matterResult.data as { title: string; date: string; tags?: string[]; private?: boolean; password?: string; description?: string };
        // Private posts must not leak body text into the public list.
        const excerpt = data.private ? undefined : (data.description || makeExcerpt(matterResult.content));

        // Combine the data with the id
        return {
            id,
            excerpt,
            ...data,
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

export function getAllPostIds() {
    if (!fs.existsSync(postsDirectory)) return [];

    const fileNames = fs.readdirSync(postsDirectory)
        .filter((fileName) => {
            const fullPath = path.join(postsDirectory, fileName);
            return fs.statSync(fullPath).isFile() && fileName.endsWith('.md');
        });
    return fileNames.map((fileName) => {
        return {
            params: {
                slug: fileName.replace(/\.md$/, ''),
            },
        };
    });
}

export async function getPostData(id: string): Promise<PostData> {
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

    // Combine the data with the id and contentHtml
    return {
        id,
        contentHtml,
        ...matterResult.data as { title: string; date: string; tags: string[]; private?: boolean; password?: string },
    };
}
