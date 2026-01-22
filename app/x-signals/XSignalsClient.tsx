
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
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-800 font-sans selection:bg-amber-200">
            <main className="max-w-5xl mx-auto px-6 py-20">
                <Header />

                <header className="mb-12">
                    <h1 className="text-3xl font-bold mb-4 tracking-tight">X Signals (每日情报)</h1>
                    <p className="text-gray-600 max-w-2xl">
                        AI 驱动的全球科技与商业情报日报。借他山之石，琢个人之玉。
                    </p>
                </header>

                <SearchBar
                    items={posts}
                    onFilteredItems={handleFilteredItems}
                    placeholder="搜索情报..."
                    showAuthorFilter={true}
                    showCategoryFilter={true}
                />

                {/* X Signals Table View */}
                <div className="mt-8">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead>
                            <tr className="text-xs text-gray-400 border-b border-gray-200 font-medium tracking-wider uppercase">
                                <th className="py-4 w-32 font-normal">Date</th>
                                <th className="py-4 font-normal">Topic & Host's Thought</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPosts.map((post) => (
                                <tr key={post.id} className="group hover:bg-white transition-colors duration-200">
                                    <td className="py-6 pr-6 align-top text-sm text-gray-400 font-mono">
                                        {post.date}
                                    </td>
                                    <td className="py-6 align-top">
                                        <Link href={`/x-signals/${post.id}`} className="block group-hover:translate-x-1 transition-transform duration-200">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-xl font-bold text-zinc-900 group-hover:text-amber-600">
                                                    {post.title_best || post.title}
                                                </span>
                                                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-600 text-sm font-medium">
                                                    Read →
                                                </span>
                                            </div>
                                            {post.anchor_thought && (
                                                <div className="text-gray-600 font-serif italic text-base leading-relaxed pl-4 border-l-2 border-amber-300">
                                                    "{post.anchor_thought}"
                                                </div>
                                            )}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredPosts.length === 0 && (
                    <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-lg mt-8">
                        未找到相关情报 🔍
                    </div>
                )}
            </main>
        </div>
    );
}
