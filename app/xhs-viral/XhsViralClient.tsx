
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import { XhsViralPostData } from "../../lib/xhs-viral";

interface XhsViralClientProps {
    posts: XhsViralPostData[];
}

export default function XhsViralClient({ posts }: XhsViralClientProps) {
    const [filteredPosts, setFilteredPosts] = useState(posts);

    const handleFilteredItems = useCallback((filtered: XhsViralPostData[]) => {
        setFilteredPosts(filtered);
    }, []);

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-800 font-sans selection:bg-red-200">
            <main className="max-w-5xl mx-auto px-6 py-20">
                <Header />

                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">🔥</span>
                        <h1 className="text-3xl font-bold tracking-tight">小红书爆款分析</h1>
                    </div>
                    <p className="text-gray-600 max-w-2xl">
                        AI 驱动的小红书爆款内容深度拆解。分析标题、框架、评论，生成可操作模板。
                    </p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                            <span>🤖</span> Powered by Gemini 3 Flash
                        </span>
                        <span className="flex items-center gap-1">
                            <span>🥔</span> 运营伙伴 Potato
                        </span>
                    </div>
                </header>

                <SearchBar
                    items={posts}
                    onFilteredItems={handleFilteredItems}
                    placeholder="搜索关键词..."
                    showAuthorFilter={false}
                />

                {/* XHS Viral Posts Table View */}
                <div className="mt-8">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead>
                            <tr className="text-xs text-gray-400 border-b border-gray-200 font-medium tracking-wider uppercase">
                                <th className="py-4 w-32 font-normal">日期</th>
                                <th className="py-4 w-32 font-normal">关键词</th>
                                <th className="py-4 font-normal">报告标题</th>
                                <th className="py-4 w-24 font-normal text-center">样本数</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPosts.map((post) => (
                                <tr key={post.id} className="group hover:bg-white transition-colors duration-200">
                                    <td className="py-6 pr-4 align-top text-sm text-gray-400 font-mono">
                                        {post.date}
                                    </td>
                                    <td className="py-6 pr-4 align-top">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-600">
                                            #{post.keyword}
                                        </span>
                                    </td>
                                    <td className="py-6 align-top">
                                        <Link href={`/xhs-viral/${post.id}`} className="block group-hover:translate-x-1 transition-transform duration-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-lg font-bold text-zinc-900 group-hover:text-red-500">
                                                    {post.title}
                                                </span>
                                                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 text-sm font-medium">
                                                    阅读 →
                                                </span>
                                            </div>
                                            {post.summary && (
                                                <div className="text-gray-500 text-sm line-clamp-2">
                                                    {post.summary}
                                                </div>
                                            )}
                                        </Link>
                                    </td>
                                    <td className="py-6 align-top text-center">
                                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 text-amber-600 font-bold text-lg">
                                            {post.analyzed_posts || 10}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredPosts.length === 0 && (
                    <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-lg mt-8">
                        暂无爆款分析报告 📊
                    </div>
                )}
            </main>
        </div>
    );
}
