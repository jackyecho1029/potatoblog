"use client";

import Link from "next/link";
import type { WorldSummary } from "../../../lib/arcade";
import { useProgress } from "../../../lib/progress";
import { WorldIcon } from "./icons";

/**
 * Compact world chips: icon, name, cleared/total, and a small % ring.
 * `onSelect` turns chips into filter toggles (level select); without it they link to the filtered hub.
 */
export default function WorldMap({ worlds, selected, onSelect }: { worlds: WorldSummary[]; selected?: string | null; onSelect?: (category: string | null) => void }) {
    const p = useProgress();
    const cleared = (category: string) => Object.values(p.read).filter((r) => r.category === category).length;

    return (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {worlds.map((w, i) => {
                const done = cleared(w.category);
                const pct = w.total && done ? Math.max(1, Math.min(100, Math.round((done / w.total) * 100))) : 0;
                const active = selected === w.category;
                const cls = `rise-in group flex items-center gap-2.5 rounded-xl border-2 border-ink px-2.5 py-2 text-left transition-all active:translate-y-[2px] ${
                    active ? "bg-ink text-white shadow-[0_2px_0_#E8622C]" : "bg-white text-ink shadow-[0_3px_0_#1C1B1F] hover:-translate-y-0.5 hover:shadow-[0_5px_0_#1C1B1F]"
                }`;
                const body = (
                    <>
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-ink transition-transform group-hover:-rotate-6 ${active ? "bg-arcade text-white" : "bg-arcade-soft text-arcade-deep"}`}>
                            <WorldIcon name={w.icon} size={18} weight="fill" />
                        </span>
                        <span className="min-w-0 flex-1 leading-tight">
                            <span className="block truncate text-sm font-black">{w.name}</span>
                            <span className={`font-mono text-[11px] ${active ? "text-white/60" : "text-zinc-500"}`}>{done}/{w.total} 关</span>
                        </span>
                        <Ring pct={pct} active={active} />
                    </>
                );
                return onSelect ? (
                    <button key={w.category} onClick={() => onSelect(active ? null : w.category)} className={cls} style={{ ["--i" as string]: i }} aria-pressed={active} title={w.tagline}>
                        {body}
                    </button>
                ) : (
                    <Link key={w.category} href={`/learning?world=${encodeURIComponent(w.category)}`} className={cls} style={{ ["--i" as string]: i }} title={w.tagline}>
                        {body}
                    </Link>
                );
            })}
        </div>
    );
}

function Ring({ pct, active }: { pct: number; active: boolean }) {
    const r = 13;
    const c = 2 * Math.PI * r;
    return (
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center" aria-label={`完成 ${pct}%`}>
            <svg viewBox="0 0 32 32" className="absolute inset-0 -rotate-90">
                <circle cx="16" cy="16" r={r} fill="none" stroke="currentColor" strokeOpacity={active ? 0.25 : 0.12} strokeWidth="3.5" />
                <circle cx="16" cy="16" r={r} fill="none" stroke="#2F9E6A" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} className="transition-[stroke-dashoffset] duration-700" />
            </svg>
            <span className="font-mono text-[9px] font-black">{pct}%</span>
        </span>
    );
}
