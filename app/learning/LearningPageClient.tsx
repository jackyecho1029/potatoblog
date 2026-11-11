"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Compass, Funnel, MagnifyingGlass, SealCheck, Ghost } from "@phosphor-icons/react";
import Header from "../components/Header";
import WorldMap from "../components/game/WorldMap";
import LevelTile from "../components/game/LevelTile";
import type { LevelCard, WorldSummary } from "../../lib/arcade";
import { useProgress } from "../../lib/progress";

interface Props {
    cards: LevelCard[];
    worlds: WorldSummary[];
    kicker?: string;
    title?: string;
    intro?: string;
    hideAuthors?: boolean;
}

const PAGE = 24;

export default function LearningPageClient({ cards, worlds, kicker = "Level Select", title = "选关", intro, hideAuthors = false }: Props) {
    const params = useSearchParams();
    const p = useProgress();
    const [world, setWorld] = useState<string | null>(params.get("world"));
    const [author, setAuthor] = useState<string | null>(null);
    const [q, setQ] = useState("");
    const [mentorOnly, setMentorOnly] = useState(false);
    const [unclearedOnly, setUnclearedOnly] = useState(false);
    const [limit, setLimit] = useState(PAGE);

    const authors = useMemo(() => {
        const m = new Map<string, number>();
        cards.forEach((c) => c.author && m.set(c.author, (m.get(c.author) || 0) + 1));
        return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14);
    }, [cards]);

    const filtered = useMemo(() => {
        const k = q.trim().toLowerCase();
        return cards.filter((c) =>
            (!world || c.world === world) &&
            (!author || c.author === author) &&
            (!mentorOnly || c.lessonCount > 0) &&
            (!unclearedOnly || !p.read[c.id]) &&
            (!k || c.title.toLowerCase().includes(k) || c.author.toLowerCase().includes(k) || (c.motto ?? "").toLowerCase().includes(k)),
        );
    }, [cards, world, author, mentorOnly, unclearedOnly, q, p.read]);

    const reset = () => { setWorld(null); setAuthor(null); setQ(""); setMentorOnly(false); setUnclearedOnly(false); setLimit(PAGE); };
    const clearedTotal = cards.filter((c) => p.read[c.id]).length;

    return (
        <div className="min-h-[100dvh] bg-paper-grid font-sans text-ink selection:bg-arcade-soft">
            <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
                <Header />

                <section className="grid gap-6 md:grid-cols-12 md:items-end">
                    <div className="md:col-span-8">
                        <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-arcade">{kicker}</p>
                        <h1 className="mt-1 text-4xl font-black tracking-tighter md:text-5xl">{title}</h1>
                        <p className="mt-2 max-w-[60ch] text-ink-soft">{intro ?? "每一关是一场顶尖访谈。带罗盘标记的是导师引导关：先想、再看答案、最后去做。"}</p>
                    </div>
                    <div className="flex gap-3 md:col-span-4 md:justify-end">
                        <div className="arcade-card px-4 py-3">
                            <p className="font-mono text-2xl font-black">{clearedTotal}<span className="text-zinc-300">/{cards.length}</span></p>
                            <p className="text-xs font-bold text-zinc-500">已通关</p>
                        </div>
                    </div>
                </section>

                <section className="mt-10">
                    <WorldMap worlds={worlds} selected={world} onSelect={(w) => { setWorld(w); setLimit(PAGE); }} />
                </section>

                {/* Filter console */}
                <section className="sticky top-3 z-40 mt-8 arcade-card p-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        <label className="relative flex-1">
                            <span className="sr-only">搜索关卡</span>
                            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                value={q}
                                onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }}
                                placeholder="搜标题、导师、心法…"
                                className="w-full rounded-xl border-2 border-ink bg-paper py-2.5 pl-10 pr-3 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-arcade-soft"
                            />
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <Toggle on={mentorOnly} onClick={() => { setMentorOnly((v) => !v); setLimit(PAGE); }} icon={<Compass size={15} weight="bold" />} label="导师关" />
                            <Toggle on={unclearedOnly} onClick={() => { setUnclearedOnly((v) => !v); setLimit(PAGE); }} icon={<SealCheck size={15} weight="bold" />} label="未通关" />
                        </div>
                    </div>
                    {!hideAuthors && <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        <span className="flex shrink-0 items-center gap-1 pr-1 text-xs font-bold text-zinc-400"><Funnel size={14} /> 导师</span>
                        {authors.map(([a, n]) => (
                            <button
                                key={a}
                                onClick={() => { setAuthor(author === a ? null : a); setLimit(PAGE); }}
                                className={`shrink-0 rounded-full border-2 px-3 py-1 text-xs font-bold transition-colors ${author === a ? "border-ink bg-ink text-white" : "border-ink/15 bg-white text-ink-soft hover:border-ink"}`}
                            >
                                {a} <span className="font-mono opacity-50">{n}</span>
                            </button>
                        ))}
                    </div>}
                </section>

                <p className="mt-6 font-mono text-xs font-bold text-zinc-500">
                    {filtered.length} 关{(world || author || q || mentorOnly || unclearedOnly) && <button onClick={reset} className="ml-3 text-arcade-deep underline">清除筛选</button>}
                </p>

                <section className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.slice(0, limit).map((c, i) => (
                        <div key={c.id} className={i === 0 && !q ? "sm:col-span-2 lg:row-span-2" : ""}>
                            <LevelTile card={c} index={i} hero={i === 0 && !q} />
                        </div>
                    ))}
                </section>

                {filtered.length === 0 && (
                    <div className="mt-6 flex flex-col items-center gap-3 arcade-card px-6 py-14 text-center">
                        <Ghost size={44} className="text-zinc-400" />
                        <p className="font-bold">这里一关都没有</p>
                        <p className="text-sm text-zinc-500">可能是筛选太严了，或者这个世界你已经全部通关。</p>
                        <button onClick={reset} className="btn-arcade btn-arcade-ghost mt-2">清除筛选</button>
                    </div>
                )}

                {filtered.length > limit && (
                    <div className="mt-10 flex justify-center">
                        <button onClick={() => setLimit((l) => l + PAGE)} className="btn-arcade btn-arcade-ink">
                            再加载 {Math.min(PAGE, filtered.length - limit)} 关 <span className="font-mono opacity-60">({filtered.length - limit} 剩余)</span>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

function Toggle({ on, onClick, icon, label }: { on: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            aria-pressed={on}
            className={`inline-flex items-center gap-1.5 rounded-xl border-2 border-ink px-3 py-2 text-sm font-bold transition-all active:translate-y-[2px] ${on ? "bg-arcade text-white shadow-[0_2px_0_#1C1B1F]" : "bg-white text-ink shadow-[0_3px_0_#1C1B1F]"}`}
        >
            {icon} {label}
        </button>
    );
}
