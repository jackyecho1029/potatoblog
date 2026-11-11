import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllLevelCards, getArcadeSummary } from "../../lib/arcade";
import LearningPageClient from "./LearningPageClient";

export const metadata: Metadata = {
    title: "选关",
    description: "顶尖访谈拆成的学习关卡：导师引导、思考框架和行动清单。",
};

export default function LearningPage() {
    // Lenny episodes also live on /lenny, but they are first-class levels here too.
    const cards = getAllLevelCards();
    const { worlds } = getArcadeSummary();
    return (
        <Suspense>
            <LearningPageClient cards={cards} worlds={worlds} />
        </Suspense>
    );
}
