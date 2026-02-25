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
            <main className="max-w-4xl mx-auto px-8 py-24 fade-in">
                <Header />

                {/* Hero / Intro */}
                <section className="mb-32">
                    <h2 className="text-6xl md:text-7xl font-serif leading-[1.1] mb-10 tracking-tight text-zinc-900">
                        慢慢成长，<br />
                        <span className="text-amber-600 italic">深深扎根。</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-zinc-500 leading-relaxed max-w-2xl font-light">
                        探索技术与人生的交汇点。在这里，我分享成为更好的产品构建者和更有思考力的人的旅程。
                    </p>
                </section>

                {/* Search Bar Container with extra margin */}
                <div className="mb-24">
                    <SearchBar
                        items={posts}
                        onFilteredItems={handleFilteredItems}
                        placeholder="搜索我的思考..."
                    />
                </div>

                {/* Posts List */}
                <section>
                    <div className="flex items-center gap-4 mb-16">
                        <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-300">最新文章</h3>
                        <div className="flex-1 h-px bg-zinc-100"></div>
                    </div>

                    <div className="space-y-24">
                        {filteredPosts.map(({ id, date, title, tags }) => (
                            <article key={id} className="group flex flex-col md:flex-row gap-8 items-baseline">
                                <div className="md:w-32 flex-shrink-0 text-sm font-mono text-zinc-300 group-hover:text-amber-600 transition-colors">
                                    {date}
                                </div>
                                <div className="flex-1">
                                    <Link href={`/posts/${id}`} className="block group">
                                        <h4 className="text-3xl font-serif font-medium mb-4 group-hover:text-amber-600 transition-all duration-300 leading-snug">
                                            {title}
                                        </h4>
                                        <p className="text-zinc-500 leading-relaxed mb-6 font-light line-clamp-2 max-w-2xl">
                                            在这篇文章中，我探讨了相关的核心逻辑与实践心得。点击阅读更多细节...
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {tags?.map(tag => (
                                                <span key={tag} className="text-[11px] uppercase tracking-wider px-2 py-1 bg-zinc-50 text-zinc-400 rounded group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </Link>
                                </div>
                            </article>
                        ))}

                        {filteredPosts.length === 0 && (
                            <div className="py-20 text-center">
                                <p className="text-zinc-300 italic text-xl">未找到相关文章，试试换个关键词路径？ 🔍</p>
                            </div>
                        )}
                    </div>
                </section>

                <footer className="mt-48 pt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[12px] uppercase tracking-widest text-zinc-300 font-medium">
                    <span>&copy; 2026 Jacky Potato. Built with High Agency.</span>
                    <div className="flex gap-8">
                        <Link href="/" className="hover:text-amber-600 transition">RSS Feed</Link>
                        <Link href="/about" className="hover:text-amber-600 transition">Connect</Link>
                    </div>
                </footer>
            </main>
        </div>
    );
}
