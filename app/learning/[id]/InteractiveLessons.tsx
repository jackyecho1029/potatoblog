"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { InteractiveHtml, LessonHtml } from "../../../lib/learning";
import { actions, useProgress, XP } from "../../../lib/progress";

interface Props {
    postId: string;
    postTitle: string;
    category: string;
    data: InteractiveHtml;
}

const CN_NUM = ["一", "二", "三", "四", "五", "六", "七", "八"];

export function LessonsSection({ postId, postTitle, category, data }: Props) {
    const progress = useProgress();
    if (!data.lessons.length) return null;
    const done = data.lessons.filter((_, i) => progress.learned[`${postId}#${i}`]).length;

    return (
        <section className="my-14" aria-labelledby="mentor-lessons">
            <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-amber-600 mb-2">MENTOR LESSONS</p>
                    <h2 id="mentor-lessons" className="text-2xl font-bold text-zinc-900">🧭 导师带你想</h2>
                    <p className="text-sm text-zinc-500 mt-1">先自己想，再翻答案。想过再看，记得更牢。</p>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-zinc-900 tabular-nums">{done}<span className="text-zinc-300">/{data.lessons.length}</span></div>
                    <div className="text-xs text-zinc-400">已掌握</div>
                </div>
            </div>
            <div className="space-y-5">
                {data.lessons.map((lesson, i) => (
                    <LessonCard key={i} index={i} lesson={lesson} postId={postId} postTitle={postTitle} category={category} />
                ))}
            </div>
        </section>
    );
}

function LessonCard({ index, lesson, postId, postTitle, category }: { index: number; lesson: LessonHtml; postId: string; postTitle: string; category: string }) {
    const progress = useProgress();
    const key = `${postId}#${index}`;
    const saved = progress.answers[key]?.text ?? "";
    const [draft, setDraft] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const revealed = open || !!progress.revealed[key];
    const learned = !!progress.learned[key];
    const action = progress.actions.find((a) => a.id === key);
    const text = draft ?? saved;

    const commit = () => {
        if (draft !== null && draft !== saved) actions.saveAnswer(postId, index, draft, category);
        setDraft(null);
    };

    return (
        <article className={`rounded-2xl border bg-white transition-shadow ${learned ? "border-emerald-200 shadow-[0_0_0_4px_rgba(16,185,129,0.06)]" : "border-zinc-200 shadow-sm hover:shadow-md"}`}>
            <header className="flex items-center gap-3 px-6 pt-5">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${learned ? "bg-emerald-500 text-white" : "bg-amber-100 text-amber-700"}`}>
                    {learned ? "✓" : CN_NUM[index] ?? index + 1}
                </span>
                <h3 className="text-lg font-semibold text-zinc-900 leading-snug">{lesson.title}</h3>
            </header>

            <div className="px-6 pt-4">
                <p className="text-xs font-semibold text-zinc-400 mb-1">🤔 先想一想</p>
                <div className="lesson-html text-zinc-800" dangerouslySetInnerHTML={{ __html: lesson.question }} />
                <textarea
                    value={text}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commit}
                    rows={2}
                    placeholder="写下你的答案（只保存在你的浏览器里）…"
                    className="mt-3 w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50/60 px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-100"
                />
                <div className="mt-1 flex justify-between text-[11px] text-zinc-400">
                    <span>{saved ? "✓ 已保存" : `写满 10 个字 +${XP.answer} XP`}</span>
                    {draft !== null && draft !== saved && (
                        <button onClick={commit} className="font-medium text-amber-700 hover:underline">保存</button>
                    )}
                </div>
            </div>

            {!revealed ? (
                <div className="px-6 pb-5 pt-3">
                    <button
                        onClick={() => { setOpen(true); actions.reveal(postId, index); }}
                        className="w-full rounded-xl border border-dashed border-amber-300 bg-amber-50/50 py-3 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-50"
                    >
                        翻开导师的答案 ↓
                    </button>
                </div>
            ) : (
                <div className="mt-4 border-t border-zinc-100 px-6 pb-6 pt-4 space-y-4 animate-fade-in-up">
                    {lesson.answer && (
                        <div>
                            <p className="text-xs font-semibold text-zinc-400 mb-1">💡 导师的答案（术）</p>
                            <div className="lesson-html text-zinc-700" dangerouslySetInnerHTML={{ __html: lesson.answer }} />
                        </div>
                    )}
                    {lesson.practice && (
                        <div className="rounded-xl bg-amber-50/70 p-4">
                            <p className="text-xs font-semibold text-amber-800 mb-1">🛠 学以致用</p>
                            <div className="lesson-html text-zinc-800" dangerouslySetInnerHTML={{ __html: lesson.practice }} />
                            <div className="mt-3">
                                {action ? (
                                    <span className="text-sm text-amber-800">
                                        {action.doneAt ? "✅ 已完成这个行动" : "📌 已在行动清单里"} ·{" "}
                                        <Link href="/me" className="underline">去看看</Link>
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => actions.addAction({ id: key, postId, postTitle, lessonTitle: lesson.title, text: lesson.practicePlain, category })}
                                        className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                                    >
                                        + 加入我的行动清单 <span className="opacity-75">+{XP.addAction} XP</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    {lesson.check && (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold text-zinc-400 mb-1">🎯 怎么知道学会了</p>
                                <div className="lesson-html text-sm text-zinc-600" dangerouslySetInnerHTML={{ __html: lesson.check }} />
                            </div>
                            <button
                                onClick={() => actions.toggleLearned(postId, index, category)}
                                className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${learned ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-zinc-200 text-zinc-600 hover:border-emerald-300 hover:text-emerald-700"}`}
                            >
                                {learned ? "✓ 已掌握" : `我学会了 +${XP.learned} XP`}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}

export function TaoSection({ data }: { data: InteractiveHtml }) {
    const tao = data.tao;
    const [copied, setCopied] = useState(false);
    const [showEdge, setShowEdge] = useState(false);
    if (!tao) return null;

    return (
        <section className="my-14" aria-labelledby="tao-tree">
            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-700 mb-2">THE ROOT OF IT</p>
            <h2 id="tao-tree" className="text-2xl font-bold text-zinc-900 mb-1">🌳 背后的道</h2>
            <p className="text-sm text-zinc-500 mb-6">观点是枝叶。往下看，是什么让他长出这些观点。</p>

            <div className="rounded-3xl border border-emerald-100 bg-gradient-to-b from-emerald-50/60 via-white to-amber-50/40 p-6 md:p-8">
                {tao.branches.length > 0 && (
                    <div>
                        <p className="text-center text-xs font-semibold text-emerald-700 mb-3">🍃 枝叶 · 他的观点</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {tao.branches.map((b, i) => (
                                <details key={i} className="group rounded-xl border border-emerald-100 bg-white/80 px-4 py-3">
                                    <summary className="cursor-pointer list-none text-sm font-medium text-zinc-800">
                                        {b.view}
                                        <span className="ml-1 text-emerald-600 group-open:hidden">↓</span>
                                    </summary>
                                    <p className="mt-2 text-sm text-zinc-500">↳ {b.derive}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mx-auto my-3 h-8 w-px bg-emerald-300" aria-hidden />

                {tao.trunk && (
                    <div className="rounded-2xl bg-emerald-900 px-6 py-5 text-emerald-50">
                        <p className="text-xs font-semibold text-emerald-300 mb-1">🪵 树干 · 核心思考框架</p>
                        {tao.trunkName && <p className="text-xl font-bold mb-2">「{tao.trunkName}」</p>}
                        <div className="lesson-html lesson-html-dark text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: tao.trunk }} />
                    </div>
                )}

                <div className="mx-auto my-3 h-8 w-px bg-amber-300" aria-hidden />

                {tao.root && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5">
                        <p className="text-xs font-semibold text-amber-800 mb-1">🌱 树根 · 最底层的信念</p>
                        <div className="lesson-html text-sm text-zinc-800" dangerouslySetInnerHTML={{ __html: tao.root }} />
                    </div>
                )}

                {tao.boundary && (
                    <div className="mt-5">
                        <button onClick={() => setShowEdge((v) => !v)} className="text-sm font-medium text-zinc-500 hover:text-zinc-800">
                            {showEdge ? "收起" : "⚠️ 这棵树的边界：什么时候不适用？"}
                        </button>
                        {showEdge && <div className="lesson-html mt-2 text-sm text-zinc-600" dangerouslySetInnerHTML={{ __html: tao.boundary }} />}
                    </div>
                )}
            </div>

            {tao.motto && (
                <figure className="mt-6 rounded-2xl bg-zinc-900 px-6 py-6 text-center">
                    <p className="text-xs tracking-[0.2em] text-amber-400 mb-3">带走一句心法</p>
                    <blockquote className="text-lg md:text-xl font-serif text-white leading-relaxed">{tao.motto}</blockquote>
                    <button
                        onClick={() => { navigator.clipboard?.writeText(tao.motto!); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                        className="mt-4 rounded-full border border-zinc-700 px-4 py-1.5 text-xs text-zinc-300 hover:border-amber-400 hover:text-amber-300"
                    >
                        {copied ? "已复制 ✓" : "复制心法"}
                    </button>
                </figure>
            )}
        </section>
    );
}

/** Awards "read" XP once the reader reaches the end of the article. */
export function ReadTracker({ postId, postTitle, category }: { postId: string; postTitle: string; category: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const progress = useProgress();
    const read = !!progress.read[postId];
    useEffect(() => {
        const el = ref.current;
        if (!el || read) return;
        const io = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) {
                actions.markRead(postId, postTitle, category);
                io.disconnect();
            }
        });
        io.observe(el);
        return () => io.disconnect();
    }, [postId, postTitle, category, read]);
    return (
        <div ref={ref} className="mt-10 text-center text-sm text-zinc-400">
            {read ? "✓ 已读完这篇" : `读到这里 +${XP.read} XP`}
        </div>
    );
}

/** Thin bar at the top of the viewport showing how far through the article you are. */
export function ReadingProgressBar() {
    const [pct, setPct] = useState(0);
    useEffect(() => {
        const onScroll = () => {
            const h = document.documentElement;
            const max = h.scrollHeight - h.clientHeight;
            setPct(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    return <div className="fixed left-0 top-0 z-[60] h-1 bg-amber-500 transition-[width]" style={{ width: `${pct}%` }} aria-hidden />;
}
