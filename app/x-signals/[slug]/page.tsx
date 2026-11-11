import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Broadcast, CalendarBlank, ChatCircleDots, SquaresFour } from "@phosphor-icons/react/ssr";
import { countSignals, getSortedXSignalPostsData, getXSignalPostData, type XSignalPostData } from "../../../lib/x-signals";
import GiscusComments from "@/app/components/GiscusComments";
import Header from "@/app/components/Header";
import { IntelQuests, PlantFlag } from "./ExploreClient";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const WEEKDAY = ["日", "一", "二", "三", "四", "五", "六"];

function nameOf(p: Pick<XSignalPostData, "game_title" | "title_best" | "date">) {
    return p.game_title || p.title_best || `${String(p.date).slice(0, 10)} 情报`;
}

/** "- 💡 [建议1] 标题：内容" lines from the newer format; older days have none. */
function questsOf(id: string): string[] {
    const raw = fs.readFileSync(path.join(process.cwd(), "posts/x-signals", `${id}.md`), "utf8");
    const body = matter(raw).content;
    return [...body.matchAll(/^-\s*💡\s*\[[^\]]*\]\s*(.+)$/gm)]
        .map((m) => m[1].replace(/\*\*/g, "").trim())
        .filter((q, i, all) => q && all.indexOf(q) === i)
        .slice(0, 6);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        const p = await getXSignalPostData(slug);
        return { title: `${nameOf(p)} · X 情报`, description: p.anchor_thought ?? `${p.date} 的 X 情报区域` };
    } catch {
        return {};
    }
}

export default async function XSignalPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    let postData: XSignalPostData;
    try {
        postData = await getXSignalPostData(slug);
    } catch {
        notFound();
    }

    const all = getSortedXSignalPostsData().filter((p) => !p.private);
    const idx = all.findIndex((p) => p.id === slug);
    const newer = idx > 0 ? all[idx - 1] : null;
    const older = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
    const regionNo = idx >= 0 ? all.length - idx : null;
    const date = String(postData.date).slice(0, 10);
    const d = new Date(date + "T00:00:00");
    const title = nameOf(postData);
    const { signalCount, boardCount } = all[idx] ?? { ...countSignals(""), signalCount: 0, boardCount: 0 };
    const quests = questsOf(slug);

    return (
        <div className="min-h-[100dvh] bg-paper-grid font-sans text-ink selection:bg-arcade-soft">
            <main className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
                <Header />

                <header>
                    <Link href="/x-signals" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-zinc-500 hover:text-ink">
                        <ArrowLeft size={14} weight="bold" /> 返回情报地图
                    </Link>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="chip-arcade bg-arcade-soft text-arcade-deep"><Broadcast size={13} weight="bold" /> 情报大陆</span>
                        {regionNo && <span className="chip-arcade font-mono">区域 #{regionNo}</span>}
                    </div>
                    <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-5xl">{title}</h1>
                    {postData.anchor_thought && <p className="mt-3 max-w-[65ch] text-ink-soft">{postData.anchor_thought}</p>}
                    <dl className="mt-6 grid max-w-xl grid-cols-3 gap-2">
                        <Meta icon={<CalendarBlank size={16} weight="bold" />} label="日期" value={`${d.getMonth() + 1}/${d.getDate()} 周${WEEKDAY[d.getDay()]}`} />
                        <Meta icon={<Broadcast size={16} weight="bold" />} label="信号" value={signalCount ? `${signalCount} 条` : "—"} />
                        <Meta icon={<SquaresFour size={16} weight="bold" />} label="板块" value={`${boardCount} 个`} accent />
                    </dl>
                </header>

                <article className="mt-10 rounded-[1.5rem] border-2 border-ink bg-white px-5 py-8 shadow-[5px_5px_0_#1C1B1F] md:px-10">
                    <div
                        className="prose prose-zinc max-w-none xs-content prose-headings:text-ink prose-a:text-arcade-deep prose-blockquote:border-l-arcade prose-blockquote:bg-arcade-soft/50 prose-blockquote:not-italic prose-li:my-1.5"
                        dangerouslySetInnerHTML={{ __html: postData.contentHtml || "" }}
                    />
                </article>

                <IntelQuests id={slug} title={title} quests={quests} />
                <PlantFlag id={slug} title={title} />

                <nav className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="相邻区域">
                    {older ? (
                        <Link href={`/x-signals/${older.id}`} className="group rounded-xl border-2 border-ink bg-white p-4 shadow-[0_3px_0_#1C1B1F] transition-transform active:translate-y-[2px]">
                            <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-zinc-500"><ArrowLeft size={12} weight="bold" /> 前一天 · {String(older.date).slice(0, 10)}</span>
                            <span className="mt-1 block font-bold group-hover:text-arcade-deep">{nameOf(older)}</span>
                        </Link>
                    ) : <span />}
                    {newer && (
                        <Link href={`/x-signals/${newer.id}`} className="group rounded-xl border-2 border-ink bg-white p-4 text-right shadow-[0_3px_0_#1C1B1F] transition-transform active:translate-y-[2px]">
                            <span className="flex items-center justify-end gap-1 font-mono text-[11px] font-bold text-zinc-500">后一天 · {String(newer.date).slice(0, 10)} <ArrowRight size={12} weight="bold" /></span>
                            <span className="mt-1 block font-bold group-hover:text-arcade-deep">{nameOf(newer)}</span>
                        </Link>
                    )}
                </nav>

                <section className="mt-16">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><ChatCircleDots size={22} weight="fill" className="text-arcade" /> 玩家讨论区</h2>
                    <div className="rounded-[1.25rem] border-2 border-ink bg-white p-4 shadow-[4px_4px_0_#1C1B1F]">
                        <GiscusComments />
                    </div>
                </section>
            </main>
        </div>
    );
}

function Meta({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
    return (
        <div className={`rounded-xl border-2 border-ink px-3 py-2 ${accent ? "bg-[#F5C04A]" : "bg-white"}`}>
            <dt className="flex items-center gap-1 text-[11px] font-bold text-ink-soft">{icon}{label}</dt>
            <dd className="font-mono text-sm font-black text-ink">{value}</dd>
        </div>
    );
}
