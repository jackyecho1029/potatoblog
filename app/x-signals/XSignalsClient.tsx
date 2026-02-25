
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
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-900 font-sans selection:bg-amber-100 border-t-8 border-amber-600">
            <main className="max-w-4xl mx-auto px-8 py-24 fade-in">
                <Header />

                <header className="mb-24">
                    <h1 className="text-5xl font-serif mb-6 tracking-tight">X Signals 精选日报</h1>
                    <p className="text-xl text-zinc-500 max-w-2xl font-light leading-relaxed">
                        AI 驱动的全球信息蒸馏。我们深入 X 平台的高信噪比讨论，为你提炼出最值得关注的科技、财富与认知信号。
                    </p>
                </header>

                <div className="mb-20">
                    <SearchBar
                        items={posts}
                        onFilteredItems={handleFilteredItems}
                        placeholder="在信号海洋中搜索关键词..."
                        showAuthorFilter={true}
                    />
                </div>

                {/* X Signals Feed View */}
                <div className="space-y-32">
                    {filteredPosts.map((post) => (
                        <article key={post.id} className="group relative">
                            {/* Timeline Date Marker */}
                            <div className="absolute -left-24 top-0 hidden xl:block">
                                <div className="text-xs font-mono text-zinc-200 uppercase tracking-widest rotate-90 origin-left mt-8">
                                    {post.date}
                                </div>
                            </div>

                            <Link href={`/x-signals/${post.id}`} className="block">
                                <div className="flex flex-col gap-8">
                                    <div className="flex items-baseline justify-between gap-4">
                                        <h2 className="text-4xl font-serif font-medium leading-tight group-hover:text-amber-600 transition-colors duration-300">
                                            {post.title_best || post.title}
                                        </h2>
                                        <span className="text-xs font-mono text-zinc-300 md:hidden">{post.date}</span>
                                    </div>

                                    {post.anchor_thought && (
                                        <div className="relative pl-12 py-4">
                                            <span className="absolute left-0 top-0 text-6xl font-serif text-amber-100">“</span>
                                            <p className="text-2xl font-serif italic text-zinc-600 leading-relaxed relative z-10">
                                                {post.anchor_thought}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 text-sm font-medium">
                                        <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs">DAILY ANALYTICS</span>
                                        <span className="text-zinc-300">——</span>
                                        <span className="group-hover:translate-x-2 transition-transform duration-300 text-zinc-400 group-hover:text-amber-600">
                                            阅读深度解读副本 <span className="ml-1">→</span>
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            {/* Separator */}
                            <div className="mt-32 w-20 h-px bg-zinc-100 group-last:hidden"></div>
                        </article>
                    ))}
                </div>

                {filteredPosts.length === 0 && (
                    <div className="py-40 text-center">
                        <div className="text-6xl mb-8">🔭</div>
                        <p className="text-zinc-300 text-xl font-light italic">
                            这个频率的信号消失了... 试试搜索其他关键词。
                        </p>
                    </div>
                )}

                <footer className="mt-64 pt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[12px] uppercase tracking-widest text-zinc-300 font-medium">
                    <span>Potato Echo Knowledge Hub &copy; 2026</span>
                    <Link href="/x-signals" className="text-amber-600 font-bold hover:underline">Subscribe to Signals</Link>
                </footer>
            </main>
        </div>
    );
}
