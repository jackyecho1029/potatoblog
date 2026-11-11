import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChatCircleDots, Clock, Compass, Lightning, Microphone, YoutubeLogo } from "@phosphor-icons/react/ssr";
import { getLearningPostData, getSortedLearningPostsData, type LearningPostData } from "../../../lib/learning";
import { normalizeCategory, worldOf } from "../../../lib/categories";
import { XP } from "../../../lib/xp";
import Header from "../../components/Header";
import GiscusComments from "../../components/GiscusComments";
import PasswordProtection from "../../components/PasswordProtection";
import { WorldIcon } from "../../components/game/icons";
import { LessonsSection, LevelClear, ReadingProgressBar, TaoSection } from "./InteractiveLessons";

// Generate static paths for the 100 most recent learning posts to optimize build performace
export async function generateStaticParams() {
    const posts = getSortedLearningPostsData();
    return posts.slice(0, 100).map((post) => ({ id: post.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    try {
        const post = await getLearningPostData(id);
        const title = decodeHtmlEntities(post.title || post.original_title || "");
        return {
            title,
            description: post.interactive?.tao?.motto ?? post.original_title,
            openGraph: post.thumbnail ? { images: [post.thumbnail] } : undefined,
        };
    } catch {
        return {};
    }
}

const PROSE =
    "prose prose-zinc max-w-none learning-content prose-headings:font-black prose-headings:text-ink prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-lg prose-a:text-arcade-deep prose-blockquote:border-l-arcade prose-blockquote:bg-arcade-soft/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-ink-soft prose-li:my-1";

/** Rough reading time for Chinese-heavy text (~450 chars/min). */
function minutesFor(html: string): number {
    const text = html.replace(/<[^>]+>/g, "");
    return Math.max(3, Math.round(text.length / 450));
}

function LevelHeader({ post, id, title, category }: { post: LearningPostData; id: string; title: string; category: string }) {
    const world = worldOf(category);
    const isLenny = id.includes("lenny-");
    const lessons = post.interactive?.lessons.length ?? 0;
    const html = post.interactive ? post.interactive.beforeHtml + post.interactive.afterHtml : post.contentHtml || "";
    const minutes = minutesFor(html);
    const maxXp = XP.read + lessons * (XP.answer + XP.addAction + XP.learned + XP.completeAction);
    const difficulty = lessons >= 5 || minutes > 18 ? 3 : lessons >= 4 || minutes > 10 ? 2 : 1;
    const videoId = post.source_url?.match(/(?:v=|youtu\.be\/)([\w-]{11})/)?.[1];
    const thumb = post.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined);

    return (
        <header className="grid gap-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
                <Link href={isLenny ? "/lenny" : "/learning"} className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-zinc-500 hover:text-ink">
                    <ArrowLeft size={14} weight="bold" /> {isLenny ? "Lenny 关卡" : "返回选关"}
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="chip-arcade bg-arcade-soft text-arcade-deep">
                        <WorldIcon name={world.icon} size={13} weight="bold" /> {world.name}
                    </span>
                    <span className="chip-arcade">
                        {isLenny && <Microphone size={12} weight="bold" />}
                        {isLenny ? "Lenny's Podcast" : post.author}
                    </span>
                    <span className="font-mono text-xs text-zinc-500">{post.date}</span>
                </div>
                <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-ink md:text-[2.6rem]">{title}</h1>
                {post.original_title && post.original_title !== title && (
                    <p className="mt-2 text-sm text-zinc-500">{decodeHtmlEntities(post.original_title)}</p>
                )}

                <dl className="mt-6 grid max-w-lg grid-cols-3 gap-2">
                    <Meta icon={<Clock size={16} weight="bold" />} label="时长" value={`${minutes} 分钟`} />
                    <Meta icon={<Compass size={16} weight="bold" />} label="导师课" value={lessons ? `${lessons} 课` : "无"} />
                    <Meta icon={<Lightning size={16} weight="fill" />} label="最多可得" value={`${maxXp} XP`} accent />
                </dl>
                <div className="mt-4 flex items-center gap-3">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-500">难度</span>
                    <span className="flex gap-1" aria-label={`难度 ${difficulty}/3`}>
                        {[1, 2, 3].map((i) => (
                            <span key={i} className={`h-3 w-7 rounded-sm border-2 border-ink ${i <= difficulty ? "bg-arcade" : "bg-white"}`} />
                        ))}
                    </span>
                    {post.source_url && (
                        <a href={post.source_url} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold text-ink hover:text-arcade-deep">
                            <YoutubeLogo size={18} weight="fill" className="text-[#D33A2C]" /> 看原视频
                        </a>
                    )}
                </div>
            </div>
            {thumb && (
                <div className="md:col-span-5">
                    <div className="relative aspect-video rotate-[1.2deg] overflow-hidden rounded-[1.25rem] border-2 border-ink shadow-[6px_6px_0_#1C1B1F]">
                        <Image src={thumb} alt="" fill unoptimized priority className="object-cover" />
                    </div>
                </div>
            )}
        </header>
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

export default async function LearningPost({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let postData: LearningPostData;
    try {
        postData = await getLearningPostData(id);
    } catch {
        notFound();
    }

    const title = decodeHtmlEntities(postData.title || postData.original_title || "");
    const category = normalizeCategory(postData.category);
    const lessonCount = postData.interactive?.lessons.length ?? 0;

    const content = (
        <div className="min-h-[100dvh] bg-paper-grid font-sans text-ink selection:bg-arcade-soft">
            <ReadingProgressBar />
            <main className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
                <Header />
                <article>
                    <LevelHeader post={postData} id={id} title={title} category={category} />

                    <div className="mt-12 rounded-[1.5rem] border-2 border-ink bg-white px-5 py-8 shadow-[5px_5px_0_#1C1B1F] md:px-10">
                        {postData.interactive ? (
                            <div className={PROSE} dangerouslySetInnerHTML={{ __html: postData.interactive.beforeHtml }} />
                        ) : (
                            <div className={PROSE} dangerouslySetInnerHTML={{ __html: postData.contentHtml || "" }} />
                        )}
                    </div>

                    {postData.interactive && (
                        <>
                            <LessonsSection postId={id} postTitle={title} category={category} data={postData.interactive} />
                            <TaoSection data={postData.interactive} />
                            {postData.interactive.afterHtml.trim() && (
                                <div className="rounded-[1.5rem] border-2 border-ink bg-white px-5 py-6 shadow-[5px_5px_0_#1C1B1F] md:px-10">
                                    <div className={PROSE} dangerouslySetInnerHTML={{ __html: postData.interactive.afterHtml }} />
                                </div>
                            )}
                        </>
                    )}

                    <LevelClear postId={id} postTitle={title} category={category} lessonCount={lessonCount} />
                </article>

                <section className="mt-16">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><ChatCircleDots size={22} weight="fill" className="text-arcade" /> 玩家讨论区</h2>
                    <div className="rounded-[1.25rem] border-2 border-ink bg-white p-4 shadow-[4px_4px_0_#1C1B1F]">
                        <GiscusComments />
                    </div>
                </section>
            </main>
        </div>
    );

    if (postData.private && postData.password) {
        return (
            <PasswordProtection postId={id} correctPassword={postData.password}>
                {content}
            </PasswordProtection>
        );
    }
    return content;
}

function decodeHtmlEntities(text: string): string {
    const entities: { [key: string]: string } = {
        "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&#x27;": "'", "&apos;": "'",
    };
    return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x27;|&apos;/g, (m) => entities[m] || m);
}
