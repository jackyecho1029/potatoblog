/** Old posts mix 繁/简 and Lenny uses its own set; fold them into one label space. */
export function normalizeCategory(c?: string): string {
    const s = (c || "").replace(/["']/g, "").trim();
    const map: Record<string, string> = {
        "思維成長": "思维成长", "商業創業": "商业创业", "科技趨勢": "科技趋势", "職場效率": "职场效率",
        "人際關係": "人际关系", "投資理財": "投资理财", "創意藝術": "创意艺术", "生活与效率": "职场效率",
        // Lenny's inferred categories
        "产品与战略": "商业创业", "增长与分发": "商业创业", "创业与融资": "商业创业",
        "领导力与文化": "职场效率", "设计与体验": "创意艺术",
    };
    return map[s] || s || "思维成长";
}

/** Each category is a "world" on the learning map. `icon` is a Phosphor icon name resolved in the UI. */
export interface World {
    category: string;
    name: string;
    tagline: string;
    icon: "Brain" | "Storefront" | "Flask" | "Robot" | "Lightning" | "Heartbeat" | "UsersThree" | "Coins" | "PaintBrush" | "PenNib";
}

export const WORLDS: World[] = [
    { category: "思维成长", name: "心智森林", tagline: "换一种方式想问题", icon: "Brain" },
    { category: "商业创业", name: "商业港口", tagline: "从想法到生意", icon: "Storefront" },
    { category: "AI构建者", name: "AI 锻造厂", tagline: "用 AI 造东西", icon: "Robot" },
    { category: "科技趋势", name: "未来实验室", tagline: "看清下一个十年", icon: "Flask" },
    { category: "职场效率", name: "效率工坊", tagline: "少做无用功", icon: "Lightning" },
    { category: "创意艺术", name: "创意画室", tagline: "做出自己的东西", icon: "PaintBrush" },
    { category: "健康生活", name: "能量神殿", tagline: "身体是一切的底盘", icon: "Heartbeat" },
    { category: "人际关系", name: "关系酒馆", tagline: "和人相处的手艺", icon: "UsersThree" },
    { category: "投资理财", name: "财富矿山", tagline: "让钱替你工作", icon: "Coins" },
    { category: "创作技能", name: "写作高塔", tagline: "把想法写清楚", icon: "PenNib" },
];

export function worldOf(category?: string): World {
    const c = normalizeCategory(category);
    return WORLDS.find((w) => w.category === c) ?? { category: c, name: c, tagline: "", icon: "Brain" };
}
