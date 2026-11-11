/** Old posts mix 繁/简 and Lenny uses its own set; fold them into one label space. */
export function normalizeCategory(c?: string): string {
    const s = (c || "").replace(/["']/g, "").trim();
    const map: Record<string, string> = {
        "思維成長": "思维成长", "商業創業": "商业创业", "科技趨勢": "科技趋势", "職場效率": "职场效率",
        "人際關係": "人际关系", "投資理財": "投资理财", "創意藝術": "创意艺术", "生活与效率": "职场效率",
    };
    return map[s] || s || "思维成长";
}
