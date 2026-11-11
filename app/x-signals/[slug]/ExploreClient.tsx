"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Flag, Plus, PushPin, Sword } from "@phosphor-icons/react";
import { actions, celebrateFrom, useProgress, XP } from "../../../lib/progress";

const CATEGORY = "X情报";
const key = (id: string) => `xs:${id}`;

/** Intel quests: the day's action suggestions, each can be taken into the player's quest log. */
export function IntelQuests({ id, title, quests }: { id: string; title: string; quests: string[] }) {
    const p = useProgress();
    if (!quests.length) return null;
    return (
        <section className="mt-10" aria-labelledby="intel-quests">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-arcade">Side Quests</p>
            <h2 id="intel-quests" className="mt-1 text-2xl font-black">今日情报任务</h2>
            <p className="mb-4 mt-1 text-sm text-zinc-500">从今天的信号里提炼出来的行动。接下一个，做完回来打勾 +{XP.completeAction} XP。</p>
            <ul className="grid gap-3 md:grid-cols-2">
                {quests.map((q, i) => {
                    const aid = `${key(id)}#${i}`;
                    const taken = p.actions.find((a) => a.id === aid);
                    const [head, ...rest] = q.split(/[：:]/);
                    const hasHead = rest.length > 0 && head.length <= 30;
                    return (
                        <li key={i} className="flex flex-col justify-between gap-3 rounded-xl border-2 border-ink bg-white p-4 shadow-[0_3px_0_#1C1B1F]">
                            <div>
                                <p className="flex items-start gap-2 font-black leading-snug">
                                    <Sword size={18} weight="fill" className="mt-0.5 shrink-0 text-arcade" />
                                    {hasHead ? head : `任务 ${i + 1}`}
                                </p>
                                <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{hasHead ? rest.join("：") : q}</p>
                            </div>
                            {taken ? (
                                <Link href="/me" className="inline-flex items-center gap-1.5 text-sm font-bold text-arcade-deep">
                                    {taken.doneAt ? <><CheckCircle size={16} weight="fill" className="text-win" /> 已完成</> : <><PushPin size={16} weight="fill" /> 已在任务清单</>}
                                    <ArrowRight size={14} weight="bold" />
                                </Link>
                            ) : (
                                <button
                                    onClick={(e) => {
                                        actions.addAction({ id: aid, postId: key(id), postTitle: title, lessonTitle: hasHead ? head : `情报任务 ${i + 1}`, text: hasHead ? rest.join("：") : q, category: CATEGORY });
                                        celebrateFrom(e.currentTarget);
                                    }}
                                    className="btn-arcade self-start text-sm"
                                >
                                    <Plus size={16} weight="bold" /> 接下任务 <span className="font-mono opacity-80">+{XP.addAction}</span>
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

/** End-of-region panel: plants the flag (read XP) when it scrolls into view. */
export function PlantFlag({ id, title }: { id: string; title: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const p = useProgress();
    const explored = !!p.read[key(id)];

    useEffect(() => {
        const el = ref.current;
        if (!el || explored) return;
        const io = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) {
                actions.markRead(key(id), title, CATEGORY);
                celebrateFrom(el.querySelector("[data-flag]"), true);
                io.disconnect();
            }
        }, { threshold: 0.5 });
        io.observe(el);
        return () => io.disconnect();
    }, [id, title, explored]);

    return (
        <div ref={ref} className="mt-12 flex flex-col items-center gap-2 rounded-[1.25rem] border-2 border-ink bg-ink px-6 py-8 text-center text-white shadow-[5px_5px_0_#2F9E6A]">
            <motion.span
                data-flag
                initial={false}
                animate={explored ? { y: 0, rotate: 0, scale: 1 } : { y: 6, rotate: -12, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 260, damping: 12 }}
                className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white/80 ${explored ? "bg-win" : "bg-white/10"}`}
            >
                <Flag size={34} weight="fill" />
            </motion.span>
            <p className="mt-2 font-mono text-xs font-bold uppercase tracking-[0.3em] text-arcade">{explored ? "Region Explored" : "Keep going"}</p>
            <p className="text-xl font-black">{explored ? "旗子已插下，这块区域探索完成" : "逛到这里，就能插旗"}</p>
            <p className="text-sm text-white/60">探索一块区域 +{XP.read} XP，算进今天的连续天数。</p>
        </div>
    );
}
