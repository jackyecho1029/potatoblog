"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "../components/Header";
import { actions, levelOf, questStatus, streakOf, useProgress, XP } from "../../lib/progress";

export default function MeClient() {
    const p = useProgress();
    const lv = levelOf(p.xp);
    const streak = streakOf(p.activeDays);
    const quest = questStatus(p);
    const [tab, setTab] = useState<"todo" | "done">("todo");

    const cats = Object.entries(p.catXp).sort((a, b) => b[1] - a[1]);
    const todo = p.actions.filter((a) => !a.doneAt);
    const done = p.actions.filter((a) => a.doneAt);
    const answers = Object.entries(p.answers).filter(([, a]) => a.text.trim()).sort((a, b) => b[1].at - a[1].at);
    const learnedCount = Object.keys(p.learned).length;
    const readCount = Object.keys(p.read).length;
    const empty = p.xp === 0 && p.actions.length === 0;

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-800 font-sans selection:bg-amber-200">
            <main className="max-w-5xl mx-auto px-6 py-20">
                <Header />

                {/* Hero stats */}
                <section className="rounded-3xl bg-zinc-900 p-6 md:p-8 text-white">
                    <p className="text-xs tracking-[0.2em] text-amber-400 mb-2">我的学习冒险</p>
                    <div className="flex flex-wrap items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold">Lv.{lv.level} {lv.title}</h1>
                            <p className="mt-1 text-zinc-400 tabular-nums">
                                {p.xp} XP{lv.next ? ` · 距离下一级还差 ${lv.next - p.xp}` : " · 已满级"}
                            </p>
                        </div>
                        <div className="flex gap-6 text-center">
                            <Stat value={`🔥 ${streak}`} label="连续天数" />
                            <Stat value={readCount} label="读完" />
                            <Stat value={learnedCount} label="掌握的课" />
                            <Stat value={done.length} label="完成的行动" />
                        </div>
                    </div>
                    <div className="mt-6 h-2 rounded-full bg-zinc-700 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600" style={{ width: `${lv.pct}%` }} />
                    </div>
                </section>

                {empty && (
                    <section className="mt-8 rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-6 text-center">
                        <p className="text-lg font-semibold text-zinc-900">冒险还没开始 🌱</p>
                        <p className="mt-1 text-zinc-600">去学习中心挑一篇，答一道「先想一想」，再把一个行动加进清单。</p>
                        <Link href="/learning" className="mt-4 inline-block rounded-lg bg-amber-600 px-5 py-2.5 font-medium text-white hover:bg-amber-700">去学习中心 →</Link>
                    </section>
                )}

                <div className="mt-8 grid gap-6 md:grid-cols-5">
                    {/* Daily quest */}
                    <section className="md:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6">
                        <h2 className="font-bold text-zinc-900">🗺️ 今日任务</h2>
                        <p className="text-xs text-zinc-400 mt-0.5">两项都完成，额外 +{XP.dailyQuest} XP</p>
                        <ul className="mt-4 space-y-3 text-sm">
                            <QuestItem ok={quest.studied} text="学一课：答一道「先想一想」或翻开答案" />
                            <QuestItem ok={quest.acted} text="做一件事：完成清单里的一个行动" />
                        </ul>
                        {quest.bonusClaimed && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">今日任务完成 🎉 明天见</p>}
                    </section>

                    {/* Skill tree */}
                    <section className="md:col-span-3 rounded-2xl border border-zinc-200 bg-white p-6">
                        <h2 className="font-bold text-zinc-900">🌲 技能树</h2>
                        <p className="text-xs text-zinc-400 mt-0.5">每 100 XP 升一格，满 10 格算精通</p>
                        {cats.length === 0 ? (
                            <p className="mt-4 text-sm text-zinc-400">还没有点亮任何技能。</p>
                        ) : (
                            <ul className="mt-4 space-y-3">
                                {cats.map(([cat, xp]) => {
                                    const lvl = Math.min(10, Math.floor(xp / 100));
                                    const pct = lvl >= 10 ? 100 : (xp % 100);
                                    return (
                                        <li key={cat}>
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-zinc-800">{cat}</span>
                                                <span className="text-zinc-400 tabular-nums">{lvl}/10 · {xp} XP</span>
                                            </div>
                                            <div className="mt-1 flex gap-1">
                                                {Array.from({ length: 10 }).map((_, i) => (
                                                    <div key={i} className="h-2 flex-1 rounded-sm bg-zinc-100 overflow-hidden">
                                                        <div className="h-full bg-amber-500" style={{ width: i < lvl ? "100%" : i === lvl ? `${pct}%` : "0%" }} />
                                                    </div>
                                                ))}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                </div>

                {/* Action list */}
                <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="font-bold text-zinc-900">✅ 我的行动清单</h2>
                            <p className="text-xs text-zinc-400 mt-0.5">完成一个 +{XP.completeAction} XP。学到的东西，做了才算数。</p>
                        </div>
                        <div className="flex rounded-lg bg-zinc-100 p-1 text-sm">
                            {(["todo", "done"] as const).map((t) => (
                                <button key={t} onClick={() => setTab(t)} className={`rounded-md px-3 py-1 ${tab === t ? "bg-white shadow-sm font-medium text-zinc-900" : "text-zinc-500"}`}>
                                    {t === "todo" ? `待完成 ${todo.length}` : `已完成 ${done.length}`}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ul className="mt-4 divide-y divide-zinc-100">
                        {(tab === "todo" ? todo : done).map((a) => (
                            <li key={a.id} className="flex gap-3 py-4">
                                <input
                                    type="checkbox"
                                    checked={!!a.doneAt}
                                    onChange={() => actions.toggleAction(a.id)}
                                    className="mt-1 h-5 w-5 shrink-0 accent-amber-600 cursor-pointer"
                                    aria-label={`完成：${a.lessonTitle}`}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className={`font-medium ${a.doneAt ? "text-zinc-400 line-through" : "text-zinc-900"}`}>{a.lessonTitle}</p>
                                    <p className="mt-0.5 text-sm text-zinc-600">{a.text}</p>
                                    <p className="mt-1 text-xs text-zinc-400">
                                        来自 <Link href={`/learning/${a.postId}`} className="hover:text-amber-700 underline">{a.postTitle}</Link> · {a.category}
                                    </p>
                                </div>
                                <button onClick={() => actions.removeAction(a.id)} className="self-start text-xs text-zinc-300 hover:text-red-500" aria-label="移除">移除</button>
                            </li>
                        ))}
                        {(tab === "todo" ? todo : done).length === 0 && (
                            <li className="py-8 text-center text-sm text-zinc-400">
                                {tab === "todo" ? "清单是空的。在文章的「学以致用」里点「加入我的行动清单」。" : "还没有完成的行动。"}
                            </li>
                        )}
                    </ul>
                </section>

                {/* Reflections */}
                {answers.length > 0 && (
                    <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
                        <h2 className="font-bold text-zinc-900">✍️ 我的思考记录</h2>
                        <ul className="mt-4 space-y-4">
                            {answers.slice(0, 20).map(([k, a]) => {
                                const postId = k.split("#")[0];
                                return (
                                    <li key={k} className="border-l-2 border-amber-300 pl-4">
                                        <p className="text-sm text-zinc-800 whitespace-pre-wrap">{a.text}</p>
                                        <p className="mt-1 text-xs text-zinc-400">
                                            {new Date(a.at).toLocaleDateString("zh-CN")} · <Link href={`/learning/${postId}`} className="underline hover:text-amber-700">{p.read[postId]?.title ?? "回到原文"}</Link>
                                        </p>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                )}

                {/* Recent XP */}
                {p.log.length > 0 && (
                    <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
                        <h2 className="font-bold text-zinc-900">📜 最近获得</h2>
                        <ul className="mt-3 space-y-1.5 text-sm">
                            {p.log.slice(0, 10).map((l, i) => (
                                <li key={i} className="flex justify-between gap-4">
                                    <span className="truncate text-zinc-600">{l.label}</span>
                                    <span className="shrink-0 font-medium text-amber-700 tabular-nums">+{l.xp}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <p className="mt-10 text-center text-xs text-zinc-400">
                    进度只保存在这个浏览器里，换设备或清除浏览数据会丢失。{" "}
                    {!empty && (
                        <button
                            onClick={() => { if (confirm("确定要清空所有进度吗？这个操作无法恢复。")) actions.reset(); }}
                            className="underline hover:text-red-500"
                        >
                            清空进度
                        </button>
                    )}
                </p>
            </main>
        </div>
    );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
    return (
        <div>
            <div className="text-2xl font-bold tabular-nums">{value}</div>
            <div className="text-xs text-zinc-400">{label}</div>
        </div>
    );
}

function QuestItem({ ok, text }: { ok: boolean; text: string }) {
    return (
        <li className="flex items-start gap-2">
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${ok ? "bg-emerald-500 text-white" : "border border-zinc-300"}`}>{ok ? "✓" : ""}</span>
            <span className={ok ? "text-zinc-400 line-through" : "text-zinc-700"}>{text}</span>
        </li>
    );
}
