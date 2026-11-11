"use client";

import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import type { WorldSummary } from "../../../lib/arcade";
import { useProgress } from "../../../lib/progress";
import { WorldIcon } from "./icons";

/**
 * Asymmetric bento of worlds. The two biggest worlds get large tiles; the rest are compact.
 * `onSelect` turns tiles into filter buttons (hub); without it tiles link to the hub filtered by world.
 */
export default function WorldMap({ worlds, selected, onSelect }: { worlds: WorldSummary[]; selected?: string | null; onSelect?: (category: string | null) => void }) {
    const p = useProgress();
    const cleared = (category: string) => Object.values(p.read).filter((r) => r.category === category).length;

    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
            {worlds.map((w, i) => {
                const done = cleared(w.category);
                const pct = w.total ? Math.min(100, Math.round((done / w.total) * 100)) : 0;
                const big = i < 2;
                // Small tiles sit 3 per row on md; if the last row would have 2, widen them to fill it.
                const smallCount = worlds.length - 2;
                const lastPair = !big && smallCount % 3 === 2 && i >= worlds.length - 2;
                const active = selected === w.category;
                const body = (
                    <>
                        <div className="flex items-start justify-between gap-2">
                            <span className={`flex items-center justify-center rounded-xl border-2 border-ink ${active ? "bg-white text-ink" : "bg-arcade text-white"} ${big ? "h-14 w-14" : "h-10 w-10"} shadow-[0_3px_0_#1C1B1F] transition-transform group-hover:-rotate-6`}>
                                <WorldIcon name={w.icon} size={big ? 30 : 20} weight="fill" />
                            </span>
                            {!onSelect && <ArrowUpRight size={18} weight="bold" className="text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />}
                        </div>
                        <div className={big ? "mt-6" : "mt-4"}>
                            <p className={`font-black leading-tight ${big ? "text-2xl" : "text-base"}`}>{w.name}</p>
                            <p className={`text-xs ${active ? "text-white/70" : "text-zinc-500"}`}>{w.tagline}</p>
                        </div>
                        <div className="mt-3">
                            <div className="flex justify-between font-mono text-[11px] font-bold">
                                <span>{done}/{w.total} 关</span>
                                <span>{pct}%</span>
                            </div>
                            <div className={`mt-1 h-2.5 overflow-hidden rounded-full border-2 border-ink ${active ? "bg-white/20" : "bg-paper"}`}>
                                <div className="h-full rounded-full bg-win transition-[width] duration-700" style={{ width: `${Math.max(pct, done ? 4 : 0)}%` }} />
                            </div>
                        </div>
                    </>
                );
                const cls = `rise-in group flex flex-col justify-between p-4 text-left arcade-card arcade-card-hover ${big ? "col-span-2 md:col-span-3 md:p-6" : lastPair ? "col-span-1 md:col-span-3" : "col-span-1 md:col-span-2"} ${active ? "!bg-ink text-white" : "text-ink"}`;
                return onSelect ? (
                    <button key={w.category} onClick={() => onSelect(active ? null : w.category)} className={cls} style={{ ["--i" as string]: i }} aria-pressed={active}>
                        {body}
                    </button>
                ) : (
                    <Link key={w.category} href={`/learning?world=${encodeURIComponent(w.category)}`} className={cls} style={{ ["--i" as string]: i }}>
                        {body}
                    </Link>
                );
            })}
        </div>
    );
}
