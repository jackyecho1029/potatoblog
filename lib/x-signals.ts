
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

const postsDirectory = path.join(process.cwd(), 'posts/x-signals');

export interface XSignalPostData {
    id: string;
    title: string;
    date: string;
    tags?: string[];
    title_best?: string;
    anchor_thought?: string;
    game_title?: string; // fun Simplified Chinese level name (see scripts/backfill-x-signal-titles.py)
    signalCount?: number;
    boardCount?: number;
    contentHtml?: string;
    private?: boolean;
    password?: string;
}

/** Signals = table rows ("| 1 | ...") in the new format, or bold bullets in the early format. Boards = section headings. */
export function countSignals(md: string): { signalCount: number; boardCount: number } {
    // Three formats over time: table rows ("| 1 | ..."), bold bullets ("* [x] **..."), or "### [Author](url): ..." headings.
    const rows = (md.match(/^\|\s*\d+\s*\|/gm) || []).length;
    const bullets = (md.match(/^\*\s+(?:[^*\s]+\s+)?\*\*/gm) || []).length; // optional [tag]/emoji before the bold title
    const authorHeads = (md.match(/^###\s+\[/gm) || []).length;
    const boards = (md.match(/^#{2,3}\s+(?!\[)(?!.*(更新|重要观点|行动建议)).+$/gm) || []).length;
    return { signalCount: rows || bullets || authorHeads, boardCount: boards };
}

export function getSortedXSignalPostsData(): XSignalPostData[] {
    // Create dir if missing
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
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
            ...countSignals(matterResult.content),
            ...matterResult.data as {
                title: string;
                date: string;
                tags?: string[];
                title_best?: string;
                anchor_thought?: string;
                game_title?: string;
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

export async function getXSignalPostData(id: string): Promise<XSignalPostData> {
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
        ...matterResult.data as {
            title: string;
            date: string;
            tags?: string[];
            title_best?: string;
            anchor_thought?: string;
            game_title?: string;
        },
    };
}
