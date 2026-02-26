"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { LennyPost } from "../../lib/lenny-posts";

interface LennyIndexClientProps {
    posts: LennyPost[];
    categories: string[];
}

export default function LennyIndexClient({ posts, categories }: LennyIndexClientProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter posts based on category and search term
    const filteredPosts = useMemo(() => {
        let result = posts;

        if (selectedCategory) {
            result = result.filter(post => post.category === selectedCategory);
        }

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(post =>
                post.guest.toLowerCase().includes(lower) ||
                post.summary.toLowerCase().includes(lower) ||
                post.quote.toLowerCase().includes(lower)
            );
        }

        return result;
    }, [posts, selectedCategory, searchTerm]);

    // Count posts per category
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        posts.forEach(post => {
            counts[post.category] = (counts[post.category] || 0) + 1;
        });
        return counts;
    }, [posts]);

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-900 font-sans selection:bg-amber-100 selection:text-amber-900 border-t-8 border-amber-600">
            <main className="max-w-6xl mx-auto px-8 py-24">
                <div className="animate-fade-in-up stagger-1">
                    <Header />
                </div>

                {/* Page Header */}
                <header className="mb-20 animate-fade-in-up stagger-2">
                    <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-[11px] font-extrabold uppercase tracking-[0.25em] rounded-md border border-amber-100 mb-8">
                        PODCAST NOTES
                    </span>
                    <h1 className="text-6xl md:text-8xl font-serif leading-[1] mb-10 tracking-tighter text-zinc-900">
                        Lenny <span className="text-amber-600 italic">播客笔记.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-500 leading-relaxed max-w-2xl font-light">
                        {posts.length} 场深度访谈 · 基于金字塔原理与芒格思维模型的实效性解读。
                    </p>
                </header>

                {/* Search & Categories */}
                <div className="mb-16 animate-fade-in-up stagger-3">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                        <div className="w-full md:max-w-md">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="搜索嘉宾、主题、格言..."
                                className="w-full px-6 py-4 bg-white border border-zinc-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all border ${selectedCategory === null
                                    ? "bg-amber-600 text-white border-amber-600 shadow-md"
                                    : "bg-white text-zinc-400 border-zinc-100 hover:border-amber-200 hover:text-amber-600"
                                    }`}
                            >
                                全部 ({posts.length})
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all border ${selectedCategory === cat
                                        ? "bg-amber-600 text-white border-amber-600 shadow-md"
                                        : "bg-white text-zinc-400 border-zinc-100 hover:border-amber-200 hover:text-amber-600"
                                        }`}
                                >
                                    {cat} ({categoryCounts[cat] || 0})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up stagger-4">
                    {filteredPosts.map((post, index) => (
                        <Link
                            key={post.id}
                            href={post.link}
                            className={`bento-card group flex flex-col justify-between stagger-${(index % 5) + 1}`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 px-2 py-1 bg-amber-50 rounded-md border border-amber-100/50">
                                        {post.category}
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-300 group-hover:text-zinc-400 transition-colors uppercase tracking-widest">
                                        {post.date}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-serif font-medium text-zinc-800 mb-4 group-hover:text-amber-700 transition-colors leading-tight">
                                    {post.guest}
                                </h3>
                                <p className="text-zinc-500 font-light leading-relaxed mb-10 line-clamp-4 text-sm md:text-base italic">
                                    "{post.quote || post.summary}"
                                </p>
                            </div>

                            <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                阅读深度笔记 <span className="ml-2 font-mono">→</span>
                            </div>
                        </Link>
                    ))}

                    {filteredPosts.length === 0 && (
                        <div className="col-span-full py-40 text-center bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200">
                            <div className="text-6xl mb-8 animate-pulse text-zinc-200">🔍</div>
                            <p className="text-zinc-300 text-xl font-light italic">未找到相关访谈，试试换个关键词？</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="mt-48 pt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] uppercase tracking-widest text-zinc-400 font-medium animate-fade-in-up stagger-5">
                    <span>Lenny's Digest &copy; 2026. High Agency Analysis.</span>
                    <div className="flex gap-8">
                        <Link href="/" className="hover:text-amber-600 transition-colors">Potato Hub</Link>
                        <Link href="/about" className="hover:text-amber-600 transition-colors">About</Link>
                    </div>
                </footer>
            </main>
        </div>
    );
}
