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
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-800 font-sans selection:bg-amber-200">
            <main className="max-w-6xl mx-auto px-6 py-20">
                <Header />

                {/* Page Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 tracking-tight">🎙️ Lenny 播客笔记索引</h1>
                    <p className="text-gray-500">
                        {posts.length} 场深度访谈 · 金字塔原理 + 芒格思维模型解读
                    </p>
                </header>

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="搜索嘉宾、主题..."
                        className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedCategory === null
                            ? "bg-amber-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        全部 ({posts.length})
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedCategory === cat
                                ? "bg-amber-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {cat} ({categoryCounts[cat] || 0})
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-xs text-gray-500 uppercase tracking-wider">
                                <th className="px-4 py-3 w-24">类别</th>
                                <th className="px-4 py-3 w-28">日期</th>
                                <th className="px-4 py-3 w-40">嘉宾</th>
                                <th className="px-4 py-3">简介</th>
                                <th className="px-4 py-3 hidden md:table-cell">金句</th>
                                <th className="px-4 py-3 w-20 text-center">链接</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredPosts.map((post) => (
                                <tr key={post.id} className="hover:bg-amber-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">
                                            {post.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs text-gray-500 tabular-nums">
                                            {post.date}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-medium text-zinc-800">{post.guest}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {post.summary}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 italic hidden md:table-cell max-w-xs truncate">
                                        "{post.quote}"
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Link
                                            href={post.link}
                                            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                                        >
                                            阅读 →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredPosts.length === 0 && (
                    <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-lg mt-4">
                        未找到相关访谈 🔍
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-400">
                    数据来源：Lenny's Podcast · 笔记由 AI 辅助整理
                </div>
            </main>
        </div>
    );
}
