"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ArrowRight, Broadcast, Flag, MagnifyingGlass, MapPin, Ghost } from "@phosphor-icons/react";
import Header from "../components/Header";
import { today, useProgress } from "../../lib/progress";

export interface RegionDay {
    id: string;
    date: string;
    gameTitle: string;
    signalCount: number;
    boardCount: number;
}

/** Month → region name on the intel map. */
const REGIONS = ["启程平原", "霜雾森林", "雷鸣峡谷", "晨光港湾", "算力火山", "信号群岛", "代理荒原", "星图高原", "迷雾沼泽", "熔炉山脉", "极光冰原", "终章之巅"];
const WEEKDAY = ["日", "一", "二", "三", "四", "五", "六"];
export const xsKey = (id: string) => `xs:${id}`;

const noopSubscribe = () => () => {};

export default function XSignalsClient({ days }: { days: RegionDay[] }) {
    const p = useProgress();
    const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
    const [q, setQ] = useState("");
    const explored = (id: string) => !!p.read[xsKey(id)];
    const exploredCount = days.filter((d) => explored(d.id)).length;
    const latest = days[0];
    const isToday = mounted && latest?.date === today();

    const regions = useMemo(() => {
        const k = q.trim().toLowerCase();
        const list = k ? days.filter((d) => d.gameTitle.toLowerCase().includes(k) || d.date.includes(k)) : days;
        const map = new Map<string, RegionDay[]>();
        list.forEach((d) => {
            const key = d.date.slice(0, 7);
            map.set(key, [...(map.get(key) || []), d]);
        });
        return [...map.entries()];
    }, [days, q]);

    return (
        <div className="min-h-[100dvh] bg-paper-grid font-sans text-ink selection:bg-arcade-soft">
            <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
                <Header />

                <section className="grid gap-6 md:grid-cols-12 md:items-stretch">
                    <div className="md:col-span-7">
                        <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-arcade">Open World · Daily Intel</p>
                        <h1 className="mt-1 text-4xl font-black tracking-tighter md:text-5xl">X 情报大陆</h1>
                        <p className="mt-2 max-w-[56ch] text-ink-soft">
                            每天解锁一块新区域：我从 X 上筛出当天最值得看的信号，按板块整理，再配一个关卡名。逛完一块，插一面旗。
                        </p>
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-3 rounded-xl border-2 border-ink bg-white px-4 py-2 shadow-[0_3px_0_#1C1B1F]">
                                <Flag size={20} weight="fill" className="text-win" />
                                <span className="font-mono text-xl font-black">{exploredCount}<span className="text-zinc-300">/{days.length}</span></span>
                                <span className="text-xs font-bold text-zinc-500">区域已探索</span>
                            </div>
                            <label className="relative min-w-[220px] flex-1">
                                <span className="sr-only">搜索区域</span>
                                <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="搜关卡名或日期，如 2026-10"
                                    className="w-full rounded-xl border-2 border-ink bg-white py-2.5 pl-10 pr-3 text-sm shadow-[0_3px_0_#1C1B1F] focus:outline-none focus:ring-4 focus:ring-arcade-soft"
                                />
                            </label>
                        </div>
                    </div>

                    {latest && (
                        <Link
                            href={`/x-signals/${latest.id}`}
                            className="group relative flex flex-col justify-between overflow-hidden rounded-[1.25rem] border-2 border-ink bg-ink p-5 text-white shadow-[5px_5px_0_#E8622C] transition-transform active:translate-y-[2px] md:col-span-5"
                        >
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-arcade">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-arcade opacity-75" />
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-arcade" />
                                    </span>
                                    {isToday ? "今日新区域" : "最新区域"}
                                </span>
                                <span className="font-mono text-xs text-white/50">{latest.date}</span>
                            </div>
                            <p className="mt-4 text-2xl font-black leading-snug md:text-3xl">{latest.gameTitle}</p>
                            <div className="mt-5 flex items-center justify-between">
                                <span className="flex items-center gap-1.5 font-mono text-sm text-white/70">
                                    <Broadcast size={16} weight="fill" className="text-arcade" /> {latest.signalCount || "—"} 条信号 · {latest.boardCount} 个板块
                                </span>
                                <span className="flex items-center gap-1 font-bold text-arcade transition-transform group-hover:translate-x-1">
                                    进入 <ArrowRight size={16} weight="bold" />
                                </span>
                            </div>
                        </Link>
                    )}
                </section>

                <div className="mt-12 space-y-10">
                    {regions.map(([month, list]) => {
                        const m = Number(month.slice(5, 7));
                        const done = list.filter((d) => explored(d.id)).length;
                        return (
                            <section key={month}>
                                <div className="mb-3 flex items-end justify-between gap-4 border-b-2 border-ink pb-2">
                                    <h2 className="flex items-baseline gap-3">
                                        <span className="flex items-center gap-1.5 text-xl font-black"><MapPin size={20} weight="fill" className="text-arcade" />{REGIONS[(m - 1) % 12]}</span>
                                        <span className="font-mono text-xs font-bold text-zinc-500">{month.replace("-", " 年 ")} 月</span>
                                    </h2>
                                    <span className="font-mono text-xs font-black">
                                        <span className="text-win">{done}</span>/{list.length} 已探索
                                    </span>
                                </div>
                                <ol className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                                    {list.map((d, i) => (
                                        <li key={d.id}>
                                            <RegionTile day={d} explored={explored(d.id)} isNew={d.id === latest?.id} index={i} />
                                        </li>
                                    ))}
                                </ol>
                            </section>
                        );
                    })}
                    {regions.length === 0 && (
                        <div className="flex flex-col items-center gap-3 arcade-card px-6 py-14 text-center">
                            <Ghost size={44} className="text-zinc-400" />
                            <p className="font-bold">这片大陆上没有叫这个名字的区域</p>
                            <button onClick={() => setQ("")} className="btn-arcade btn-arcade-ghost">清除搜索</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function RegionTile({ day, explored, isNew, index }: { day: RegionDay; explored: boolean; isNew: boolean; index: number }) {
    const d = new Date(day.date + "T00:00:00");
    return (
        <Link
            href={`/x-signals/${day.id}`}
            className={`rise-in group relative flex h-full gap-3 rounded-xl border-2 border-ink p-2.5 transition-all active:translate-y-[2px] ${
                explored ? "bg-win-soft shadow-[0_3px_0_#2F9E6A]" : "bg-white shadow-[0_3px_0_#1C1B1F] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#1C1B1F]"
            }`}
            style={{ ["--i" as string]: index % 15 }}
        >
            <span className={`flex w-11 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-ink py-1 ${explored ? "bg-win text-white" : isNew ? "bg-arcade text-white" : "bg-paper text-ink"}`}>
                <span className="font-mono text-lg font-black leading-none">{d.getDate()}</span>
                <span className="mt-0.5 text-[10px] font-bold opacity-80">周{WEEKDAY[d.getDay()]}</span>
            </span>
            <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm font-bold leading-snug text-ink group-hover:text-arcade-deep">{day.gameTitle}</span>
                <span className="mt-1 flex items-center gap-1 font-mono text-[11px] text-zinc-500">
                    <Broadcast size={11} weight="bold" /> {day.signalCount || "—"}
                    {explored && <Flag size={12} weight="fill" className="ml-auto text-win" />}
                    {isNew && !explored && <span className="ml-auto rounded bg-arcade px-1 text-[9px] font-black text-white">NEW</span>}
                </span>
            </span>
        </Link>
    );
}
