"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Circle, Fire, Lightning, Sparkle } from "@phosphor-icons/react";
import type { LevelCard } from "../../../lib/arcade";
import { levelOf, questStatus, streakOf, today, useProgress, XP } from "../../../lib/progress";

const noopSubscribe = () => () => {};

/** Pick a stable "today's level" among recent mentor levels, preferring ones the player hasn't cleared. */
export function useTodaysLevel(cards: LevelCard[]) {
    const p = useProgress();
    const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
    return useMemo(() => {
        if (!mounted || !cards.length) return null;
        const seed = [...today()].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
        const pool = cards.filter((c) => !p.read[c.id]);
        const list = pool.length ? pool : cards;
        return list[seed % list.length];
    }, [cards, p.read, mounted]);
}

export default function PlayerCard({ featured }: { featured: LevelCard[] }) {
    const p = useProgress();
    const lv = levelOf(p.xp);
    const streak = streakOf(p.activeDays);
    const quest = questStatus(p);
    const pick = useTodaysLevel(featured);
    const isNew = p.xp === 0;

    return (
        <div className="relative">
            <motion.div
                className="absolute -right-3 -top-5 z-10 animate-floaty rounded-xl border-2 border-ink bg-[#F5C04A] px-3 py-1.5 font-mono text-xs font-black text-ink shadow-[3px_3px_0_#1C1B1F]"
                aria-hidden
            >
                今日任务 +{XP.dailyQuest} XP
            </motion.div>

            <div className="arcade-card overflow-hidden">
                <div className="flex items-center justify-between border-b-2 border-ink bg-ink px-5 py-4 text-white">
                    <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">Player 1</p>
                        <p className="text-xl font-black">{isNew ? "新玩家" : lv.title}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-mono text-3xl font-black leading-none">Lv.{lv.level}</p>
                        <p className="mt-1 flex items-center justify-end gap-1 font-mono text-xs text-arcade">
                            <Fire size={14} weight="fill" className={streak ? "animate-flicker" : ""} /> 连续 {streak} 天
                        </p>
                    </div>
                </div>

                <div className="px-5 py-4">
                    <div className="flex justify-between font-mono text-xs text-zinc-500">
                        <span>{p.xp} XP</span>
                        <span>{lv.next ? `下一级 ${lv.next}` : "MAX"}</span>
                    </div>
                    <div className="mt-1.5 h-4 overflow-hidden rounded-full border-2 border-ink bg-paper">
                        <motion.div
                            className="xp-shimmer h-full rounded-full bg-arcade"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(lv.pct, 3)}%` }}
                            transition={{ type: "spring", stiffness: 60, damping: 18 }}
                        />
                    </div>

                    <ul className="mt-5 space-y-2.5 text-sm">
                        <QuestRow ok={quest.studied} label="学一课" hint="答一道「先想一想」" />
                        <QuestRow ok={quest.acted} label="做一件事" hint="完成一个行动" />
                    </ul>
                </div>

                {pick ? (
                    <Link href={`/learning/${pick.id}`} className="group block border-t-2 border-ink bg-arcade-soft px-5 py-4 transition-colors hover:bg-[#F9D6C3]">
                        <p className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-arcade-deep">
                            <Sparkle size={12} weight="fill" /> 今日关卡 · {pick.author}
                        </p>
                        <p className="mt-1 line-clamp-2 font-bold leading-snug text-ink">{pick.title}</p>
                        <p className="mt-2 flex items-center gap-1 text-sm font-bold text-arcade-deep">
                            开始挑战 <ArrowRight size={14} weight="bold" className="transition-transform group-hover:translate-x-1" />
                        </p>
                    </Link>
                ) : (
                    <div className="border-t-2 border-ink bg-arcade-soft px-5 py-4">
                        <div className="h-3 w-24 animate-pulse rounded bg-white/70" />
                        <div className="mt-2 h-4 w-full animate-pulse rounded bg-white/70" />
                        <div className="mt-1.5 h-4 w-2/3 animate-pulse rounded bg-white/70" />
                    </div>
                )}
            </div>
        </div>
    );
}

function QuestRow({ ok, label, hint }: { ok: boolean; label: string; hint: string }) {
    return (
        <li className="flex items-center gap-3">
            {ok ? <CheckCircle size={22} weight="fill" className="text-win" /> : <Circle size={22} weight="bold" className="text-zinc-300" />}
            <span className={`font-bold ${ok ? "text-zinc-400 line-through" : "text-ink"}`}>{label}</span>
            <span className="text-xs text-zinc-400">{hint}</span>
            {!ok && <Lightning size={14} weight="fill" className="ml-auto text-arcade" />}
        </li>
    );
}
