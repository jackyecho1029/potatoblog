"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MagnifyingGlass, MapTrifold, Notebook } from "@phosphor-icons/react";
import Header from "./components/Header";
import PlayerCard, { useTodaysLevel } from "./components/game/PlayerCard";
import WorldMap from "./components/game/WorldMap";
import LevelTile from "./components/game/LevelTile";
import MottoMarquee from "./components/game/MottoMarquee";
import type { PostData } from "../lib/posts";
import type { LevelCard, WorldSummary } from "../lib/arcade";

interface HomePageClientProps {
    posts: PostData[];
    arcade: {
        totals: { levels: number; mentorLevels: number; mentors: number };
        worlds: WorldSummary[];
        featured: LevelCard[];
        mottos: { id: string; motto: string; author: string }[];
    };
}

export default function HomePageClient({ posts, arcade }: HomePageClientProps) {
    const pick = useTodaysLevel(arcade.featured);
    const [q, setQ] = useState("");
    const notes = useMemo(() => {
        const visible = posts.filter((p) => !p.private);
        const k = q.trim().toLowerCase();
        return k ? visible.filter((p) => p.title.toLowerCase().includes(k) || p.tags?.some((t) => t.toLowerCase().includes(k))) : visible;
    }, [posts, q]);

    return (
        <div className="min-h-[100dvh] bg-paper-grid font-sans text-ink selection:bg-arcade-soft">
            <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
                <Header />

                {/* Lobby hero: copy left, player card right */}
                <section className="grid items-center gap-10 md:grid-cols-12 md:gap-12">
                    <div className="md:col-span-7">
                        <span className="chip-arcade bg-arcade-soft text-arcade-deep">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-arcade" /> 慢慢更新，深深扎根
                        </span>
                        <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tighter md:text-6xl">
                            把别人十年的功力，
                            <br />
                            拆成你<span className="relative whitespace-nowrap text-arcade">
                                今天能打
                                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden>
                                    <path d="M2 8 Q 50 2 100 7 T 198 5" fill="none" stroke="#1C1B1F" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                            </span>的一关。
                        </h1>
                        <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-ink-soft">
                            每一关是一场顶尖访谈：导师先抛问题让你想，再给答案，最后给你一件这周就能做的事。做完了，才算通关。
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href={pick ? `/learning/${pick.id}` : "/learning"} className="btn-arcade text-base">
                                开始今日关卡 <ArrowRight size={18} weight="bold" />
                            </Link>
                            <a href="#worlds" className="btn-arcade btn-arcade-ghost text-base">
                                <MapTrifold size={18} weight="bold" /> 世界地图
                            </a>
                        </div>
                        <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
                            <Stat n={arcade.totals.levels} label="关卡" />
                            <Stat n={arcade.totals.mentorLevels} label="导师引导关" />
                            <Stat n={arcade.totals.mentors} label="位导师" />
                        </dl>
                    </div>
                    <div className="md:col-span-5">
                        <PlayerCard featured={arcade.featured} />
                    </div>
                </section>

                <div className="mt-16">
                    <MottoMarquee mottos={arcade.mottos} />
                </div>

                {/* Worlds */}
                <section id="worlds" className="mt-20 scroll-mt-24">
                    <SectionHead kicker="World Map" title="选一个世界开始" note="每读完一关，那个世界的进度条就涨一格。" />
                    <WorldMap worlds={arcade.worlds} />
                </section>

                {/* New levels: horizontal rail */}
                <section className="mt-20">
                    <div className="flex items-end justify-between gap-4">
                        <SectionHead kicker="New Levels" title="新上架的关卡" note="都带导师引导和行动清单。" />
                        <Link href="/learning" className="mb-6 hidden shrink-0 items-center gap-1 font-bold text-arcade-deep hover:underline sm:flex">
                            全部关卡 <ArrowRight size={16} weight="bold" />
                        </Link>
                    </div>
                    <div className="-mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-6 md:-mx-8 md:px-8">
                        {arcade.featured.map((c, i) => (
                            <div key={c.id} className="w-[280px] shrink-0 snap-start md:w-[320px]">
                                <LevelTile card={c} index={i} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Author's notes (blog) */}
                <section className="mt-16">
                    <div className="grid gap-8 md:grid-cols-12">
                        <div className="md:col-span-4">
                            <SectionHead kicker="Field Notes" title="作者手记" note="我自己的实验、复盘和长文。" />
                            <label className="relative block">
                                <span className="sr-only">搜索手记</span>
                                <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="搜索标题或标签"
                                    className="w-full rounded-xl border-2 border-ink bg-white py-2.5 pl-10 pr-3 text-sm shadow-[3px_3px_0_#1C1B1F] focus:outline-none focus:ring-4 focus:ring-arcade-soft"
                                />
                            </label>
                        </div>
                        <ol className="divide-y-2 divide-ink/10 arcade-card px-5 md:col-span-8">
                            {notes.slice(0, 40).map((post) => (
                                <li key={post.id}>
                                    <Link href={`/posts/${post.id}`} className="group grid grid-cols-[auto_1fr] gap-x-4 py-4">
                                        <span className="pt-0.5 font-mono text-xs text-zinc-400">{post.date}</span>
                                        <span>
                                            <span className="block font-bold leading-snug text-ink group-hover:text-arcade-deep">{post.title}</span>
                                            {post.excerpt && <span className="mt-1 line-clamp-2 block text-sm text-zinc-500">{post.excerpt}</span>}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                            {notes.length === 0 && (
                                <li className="flex flex-col items-center gap-2 py-12 text-center text-zinc-500">
                                    <Notebook size={32} />
                                    没找到相关手记，换个关键词试试。
                                </li>
                            )}
                        </ol>
                    </div>
                </section>

                <footer className="mt-24 flex flex-col items-center justify-between gap-4 border-t-2 border-ink pt-8 text-xs font-bold uppercase tracking-widest text-zinc-500 md:flex-row">
                    <span>&copy; 2026 Jacky Potato · Built with high agency</span>
                    <div className="flex gap-6">
                        <Link href="/me" className="hover:text-arcade">我的冒险</Link>
                        <Link href="/about" className="hover:text-arcade">关于</Link>
                    </div>
                </footer>
            </main>
        </div>
    );
}

function Stat({ n, label }: { n: number; label: string }) {
    return (
        <div>
            <dt className="sr-only">{label}</dt>
            <dd className="font-mono text-3xl font-black text-ink">{n}</dd>
            <dd className="text-xs font-bold text-zinc-500">{label}</dd>
        </div>
    );
}

export function SectionHead({ kicker, title, note }: { kicker: string; title: string; note?: string }) {
    return (
        <div className="mb-6">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-arcade">{kicker}</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-ink md:text-4xl">{title}</h2>
            {note && <p className="mt-1 text-sm text-zinc-500">{note}</p>}
        </div>
    );
}
