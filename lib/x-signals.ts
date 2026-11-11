
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

const stripTags = (h: string) => h.replace(/<[^>]+>/g, '').trim();

/**
 * Restyle the generated briefing HTML for reading:
 * - signal tables -> numbered signal list (text first, source + link as meta)
 * - "**板块总结** | ..." blockquote -> labelled summary box
 * - "⚡ 行动建议" list -> numbered actions with a bold head and body, without "[建议N]" / emoji markers
 * - drop the opening "Daily Briefing" line (the page header already shows date and counts)
 * Older formats don't match these patterns and pass through unchanged.
 */
export function beautifyXSignalHtml(html: string): string {
    let out = html;

    out = out.replace(/^<blockquote>\s*<p><strong>Potato's Daily Briefing<\/strong>[\s\S]*?<\/blockquote>\s*(<hr>\s*)?/, '');

    out = out.replace(/<table>\s*<thead>([\s\S]*?)<\/thead>\s*<tbody>([\s\S]*?)<\/tbody>\s*<\/table>/g, (whole, head: string, body: string) => {
        if (!/来源/.test(head) || !/信号/.test(head)) return whole;
        const rows = [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((r) => [...r[1].matchAll(/<td>([\s\S]*?)<\/td>/g)].map((c) => c[1].trim()));
        const items = rows
            .filter((c) => c.length >= 3)
            .map(([num, source, text, link = '']) => {
                const href = link.match(/href="([^"]+)"/)?.[1];
                const meta = `<span class="xs-src">${stripTags(source)}</span>${href ? ` <a class="xs-link" href="${href}" target="_blank" rel="noopener noreferrer">原文 →</a>` : ''}`;
                return `<li><span class="xs-num">${stripTags(num)}</span><div><p class="xs-text">${text.replace(/<!--[\s\S]*?-->/g, '').trim()}</p><p class="xs-meta">${meta}</p></div></li>`;
            });
        return `<ol class="xs-signals">${items.join('')}</ol>`;
    });

    out = out.replace(/<blockquote>\s*<p><strong>板块总结<\/strong>\s*[|｜]\s*([\s\S]*?)<\/p>\s*<\/blockquote>/g,
        (_m, text: string) => `<div class="xs-summary"><p class="xs-label">板块总结</p><p>${text.trim()}</p></div>`);

    out = out.replace(/<p><strong>⚡?\s*行动建议<\/strong><\/p>\s*<ul>([\s\S]*?)<\/ul>/g, (_m, list: string) => {
        const items = [...list.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((li, i) => {
            const clean = li[1].replace(/^\s*💡\s*/, '').replace(/^\s*[\[【]\s*建议\s*\d+\s*[\]】]\s*/, '').trim();
            const m = clean.match(/^([^：:<]{2,40})[：:]\s*([\s\S]+)$/);
            const head = m ? m[1] : '';
            const body = m ? m[2] : clean;
            return `<li><span class="xs-num">${i + 1}</span><div>${head ? `<p class="xs-action-head">${head}</p>` : ''}<p class="xs-action-body">${body}</p></div></li>`;
        });
        return `<div class="xs-actions"><p class="xs-label">行动建议</p><ol>${items.join('')}</ol></div>`;
    });

    return out;
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
    const contentHtml = beautifyXSignalHtml(processedContent.toString());

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
