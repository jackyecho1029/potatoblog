"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import { PostData } from "../lib/posts";

interface HomePageClientProps {
    posts: PostData[];
}

export default function HomePageClient({ posts }: HomePageClientProps) {
    const [filteredPosts, setFilteredPosts] = useState(posts);

    const handleFilteredItems = useCallback((filtered: PostData[]) => {
        setFilteredPosts(filtered);
    }, []);

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-900 font-sans selection:bg-amber-100 selection:text-amber-900 border-t-8 border-amber-600">
            <main className="max-w-6xl mx-auto px-8 py-24">
                <div className="animate-fade-in-up stagger-1">
                    <Header />
                </div>

                {/* Hero / Intro */}
                <section className="mb-32 animate-fade-in-up stagger-2">
                    <h2 className="text-6xl md:text-8xl font-serif leading-[1] mb-10 tracking-tighter text-zinc-900">
                        慢慢更新，<br />
                        <span className="text-amber-600 italic">深深扎根。</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-zinc-500 leading-relaxed max-w-2xl font-light">
                        探索技术与人生的交汇点。在这里，我分享成为更好的产品构建者和更有思考力的人的旅程。
                    </p>
                </section>

                {/* Search Bar Container */}
                <div className="mb-32 animate-fade-in-up stagger-3">
                    <SearchBar
                        items={posts}
                        onFilteredItems={handleFilteredItems}
                        placeholder="搜索我的思考..."
                    />
                </div>

                {/* Posts List */}
                <section className="animate-fade-in-up stagger-4">
                    <div className="flex items-center gap-4 mb-16">
                        <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-300">最新文章</h3>
                        <div className="flex-1 h-px bg-zinc-100"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredPosts.map(({ id, date, title, tags }, index) => (
                            <article key={id} className={`bento-card group flex flex-col justify-between stagger-${(index % 5) + 1}`}>
                                <div className="mb-8">
                                    <div className="text-xs font-mono text-zinc-300 group-hover:text-amber-600 transition-colors mb-4 uppercase tracking-widest">
                                        {date}
                                    </div>
                                    <Link href={`/posts/${id}`} className="block">
                                        <h4 className="text-2xl md:text-3xl font-serif font-medium mb-4 group-hover:text-amber-700 transition-all duration-300 leading-tight">
                                            {title}
                                        </h4>
                                        <p className="text-zinc-500 leading-relaxed mb-6 font-light line-clamp-3 text-sm md:text-base">
                                            在这篇文章中，我探讨了相关的核心逻辑与实践心得。点击阅读更多细节...
                                        </p>
                                    </Link>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {tags?.map(tag => (
                                        <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-zinc-50 text-zinc-400 rounded-md group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors border border-zinc-100 group-hover:border-amber-100">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </article>
                        ))}

                        {filteredPosts.length === 0 && (
                            <div className="col-span-full py-32 text-center bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200">
                                <p className="text-zinc-300 italic text-xl">未找到相关文章，试试换个关键词路径？ 🔍</p>
                            </div>
                        )}
                    </div>
                </section>

                <footer className="mt-48 pt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] uppercase tracking-widest text-zinc-400 font-medium">
                    <span>&copy; 2026 Jacky Potato. Built with High Agency.</span>
                    <div className="flex gap-8">
                        <Link href="/" className="hover:text-amber-600 transition-colors">RSS Feed</Link>
                        <Link href="/about" className="hover:text-amber-600 transition-colors">Connect</Link>
                    </div>
                </footer>
            </main>
        </div>
    );
}
