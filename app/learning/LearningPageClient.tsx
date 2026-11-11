"use client";

import { useState, useCallback, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import { LearningPostData } from "../../lib/learning";
import { questStatus, today, useProgress } from "../../lib/progress";

interface LearningPageClientProps {
    posts: LearningPostData[];
}

export default function LearningPageClient({ posts }: LearningPageClientProps) {
    const [filteredPosts, setFilteredPosts] = useState(posts);

    const handleFilteredItems = useCallback((filtered: LearningPostData[]) => {
        setFilteredPosts(filtered);
    }, []);

    // Filter out X Signal and private posts
    const displayPosts = filteredPosts.filter(post => {
        if (post.private) return false;
        return post.category !== 'X Signal';
    });

    const progress = useProgress();
    const quest = questStatus(progress);
    // The page is prerendered at build time; pick today's lesson only in the browser so the date is the reader's.
    const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

    // 今日一课: a stable pick per day among recent posts that have mentor lessons, preferring unread ones.
    const pick = useMemo(() => {
        const pool = posts.filter((p) => p.lessonCount && !p.private && p.category !== 'X Signal').slice(0, 60);
        if (!pool.length) return null;
        const d = today();
        const seed = [...d].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
        const unread = pool.filter((p) => !progress.read[p.id]);
        const list = unread.length ? unread : pool;
        return list[seed % list.length];
    }, [posts, progress.read]);

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-800 font-sans selection:bg-amber-200">
            <main className="max-w-5xl mx-auto px-6 py-20">
                <Header />

                <header className="mb-12">
                    <h1 className="text-3xl font-bold mb-4 tracking-tight">学习中心</h1>
                    <p className="text-gray-600 max-w-2xl">
                        精选全球顶尖思想家的深度访谈与洞见，助你在AI时代保持认知领先。
                    </p>
                </header>

                {mounted && pick && (
                    <section className="mb-10 grid gap-4 md:grid-cols-3">
                        <Link href={`/learning/${pick.id}`} className="group md:col-span-2 flex flex-col justify-between rounded-2xl bg-zinc-900 p-6 text-white hover:bg-zinc-800 transition-colors">
                            <div>
                                <p className="text-xs tracking-[0.2em] text-amber-400 mb-3">今日一课 · {pick.author}</p>
                                <h2 className="text-xl md:text-2xl font-bold leading-snug group-hover:text-amber-200 transition-colors">{decodeHtmlEntities(pick.title || pick.original_title || '')}</h2>
                                {pick.motto && <p className="mt-3 text-zinc-300 font-serif leading-relaxed">「{pick.motto}」</p>}
                            </div>
                            <p className="mt-5 text-sm text-amber-300">🧭 {pick.lessonCount} 课导师引导 · 开始学 →</p>
                        </Link>
                        <Link href="/me" className="flex flex-col justify-between rounded-2xl border border-amber-200 bg-amber-50/70 p-6 hover:bg-amber-50 transition-colors">
                            <div>
                                <p className="text-xs tracking-[0.2em] text-amber-700 mb-3">今日任务</p>
                                <ul className="space-y-2 text-sm">
                                    <li className={quest.studied ? 'text-zinc-400 line-through' : 'text-zinc-800'}>{quest.studied ? '✅' : '⬜'} 学一课</li>
                                    <li className={quest.acted ? 'text-zinc-400 line-through' : 'text-zinc-800'}>{quest.acted ? '✅' : '⬜'} 完成一个行动</li>
                                </ul>
                            </div>
                            <p className="mt-5 text-sm font-medium text-amber-800">{quest.bonusClaimed ? '今天完成了 🎉' : '全部完成 +50 XP →'}</p>
                        </Link>
                    </section>
                )}

                <SearchBar
                    items={posts}
                    onFilteredItems={handleFilteredItems}
                    placeholder="搜索标题、作者..."
                    showAuthorFilter={true}
                />

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayPosts.map((post) => (
                        <article key={post.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                            <Link href={`/learning/${post.id}`} className="block">
                                {/* Thumbnail */}
                                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                                    {post.thumbnail ? (
                                        <Image
                                            src={post.thumbnail}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <span className="text-4xl">📺</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h2 className="text-lg font-semibold line-clamp-2 group-hover:text-amber-600 transition-colors mb-2">
                                        {decodeHtmlEntities(post.title || post.original_title || '')}
                                    </h2>
                                    {post.motto && (
                                        <p className="mb-3 text-sm text-zinc-500 line-clamp-2 border-l-2 border-amber-200 pl-3">{post.motto}</p>
                                    )}
                                    <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
                                        <span>{post.date}</span>
                                        {post.lessonCount ? <span className="text-amber-700">· 🧭 {post.lessonCount} 课</span> : null}
                                        {progress.read[post.id] && <span className="text-emerald-600">· ✓ 已读</span>}
                                        {post.category && (
                                            <>
                                                <span>·</span>
                                                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                                    {post.category}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </article>
                    ))}
                </div>

                {displayPosts.length === 0 && (
                    <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-lg">
                        未找到相关内容 🔍
                    </div>
                )}
            </main>
        </div>
    );
}

const noopSubscribe = () => () => {};

// Helper function to decode HTML entities
function decodeHtmlEntities(text: string): string {
    const entities: { [key: string]: string } = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&#x27;': "'",
        '&apos;': "'",
    };
    return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&#x27;|&apos;/g, (match) => entities[match] || match);
}
