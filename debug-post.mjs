import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

const postsDirectory = path.join(process.cwd(), 'posts/x-signals');

async function getXSignalPostData(id) {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    console.log(`Reading: ${fullPath}`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    console.log("Parsing matter...");
    const matterResult = matter(fileContents);
    console.log("Matter data:", matterResult.data);

    console.log("Processing remark...");
    const processedContent = await remark()
        .use(remarkGfm)
        .use(html)
        .process(matterResult.content);
    const contentHtml = processedContent.toString();
    console.log("HTML length:", contentHtml.length);

    return {
        id,
        contentHtml,
        ...matterResult.data
    };
}

async function debug() {
    try {
        const id = '2026-03-04-daily-signals';
        const data = await getXSignalPostData(id);
        console.log("SUCCESS: Data loaded for", id);
        console.log("Title:", data.title);
    } catch (err) {
        console.error("FAILED with error:");
        console.error(err);
    }
}

debug();
