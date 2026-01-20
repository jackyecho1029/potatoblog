import * as fs from 'fs';
import * as path from 'path';

const META_FILE = path.join(process.cwd(), 'posts/lenny-meta.json');
const INDEX_FILE = path.join(process.cwd(), 'posts/lenny-index.md');

function generateIndex() {
    if (!fs.existsSync(META_FILE)) {
        console.error("Meta file not found. Run the processor first.");
        return;
    }

    const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
    const categories: { [key: string]: any[] } = {
        "AI构建者": [],
        "产品与战略": [],
        "增长与分发": [],
        "领导力与文化": []
    };

    // Sort guests and categorize
    Object.keys(meta).sort().forEach(guest => {
        const data = meta[guest];
        const cat = data.category || "产品与战略";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push({ name: guest, ...data });
    });

    let markdown = `# 🎙️ Lenny's Podcast 深度访谈全索引\n\n`;
    markdown += `> 这里收录了 Lenny's Podcast 的 300+ 场深度访谈笔记。我们运用**金字塔原理**和**查理·芒格思维模型**，为您提取了最核心的商业逻辑和 AI 时代生存法则。\n\n`;

    const categoryOrder = ["AI构建者", "产品与战略", "增长与分发", "领导力与文化"];

    categoryOrder.forEach(cat => {
        if (categories[cat].length > 0) {
            markdown += `## 🟢 ${cat} (${categories[cat].length})\n\n`;
            markdown += `| 受访者 | 嘉宾背景 | 核心观点摘要 | 深度笔记 |\n`;
            markdown += `| :--- | :--- | :--- | :--- |\n`;

            categories[cat].forEach(item => {
                const link = `./learning/${item.slug}`;
                markdown += `| **${item.name}** | ${item.guest_bio} | ${item.one_line_summary} | [阅读笔记](${link}) |\n`;
            });
            markdown += `\n`;
        }
    });

    markdown += `---\n*最后更新时间: ${new Date().toLocaleString()}*`;

    fs.writeFileSync(INDEX_FILE, markdown);
    console.log(`✅ Index Page generated: ${INDEX_FILE}`);
}

generateIndex();
