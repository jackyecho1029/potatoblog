import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllLevelCards, getArcadeSummary } from "../../lib/arcade";
import LearningPageClient from "../learning/LearningPageClient";

export const metadata: Metadata = {
    title: "Lenny 播客关卡",
    description: "Lenny's Podcast 深度访谈，拆成可以打的学习关卡。",
};

export default function LennyPage() {
    const cards = getAllLevelCards().filter((c) => c.isLenny);
    const counts = new Map<string, number>();
    cards.forEach((c) => counts.set(c.world, (counts.get(c.world) || 0) + 1));
    const worlds = getArcadeSummary().worlds
        .map((w) => ({ ...w, total: counts.get(w.category) || 0 }))
        .filter((w) => w.total > 0)
        .sort((a, b) => b.total - a.total);
    return (
        <Suspense>
            <LearningPageClient
                cards={cards}
                worlds={worlds}
                kicker="Lenny's Podcast"
                title="Lenny 播客关卡"
                intro={`${cards.length} 场产品、增长和领导力的深度访谈。新的几集带导师引导：先想、再看答案、最后去做。`}
                hideAuthors
            />
        </Suspense>
    );
}
