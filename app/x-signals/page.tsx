import type { Metadata } from "next";
import { getSortedXSignalPostsData } from "../../lib/x-signals";
import XSignalsClient, { type RegionDay } from "./XSignalsClient";

// Revalidate every 60 seconds to pick up new posts
export const revalidate = 60;

export const metadata: Metadata = {
    title: "X 情报大陆",
    description: "每天解锁一块新区域：从 X 上筛出的当日信号，配一个关卡名。",
};

export default function XSignalsPage() {
    const days: RegionDay[] = getSortedXSignalPostsData()
        .filter((p) => !p.private)
        .map((p) => ({
            id: p.id,
            date: String(p.date).slice(0, 10),
            // Fall back to the older hand-written title, then the date, for days without a generated name.
            gameTitle: p.game_title || p.title_best || `${String(p.date).slice(0, 10)} 情报`,
            signalCount: p.signalCount || 0,
            boardCount: p.boardCount || 0,
        }));
    return <XSignalsClient days={days} />;
}
