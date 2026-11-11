"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowRight, Check, CheckCircle, Copy, Eye, Leaf, Lightbulb, Plant, Plus, PushPin, Quotes,
    SealCheck, Star, Target, Tree, Warning, Wrench,
} from "@phosphor-icons/react";
import type { InteractiveHtml, LessonHtml } from "../../../lib/learning";
import { actions, celebrateFrom, useProgress, XP } from "../../../lib/progress";

interface Props {
    postId: string;
    postTitle: string;
    category: string;
    data: InteractiveHtml;
}

export function LessonsSection({ postId, postTitle, category, data }: Props) {
    const progress = useProgress();
    if (!data.lessons.length) return null;
    const done = data.lessons.filter((_, i) => progress.learned[`${postId}#${i}`]).length;
    const pct = Math.round((done / data.lessons.length) * 100);

    return (
        <section className="my-16" aria-labelledby="mentor-lessons">
            <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-arcade">Boss Stage · Mentor Lessons</p>
                    <h2 id="mentor-lessons" className="mt-1 text-3xl font-black tracking-tight text-ink">导师带你想</h2>
                    <p className="mt-1 text-sm text-zinc-500">先自己想，再翻答案。想过再看，记得更牢。</p>
                </div>
                <div className="min-w-[180px]">
                    <div className="flex justify-between font-mono text-xs font-bold">
                        <span>已掌握 {done}/{data.lessons.length}</span>
                        <span>{pct}%</span>
                    </div>
                    <div className="mt-1 h-3.5 overflow-hidden rounded-full border-2 border-ink bg-white">
                        <motion.div className="h-full bg-win" initial={false} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 90, damping: 18 }} />
                    </div>
                </div>
            </div>
            <div className="space-y-6">
                {data.lessons.map((lesson, i) => (
                    <LessonCard key={i} index={i} lesson={lesson} postId={postId} postTitle={postTitle} category={category} />
                ))}
            </div>
        </section>
    );
}

function Label({ icon, children, tone = "muted" }: { icon: React.ReactNode; children: React.ReactNode; tone?: "muted" | "arcade" | "win" }) {
    const color = tone === "arcade" ? "text-arcade-deep" : tone === "win" ? "text-win" : "text-zinc-500";
    return <p className={`mb-1.5 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider ${color}`}>{icon}{children}</p>;
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
    const tooShort = draft !== null && draft.trim().length > 0 && draft.trim().length < 10;

    const commit = () => {
        if (draft !== null && draft !== saved) actions.saveAnswer(postId, index, draft, category);
        setDraft(null);
    };

    return (
        <motion.article
            layout
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className={`overflow-hidden rounded-[1.25rem] border-2 border-ink bg-white ${learned ? "shadow-[5px_5px_0_#2F9E6A]" : "shadow-[5px_5px_0_#1C1B1F]"}`}
        >
            <header className={`flex items-center gap-3 border-b-2 border-ink px-5 py-3 ${learned ? "bg-win-soft" : "bg-paper"}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-ink font-mono text-sm font-black shadow-[0_2px_0_#1C1B1F] ${learned ? "bg-win text-white" : "bg-arcade text-white"}`}>
                    {learned ? <Check size={18} weight="bold" /> : String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-black leading-snug text-ink">{lesson.title}</h3>
                {learned && <span className="ml-auto hidden items-center gap-1 font-mono text-xs font-black text-win sm:flex"><SealCheck size={16} weight="fill" /> CLEAR</span>}
            </header>

            <div className="px-5 pt-5">
                <Label icon={<Lightbulb size={14} weight="fill" />} tone="arcade">先想一想</Label>
                <div className="lesson-html text-lg font-semibold text-ink" dangerouslySetInnerHTML={{ __html: lesson.question }} />
                <label className="mt-4 block">
                    <span className="sr-only">你的答案</span>
                    <textarea
                        value={text}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={commit}
                        rows={2}
                        placeholder="写下你的答案，只保存在你的浏览器里"
                        className="w-full resize-y rounded-xl border-2 border-ink/20 bg-paper px-4 py-3 text-sm text-ink placeholder:text-zinc-400 focus:border-ink focus:bg-white focus:outline-none focus:ring-4 focus:ring-arcade-soft"
                    />
                </label>
                <div className="mt-1 flex justify-between text-[11px] font-bold">
                    <span className={tooShort ? "text-arcade-deep" : "text-zinc-400"}>
                        {saved ? <span className="text-win">已保存</span> : tooShort ? "再多写几个字，满 10 个字才算数" : `写满 10 个字 +${XP.answer} XP`}
                    </span>
                    {draft !== null && draft !== saved && (
                        <button onClick={commit} className="text-arcade-deep underline">保存</button>
                    )}
                </div>
            </div>

            <AnimatePresence initial={false} mode="wait">
                {!revealed ? (
                    <motion.div key="cover" exit={{ opacity: 0, height: 0 }} className="px-5 pb-5 pt-4">
                        <button
                            onClick={() => { setOpen(true); actions.reveal(postId, index); }}
                            className="btn-arcade btn-arcade-ink w-full"
                        >
                            <Eye size={18} weight="bold" /> 翻开导师的答案
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="answer"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 140, damping: 18 }}
                        className="mt-5 space-y-5 border-t-2 border-dashed border-ink/20 px-5 pb-6 pt-5"
                    >
                        {lesson.answer && (
                            <div>
                                <Label icon={<Quotes size={14} weight="fill" />}>导师的答案（术）</Label>
                                <div className="lesson-html text-ink-soft" dangerouslySetInnerHTML={{ __html: lesson.answer }} />
                            </div>
                        )}
                        {lesson.practice && (
                            <div className="rounded-xl border-2 border-ink bg-arcade-soft p-4">
                                <Label icon={<Wrench size={14} weight="fill" />} tone="arcade">支线任务 · 学以致用</Label>
                                <div className="lesson-html text-ink" dangerouslySetInnerHTML={{ __html: lesson.practice }} />
                                <div className="mt-3">
                                    {action ? (
                                        <Link href="/me" className="inline-flex items-center gap-1.5 text-sm font-bold text-arcade-deep">
                                            {action.doneAt ? <><CheckCircle size={16} weight="fill" className="text-win" /> 已完成这个任务</> : <><PushPin size={16} weight="fill" /> 已在任务清单里</>}
                                            <ArrowRight size={14} weight="bold" />
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                actions.addAction({ id: key, postId, postTitle, lessonTitle: lesson.title, text: lesson.practicePlain, category });
                                                celebrateFrom(e.currentTarget);
                                            }}
                                            className="btn-arcade text-sm"
                                        >
                                            <Plus size={16} weight="bold" /> 接下这个任务 <span className="font-mono opacity-80">+{XP.addAction}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                        {lesson.check && (
                            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                                <div>
                                    <Label icon={<Target size={14} weight="fill" />}>怎么知道学会了</Label>
                                    <div className="lesson-html text-sm text-ink-soft" dangerouslySetInnerHTML={{ __html: lesson.check }} />
                                </div>
                                <button
                                    onClick={(e) => {
                                        const wasLearned = learned;
                                        actions.toggleLearned(postId, index, category);
                                        if (!wasLearned) celebrateFrom(e.currentTarget);
                                    }}
                                    className={`btn-arcade text-sm ${learned ? "btn-arcade-win" : "btn-arcade-ghost"}`}
                                >
                                    {learned ? <><SealCheck size={16} weight="fill" /> 已掌握</> : <>我学会了 <span className="font-mono opacity-70">+{XP.learned}</span></>}
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.article>
    );
}

export function TaoSection({ data }: { data: InteractiveHtml }) {
    const tao = data.tao;
    const [copied, setCopied] = useState(false);
    const [showEdge, setShowEdge] = useState(false);
    const [openLeaf, setOpenLeaf] = useState<number | null>(null);
    if (!tao) return null;

    return (
        <section className="my-16" aria-labelledby="tao-tree">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-win">Hidden Level · The Root</p>
            <h2 id="tao-tree" className="mt-1 text-3xl font-black tracking-tight text-ink">背后的道</h2>
            <p className="mb-6 mt-1 text-sm text-zinc-500">观点是枝叶。点开每片叶子，看它是怎么从树干长出来的。</p>

            <div className="relative overflow-hidden rounded-[1.5rem] border-2 border-ink bg-[#EAF5EE] p-5 shadow-[5px_5px_0_#1C1B1F] md:p-8">
                {tao.branches.length > 0 && (
                    <div>
                        <p className="mb-3 flex items-center justify-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-win"><Leaf size={14} weight="fill" /> 枝叶 · 他的观点</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {tao.branches.map((b, i) => (
                                <button
                                    key={i}
                                    onClick={() => setOpenLeaf(openLeaf === i ? null : i)}
                                    aria-expanded={openLeaf === i}
                                    className={`rounded-xl border-2 border-ink px-4 py-3 text-left transition-all active:translate-y-[2px] ${openLeaf === i ? "bg-white shadow-[0_2px_0_#1C1B1F]" : "bg-white/80 shadow-[0_4px_0_#1C1B1F] hover:bg-white"}`}
                                >
                                    <span className="flex items-start justify-between gap-2 text-sm font-bold text-ink">
                                        {b.view}
                                        <Leaf size={16} weight={openLeaf === i ? "fill" : "regular"} className="mt-0.5 shrink-0 text-win" />
                                    </span>
                                    <AnimatePresence>
                                        {openLeaf === i && (
                                            <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="block overflow-hidden">
                                                <span className="mt-2 block border-t-2 border-dashed border-ink/15 pt-2 text-sm text-ink-soft">{b.derive}</span>
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <svg className="mx-auto my-2 block h-10 w-6" viewBox="0 0 24 40" aria-hidden><path d="M12 0 V40" stroke="#1C1B1F" strokeWidth="3" strokeDasharray="5 4" /></svg>

                {tao.trunk && (
                    <div className="rounded-2xl border-2 border-ink bg-ink px-6 py-5 text-white">
                        <p className="mb-1 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#8FD6B0]"><Tree size={14} weight="fill" /> 树干 · 核心思考框架</p>
                        {tao.trunkName && <p className="mb-2 text-2xl font-black">「{tao.trunkName}」</p>}
                        <div className="lesson-html lesson-html-dark text-sm leading-relaxed text-white/85" dangerouslySetInnerHTML={{ __html: tao.trunk }} />
                    </div>
                )}

                <svg className="mx-auto my-2 block h-10 w-6" viewBox="0 0 24 40" aria-hidden><path d="M12 0 V40" stroke="#B8461A" strokeWidth="3" strokeDasharray="5 4" /></svg>

                {tao.root && (
                    <div className="rounded-2xl border-2 border-ink bg-[#F7E7C6] px-6 py-5">
                        <p className="mb-1 flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-arcade-deep"><Plant size={14} weight="fill" /> 树根 · 最底层的信念</p>
                        <div className="lesson-html text-sm text-ink" dangerouslySetInnerHTML={{ __html: tao.root }} />
                    </div>
                )}

                {tao.boundary && (
                    <div className="mt-5">
                        <button onClick={() => setShowEdge((v) => !v)} className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-soft hover:text-ink" aria-expanded={showEdge}>
                            <Warning size={16} weight="fill" className="text-arcade" /> {showEdge ? "收起边界" : "这棵树的边界：什么时候不适用？"}
                        </button>
                        <AnimatePresence>
                            {showEdge && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                    <div className="lesson-html mt-2 text-sm text-ink-soft" dangerouslySetInnerHTML={{ __html: tao.boundary }} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {tao.motto && (
                <figure className="relative mt-8 rotate-[-0.6deg] rounded-[1.5rem] border-2 border-ink bg-arcade px-6 py-8 text-center text-white shadow-[6px_6px_0_#1C1B1F] md:px-10">
                    <Quotes size={36} weight="fill" className="mx-auto text-white/40" />
                    <p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-white/70">带走一句心法</p>
                    <blockquote className="mt-3 text-xl font-black leading-relaxed md:text-2xl">{tao.motto}</blockquote>
                    <button
                        onClick={(e) => { navigator.clipboard?.writeText(tao.motto!); setCopied(true); celebrateFrom(e.currentTarget); setTimeout(() => setCopied(false), 1500); }}
                        className="btn-arcade btn-arcade-ghost mt-5 text-sm"
                    >
                        {copied ? <><Check size={16} weight="bold" /> 已复制</> : <><Copy size={16} weight="bold" /> 复制心法</>}
                    </button>
                </figure>
            )}
        </section>
    );
}

/** End-of-level results: stars from mastered lessons, checklist, and the "read" reward when this panel scrolls into view. */
export function LevelClear({ postId, postTitle, category, lessonCount }: { postId: string; postTitle: string; category: string; lessonCount: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const p = useProgress();
    const read = !!p.read[postId];
    const mastered = Array.from({ length: lessonCount }).filter((_, i) => p.learned[`${postId}#${i}`]).length;
    const answered = Array.from({ length: lessonCount }).filter((_, i) => (p.answers[`${postId}#${i}`]?.text ?? "").trim().length >= 10).length;
    const tasks = p.actions.filter((a) => a.postId === postId);
    const tasksDone = tasks.filter((a) => a.doneAt).length;
    const stars = lessonCount ? (mastered === lessonCount ? 3 : mastered >= Math.ceil(lessonCount / 2) ? 2 : mastered > 0 ? 1 : 0) : read ? 3 : 0;

    useEffect(() => {
        const el = ref.current;
        if (!el || read) return;
        const io = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) {
                actions.markRead(postId, postTitle, category);
                celebrateFrom(el.querySelector("[data-stars]"));
                io.disconnect();
            }
        }, { threshold: 0.4 });
        io.observe(el);
        return () => io.disconnect();
    }, [postId, postTitle, category, read]);

    return (
        <section ref={ref} className="mt-16 overflow-hidden rounded-[1.5rem] border-2 border-ink bg-white shadow-[6px_6px_0_#1C1B1F]" aria-label="关卡结算">
            <div className="flex flex-col items-center gap-2 border-b-2 border-ink bg-ink px-6 py-8 text-white">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-arcade">{read ? "Stage Clear" : "Almost there"}</p>
                <div className="flex gap-2" data-stars>
                    {[0, 1, 2].map((i) => (
                        <motion.span key={i} initial={false} animate={{ scale: i < stars ? 1 : 0.85, rotate: i < stars ? 0 : -10 }} transition={{ type: "spring", stiffness: 300, damping: 12, delay: i * 0.08 }}>
                            <Star size={44} weight="fill" className={i < stars ? "text-[#F5C04A]" : "text-white/15"} />
                        </motion.span>
                    ))}
                </div>
                <p className="text-xl font-black">{read ? (stars === 3 ? "完美通关" : "通关！还能拿更多星") : "读到这里就算通关"}</p>
                <p className="text-sm text-white/60">掌握全部课 = 3 星。星星越多，这一关就越是你的。</p>
            </div>
            <ul className="grid gap-px bg-ink/10 sm:grid-cols-2">
                <ClearRow ok={read} label="读完这一关" reward={`+${XP.read}`} />
                {lessonCount > 0 && <ClearRow ok={answered === lessonCount} label={`写下思考 ${answered}/${lessonCount}`} reward={`每课 +${XP.answer}`} />}
                {lessonCount > 0 && <ClearRow ok={mastered === lessonCount} label={`掌握课程 ${mastered}/${lessonCount}`} reward={`每课 +${XP.learned}`} />}
                {lessonCount > 0 && <ClearRow ok={tasks.length > 0 && tasksDone === tasks.length} label={tasks.length ? `完成支线任务 ${tasksDone}/${tasks.length}` : "接下至少一个支线任务"} reward={`每个 +${XP.completeAction}`} />}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
                <p className="text-sm text-zinc-500">接下的任务都在「我的冒险」里，做完回来打勾。</p>
                <Link href="/me" className="btn-arcade text-sm">去我的冒险 <ArrowRight size={16} weight="bold" /></Link>
            </div>
        </section>
    );
}

function ClearRow({ ok, label, reward }: { ok: boolean; label: string; reward: string }) {
    return (
        <li className="flex items-center gap-3 bg-white px-6 py-4">
            {ok ? <CheckCircle size={22} weight="fill" className="shrink-0 text-win" /> : <span className="h-[22px] w-[22px] shrink-0 rounded-full border-2 border-zinc-300" />}
            <span className={`flex-1 text-sm font-bold ${ok ? "text-zinc-400 line-through" : "text-ink"}`}>{label}</span>
            <span className="font-mono text-xs font-bold text-arcade-deep">{reward}</span>
        </li>
    );
}

/** Thin bar at the top of the viewport showing how far through the level you are. */
export function ReadingProgressBar() {
    const bar = useRef<HTMLDivElement>(null);
    useEffect(() => {
        let raf = 0;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const h = document.documentElement;
                const max = h.scrollHeight - h.clientHeight;
                if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, h.scrollTop / max) : 0})`;
            });
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
    }, []);
    return (
        <div className="fixed left-0 right-0 top-0 z-[60] h-1.5 border-b-2 border-ink bg-white" aria-hidden>
            <div ref={bar} className="h-full origin-left bg-arcade" style={{ transform: "scaleX(0)" }} />
        </div>
    );
}
