import Link from "next/link";
import Image from "next/image";
import { getSortedLearningPostsData } from "../../lib/learning";
import Header from "../components/Header";

export default function LearningPage() {
    const posts = getSortedLearningPostsData();

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-800 font-sans selection:bg-amber-200">
            <main className="max-w-5xl mx-auto px-6 py-20">
                <Header />

                <header className="mb-12">
                    <h1 className="text-3xl font-bold mb-4 tracking-tight">Learning Hub</h1>
                    <p className="text-gray-600">
                        每日精选，AI 智能总结，助你高效学习。
                    </p>
                </header>

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
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
                                    {/* Duration/Source badge */}
                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                        YouTube
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <time className="text-xs text-gray-400 font-mono">{post.date}</time>
                                    <h2 className="text-lg font-semibold mt-1 line-clamp-2 group-hover:text-amber-600 transition-colors">
                                        {decodeHtmlEntities(post.title)}
                                    </h2>
                                    {post.tags && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {post.tags.slice(0, 2).map((tag) => (
                                                <span key={tag} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        </article>
                    ))}
                </div>

                {posts.length === 0 && (
                    <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-lg">
                        暂无学习笔记，AI 机器人正在休息中... 💤
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
