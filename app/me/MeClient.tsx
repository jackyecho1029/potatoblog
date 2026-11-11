"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowRight, CheckCircle, Circle, ClockCounterClockwise, Fire, GameController, Lock, NotePencil, Plant, Scroll, Sword, Trash, TreeStructure,
} from "@phosphor-icons/react";
import Header from "../components/Header";
import { AchievementIcon, WorldIcon } from "../components/game/icons";
import { achievementsOf, actions, celebrateFrom, levelOf, questStatus, streakOf, useProgress, XP } from "../../lib/progress";
import { worldOf } from "../../lib/categories";

export default function MeClient() {
    const p = useProgress();
    const lv = levelOf(p.xp);
    const streak = streakOf(p.activeDays);
    const quest = questStatus(p);
    const ach = achievementsOf(p);
    const [tab, setTab] = useState<"todo" | "done">("todo");

    const cats = Object.entries(p.catXp).sort((a, b) => b[1] - a[1]);
    const todo = p.actions.filter((a) => !a.doneAt);
    const done = p.actions.filter((a) => a.doneAt);
    const answers = Object.entries(p.answers).filter(([, a]) => a.text.trim()).sort((a, b) => b[1].at - a[1].at);
    const empty = p.xp === 0 && p.actions.length === 0;
    const list = tab === "todo" ? todo : done;

    return (
        <div className="min-h-[100dvh] bg-paper-grid font-sans text-ink selection:bg-arcade-soft">
            <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
                <Header />

                {/* Player profile */}
                <section className="grid gap-5 md:grid-cols-12">
                    <div className="relative min-w-0 overflow-hidden rounded-[1.5rem] border-2 border-ink bg-ink p-6 text-white shadow-[6px_6px_0_#E8622C] md:col-span-8 md:p-8">
                        <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-arcade">Player Profile</p>
                        <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-2">
                            <h1 className="text-4xl font-black tracking-tight md:text-5xl">Lv.{lv.level} {lv.title}</h1>
                            <p className="pb-1 font-mono text-sm text-white/60">{p.xp} XP{lv.next ? ` · 再拿 ${lv.next - p.xp} 升级` : " · MAX"}</p>
                        </div>
                        <div className="mt-6 h-5 overflow-hidden rounded-full border-2 border-white/30 bg-white/10">
                            <motion.div className="xp-shimmer h-full rounded-full bg-arcade" initial={{ width: 0 }} animate={{ width: `${Math.max(lv.pct, 2)}%` }} transition={{ type: "spring", stiffness: 60, damping: 18 }} />
                        </div>
                        <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <Stat icon={<Fire size={18} weight="fill" className={streak ? "animate-flicker text-arcade" : "text-white/30"} />} value={streak} label="连续天数" />
                            <Stat icon={<Scroll size={18} weight="fill" className="text-white/60" />} value={Object.keys(p.read).length} label="通关" />
                            <Stat icon={<Plant size={18} weight="fill" className="text-white/60" />} value={Object.keys(p.learned).length} label="掌握的课" />
                            <Stat icon={<Sword size={18} weight="fill" className="text-white/60" />} value={done.length} label="完成的任务" />
                        </dl>
                    </div>

                    <div className="min-w-0 arcade-card p-6 md:col-span-4">
                        <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-arcade">Daily Quest</p>
                        <h2 className="mt-1 text-2xl font-black">今日任务</h2>
                        <p className="text-xs text-zinc-500">两项都完成，额外 +{XP.dailyQuest} XP</p>
                        <ul className="mt-5 space-y-3 text-sm">
                            <QuestItem ok={quest.studied} text="学一课" hint="答一道「先想一想」或翻开答案" />
                            <QuestItem ok={quest.acted} text="做一件事" hint="完成任务清单里的一项" />
                        </ul>
                        {quest.bonusClaimed ? (
                            <p className="mt-5 rounded-xl border-2 border-ink bg-win-soft px-3 py-2 text-sm font-bold text-win">今日任务完成，明天见</p>
                        ) : (
                            <Link href="/learning" className="btn-arcade mt-5 w-full text-sm">去选关 <ArrowRight size={16} weight="bold" /></Link>
                        )}
                    </div>
                </section>

                {empty && (
                    <section className="mt-6 flex flex-col items-center gap-3 rounded-[1.5rem] border-2 border-dashed border-ink bg-white/70 px-6 py-10 text-center">
                        <GameController size={44} weight="duotone" className="text-arcade" />
                        <p className="text-xl font-black">冒险还没开始</p>
                        <p className="max-w-md text-ink-soft">挑一关，答一道「先想一想」，再接下一个支线任务。你的第一份 XP 会出现在这里。</p>
                        <Link href="/learning" className="btn-arcade mt-2">开始第一关 <ArrowRight size={16} weight="bold" /></Link>
                    </section>
                )}

                {/* Quest log */}
                <section className="mt-8 arcade-card overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-paper px-6 py-4">
                        <div>
                            <h2 className="flex items-center gap-2 text-xl font-black"><Sword size={22} weight="fill" className="text-arcade" /> 任务清单</h2>
                            <p className="text-xs text-zinc-500">完成一个 +{XP.completeAction} XP。学到的东西，做了才算数。</p>
                        </div>
                        <div className="flex rounded-xl border-2 border-ink bg-white p-1 text-sm font-bold">
                            {(["todo", "done"] as const).map((t) => (
                                <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-3 py-1 transition-colors ${tab === t ? "bg-ink text-white" : "text-ink-soft"}`}>
                                    {t === "todo" ? `进行中 ${todo.length}` : `已完成 ${done.length}`}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ul className="divide-y-2 divide-ink/10">
                        <AnimatePresence initial={false}>
                            {list.map((a) => (
                                <motion.li
                                    key={a.id}
                                    layout
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 40 }}
                                    transition={{ type: "spring", stiffness: 160, damping: 20 }}
                                    className="flex gap-4 px-6 py-4"
                                >
                                    <button
                                        onClick={(e) => { const finishing = !a.doneAt; actions.toggleAction(a.id); if (finishing) celebrateFrom(e.currentTarget, true); }}
                                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-ink transition-all active:translate-y-[2px] ${a.doneAt ? "bg-win text-white shadow-[0_2px_0_#1C1B1F]" : "bg-white shadow-[0_3px_0_#1C1B1F] hover:bg-win-soft"}`}
                                        aria-label={a.doneAt ? `标记未完成：${a.lessonTitle}` : `完成：${a.lessonTitle}`}
                                    >
                                        {a.doneAt && <CheckCircle size={18} weight="fill" />}
                                    </button>
                                    <div className="min-w-0 flex-1">
                                        <p className={`font-black ${a.doneAt ? "text-zinc-400 line-through" : "text-ink"}`}>{a.lessonTitle}</p>
                                        <p className="mt-0.5 text-sm text-ink-soft">{a.text}</p>
                                        <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                                            <span className="chip-arcade !border !px-2 !py-0 !text-[10px]"><WorldIcon name={worldOf(a.category).icon} size={11} weight="bold" /> {worldOf(a.category).name}</span>
                                            <Link href={`/learning/${a.postId}`} className="truncate underline hover:text-arcade-deep">{a.postTitle}</Link>
                                        </p>
                                    </div>
                                    {!a.doneAt && <span className="hidden self-center font-mono text-sm font-black text-arcade sm:block">+{XP.completeAction}</span>}
                                    <button onClick={() => actions.removeAction(a.id)} className="self-start p-1 text-zinc-300 hover:text-[#C2412D]" aria-label="移除任务">
                                        <Trash size={16} />
                                    </button>
                                </motion.li>
                            ))}
                        </AnimatePresence>
                        {list.length === 0 && (
                            <li className="px-6 py-10 text-center text-sm text-zinc-500">
                                {tab === "todo" ? "没有进行中的任务。在关卡的「支线任务」里点「接下这个任务」。" : "还没有完成的任务。"}
                            </li>
                        )}
                    </ul>
                </section>

                <div className="mt-8 grid gap-6 md:grid-cols-12">
                    {/* Skill tree */}
                    <section className="min-w-0 self-start arcade-card p-6 md:col-span-5">
                        <h2 className="flex items-center gap-2 text-xl font-black"><TreeStructure size={22} weight="fill" className="text-win" /> 技能树</h2>
                        <p className="text-xs text-zinc-500">每 100 XP 点亮一格，10 格精通</p>
                        {cats.length === 0 ? (
                            <p className="mt-6 text-sm text-zinc-400">还没有点亮任何技能。</p>
                        ) : (
                            <ul className="mt-5 space-y-4">
                                {cats.map(([cat, xp]) => {
                                    const w = worldOf(cat);
                                    const lvl = Math.min(10, Math.floor(xp / 100));
                                    const part = lvl >= 10 ? 100 : xp % 100;
                                    return (
                                        <li key={cat}>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-2 font-bold"><WorldIcon name={w.icon} size={16} weight="fill" className="text-arcade" /> {w.name}</span>
                                                <span className="font-mono text-xs text-zinc-500">{lvl}/10 · {xp} XP</span>
                                            </div>
                                            <div className="mt-1.5 grid grid-cols-10 gap-1">
                                                {Array.from({ length: 10 }).map((_, i) => (
                                                    <div key={i} className="h-3 overflow-hidden rounded-[3px] border-2 border-ink bg-white">
                                                        <div className="h-full bg-arcade" style={{ width: i < lvl ? "100%" : i === lvl ? `${part}%` : "0%" }} />
                                                    </div>
                                                ))}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>

                    {/* Achievements */}
                    <section className="min-w-0 arcade-card p-6 md:col-span-7">
                        <div className="flex items-end justify-between">
                            <h2 className="text-xl font-black">成就墙</h2>
                            <span className="font-mono text-sm font-black">{ach.filter((a) => a.unlocked).length}/{ach.length}</span>
                        </div>
                        <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
                            {ach.map((a) => (
                                <li key={a.id} className="group relative flex flex-col items-center text-center" title={`${a.title}：${a.desc}`}>
                                    <span className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 ${a.unlocked ? "border-ink bg-[#F5C04A] text-ink shadow-[0_4px_0_#1C1B1F]" : "border-dashed border-zinc-300 bg-zinc-50 text-zinc-300"}`}>
                                        {a.unlocked ? <AchievementIcon name={a.icon} size={30} weight="fill" /> : <Lock size={24} weight="bold" />}
                                    </span>
                                    <span className={`mt-2 text-xs font-black leading-tight ${a.unlocked ? "text-ink" : "text-zinc-400"}`}>{a.title}</span>
                                    <span className="mt-0.5 break-all font-mono text-[10px] text-zinc-400">{a.unlocked ? a.desc : `${a.current}/${a.target}`}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-12">
                    {answers.length > 0 && (
                        <section className="min-w-0 arcade-card p-6 md:col-span-7">
                            <h2 className="flex items-center gap-2 text-xl font-black"><NotePencil size={22} weight="fill" className="text-arcade" /> 我的思考记录</h2>
                            <ul className="mt-4 space-y-4">
                                {answers.slice(0, 20).map(([k, a]) => {
                                    const postId = k.split("#")[0];
                                    return (
                                        <li key={k} className="border-l-4 border-arcade pl-4">
                                            <p className="whitespace-pre-wrap text-sm text-ink">{a.text}</p>
                                            <p className="mt-1 text-xs text-zinc-400">
                                                {new Date(a.at).toLocaleDateString("zh-CN")} · <Link href={`/learning/${postId}`} className="underline hover:text-arcade-deep">{p.read[postId]?.title ?? "回到关卡"}</Link>
                                            </p>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    )}
                    {p.log.length > 0 && (
                        <section className={`min-w-0 arcade-card p-6 ${answers.length ? "md:col-span-5" : "md:col-span-12"}`}>
                            <h2 className="flex items-center gap-2 text-xl font-black"><ClockCounterClockwise size={22} weight="bold" /> 最近获得</h2>
                            <ul className="mt-4 space-y-2 text-sm">
                                {p.log.slice(0, 12).map((l, i) => (
                                    <li key={i} className="flex items-center justify-between gap-4">
                                        <span className="truncate text-ink-soft">{l.label}</span>
                                        <span className="shrink-0 rounded-md border-2 border-ink bg-[#F5C04A] px-1.5 font-mono text-xs font-black">+{l.xp}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <p className="mt-12 text-center text-xs text-zinc-500">
                    进度只保存在这个浏览器里，换设备或清除浏览数据会丢失。{" "}
                    {!empty && (
                        <button onClick={() => { if (confirm("确定要清空所有进度吗？这个操作无法恢复。")) actions.reset(); }} className="underline hover:text-[#C2412D]">
                            清空进度
                        </button>
                    )}
                </p>
            </main>
        </div>
    );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
    return (
        <div>
            <dd className="flex items-center gap-1.5 font-mono text-2xl font-black">{icon}{value}</dd>
            <dt className="text-xs text-white/50">{label}</dt>
        </div>
    );
}

function QuestItem({ ok, text, hint }: { ok: boolean; text: string; hint: string }) {
    return (
        <li className="flex items-start gap-3">
            {ok ? <CheckCircle size={22} weight="fill" className="shrink-0 text-win" /> : <Circle size={22} weight="bold" className="shrink-0 text-zinc-300" />}
            <span>
                <span className={`block font-black ${ok ? "text-zinc-400 line-through" : "text-ink"}`}>{text}</span>
                <span className="text-xs text-zinc-500">{hint}</span>
            </span>
        </li>
    );
}
