"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import { XSignalPostData } from "../../lib/x-signals";

interface XSignalsClientProps {
    posts: XSignalPostData[];
}

export default function XSignalsClient({ posts }: XSignalsClientProps) {
    const [filteredPosts, setFilteredPosts] = useState(posts);

    const handleFilteredItems = useCallback((filtered: XSignalPostData[]) => {
        setFilteredPosts(filtered);
    }, []);

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-900 font-sans selection:bg-amber-100 selection:text-amber-900 border-t-8 border-amber-600">
            <main className="max-w-6xl mx-auto px-8 py-24">
                <div className="animate-fade-in-up stagger-1">
                    <Header />
                </div>

                <header className="mb-24 animate-fade-in-up stagger-2">
                    <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-[11px] font-extrabold uppercase tracking-[0.25em] rounded-md border border-amber-100 mb-8">
                        GLOBAL INTELLIGENCE
                    </span>
                    <h1 className="text-6xl md:text-8xl font-serif leading-[1] mb-10 tracking-tighter text-zinc-900">
                        X Signals <span className="text-amber-600 italic">精选日报.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-500 max-w-2xl font-light leading-relaxed">
                        AI 驱动的全球信息蒸馏。我们深入 X 平台的高信噪比讨论，为你提炼出最值得关注的科技、财富与认知信号。
                    </p>
                </header>

                <div className="mb-20 animate-fade-in-up stagger-3">
                    <SearchBar
                        items={posts}
                        onFilteredItems={handleFilteredItems}
                        placeholder="在信号海洋中搜索关键词..."
                        showAuthorFilter={true}
                    />
                </div>

                {/* X Signals Feed View */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up stagger-4">
                    {filteredPosts.map((post, index) => (
                        <article key={post.id} className={`bento-card group flex flex-col justify-between stagger-${(index % 5) + 1}`}>
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 px-2 py-1 bg-amber-50 rounded-md border border-amber-100/50">
                                        DAILY ANALYTICS
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-300 group-hover:text-zinc-400 transition-colors uppercase tracking-widest">
                                        {post.date}
                                    </span>
                                </div>

                                <Link href={`/x-signals/${post.id}`} className="block">
                                    <h2 className="text-2xl md:text-3xl font-serif font-medium leading-tight group-hover:text-amber-700 transition-colors duration-300 mb-8">
                                        {post.title_best || post.title}
                                    </h2>

                                    {post.anchor_thought && (
                                        <div className="relative pl-8 py-2 mb-8 border-l-2 border-amber-100/50">
                                            <p className="text-lg md:text-xl font-serif italic text-zinc-600 leading-relaxed">
                                                {post.anchor_thought}
                                            </p>
                                        </div>
                                    )}
                                </Link>
                            </div>

                            <Link href={`/x-signals/${post.id}`} className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                                阅读深度解读副本 <span className="ml-2 font-mono">→</span>
                            </Link>
                        </article>
                    ))}
                </div>

                {filteredPosts.length === 0 && (
                    <div className="py-40 text-center bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200 animate-fade-in-up stagger-4">
                        <div className="text-6xl mb-8 animate-pulse text-zinc-200">🔭</div>
                        <p className="text-zinc-300 text-xl font-light italic">
                            这个频率的信号消失了... 试试搜索其他关键词。
                        </p>
                    </div>
                )}

                <footer className="mt-64 pt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] uppercase tracking-widest text-zinc-400 font-medium animate-fade-in-up stagger-5">
                    <span>Potato Echo Knowledge Hub &copy; 2026</span>
                    <Link href="/x-signals" className="text-amber-600 font-bold hover:underline underline-offset-4 decoration-2">Subscribe to Signals</Link>
                </footer>
            </main>
        </div>
    );
}
