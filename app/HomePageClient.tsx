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
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-800 font-sans selection:bg-amber-200">
            <main className="max-w-2xl mx-auto px-6 py-20">
                <Header />

                {/* Hero / Intro */}
                <section className="mb-12">
                    <h2 className="text-4xl font-extrabold tracking-tight mb-6 leading-tight">
                        慢慢成长，<br />
                        <span className="text-amber-700">深深扎根。</span>
                    </h2>
                    <p className="text-lg text-zinc-600 leading-relaxed">
                        探索技术与人生的交汇点。在这里，我分享成为更好的产品构建者和更有思考力的人的旅程。
                    </p>
                </section>

                {/* Search Bar */}
                <SearchBar
                    items={posts}
                    onFilteredItems={handleFilteredItems}
                    placeholder="搜索文章标题..."
                />

                {/* Posts List */}
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-8">最新文章</h3>

                    <div className="space-y-10">
                        {filteredPosts.map(({ id, date, title, tags }) => (
                            <article key={id} className="group cursor-pointer">
                                <Link href={`/posts/${id}`}>
                                    <h4 className="text-xl font-bold mb-2 group-hover:text-amber-700 transition">{title}</h4>
                                    <p className="text-zinc-500 text-sm mb-3">
                                        {date} {tags && tags.length > 0 && `• ${tags.join(", ")}`}
                                    </p>
                                    <p className="text-zinc-600 leading-relaxed line-clamp-2">
                                        点击阅读更多...
                                    </p>
                                </Link>
                            </article>
                        ))}

                        {filteredPosts.length === 0 && (
                            <p className="text-zinc-400 italic">未找到相关文章 🔍</p>
                        )}
                    </div>
                </section>

                <footer className="mt-32 border-t border-zinc-200 pt-8 text-center text-sm text-zinc-400">
                    &copy; 2026 Jacky Potato. 使用 Next.js 和 Vercel 构建。
                </footer>
            </main>
        </div>
    );
}
