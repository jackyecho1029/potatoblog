"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import { LearningPostData } from "../../lib/learning";

interface LearningPageClientProps {
    posts: LearningPostData[];
}

export default function LearningPageClient({ posts }: LearningPageClientProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'signal'>('all');
    const [filteredPosts, setFilteredPosts] = useState(posts);

    const handleFilteredItems = useCallback((filtered: LearningPostData[]) => {
        setFilteredPosts(filtered);
    }, []);

    // Filter logic based on tab
    const displayPosts = filteredPosts.filter(post => {
        if (activeTab === 'signal') return post.category === 'X Signal';
        return post.category !== 'X Signal'; // Default 'all' hides signals for now to keep them separate? Or show all? User said "New Column", implying separation. Let's separate.
    });

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-800 font-sans selection:bg-amber-200">
            <main className="max-w-5xl mx-auto px-6 py-20">
                <Header />

                <header className="mb-12">
                    <h1 className="text-3xl font-bold mb-4 tracking-tight">学习中心</h1>
                    <div className="flex gap-8 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'all' ? 'border-b-2 border-amber-500 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            精选课程
                        </button>
                        <button
                            onClick={() => setActiveTab('signal')}
                            className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'signal' ? 'border-b-2 border-amber-500 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            X Signals (每日情报)
                        </button>
                    </div>
                </header>

                <SearchBar
                    items={posts}
                    onFilteredItems={handleFilteredItems}
                    placeholder="搜索标题、作者..."
                    showAuthorFilter={true}
                />

                {/* X Signals Table View */}
                {activeTab === 'signal' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs text-gray-500 border-b border-gray-200">
                                    <th className="py-4 w-32 font-normal">DATE</th>
                                    <th className="py-4 font-normal">TOPIC & THOUGHT</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {displayPosts.map((post) => (
                                    <tr key={post.id} className="group hover:bg-white transition-colors">
                                        <td className="py-6 pr-6 align-top text-sm text-gray-400 font-mono">
                                            {post.date}
                                        </td>
                                        <td className="py-6 align-top">
                                            <Link href={`/learning/${post.id}`} className="block group-hover:translate-x-1 transition-transform">
                                                <div className="text-lg font-semibold text-zinc-800 mb-2 group-hover:text-amber-600">
                                                    {post.title_best || post.title}
                                                </div>
                                                {post.anchor_thought && (
                                                    <div className="text-gray-500 italic font-serif text-sm leading-relaxed border-l-2 border-amber-200 pl-3">
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
                ) : (
                    /* Gallery Grid (Existing) */
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
                                            {decodeHtmlEntities(post.title)}
                                        </h2>
                                        <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
                                            <span>{post.date}</span>
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
                )}

                {displayPosts.length === 0 && (
                    <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-lg">
                        未找到相关内容 🔍
                    </div>
                )}
            </main>
        </div>
    );
}

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
