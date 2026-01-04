import Link from "next/link";
import { getSortedLearningPostsData } from "../../lib/learning";
import Header from "../components/Header";

export default function LearningPage() {
    // Fetch learning data
    const posts = getSortedLearningPostsData();

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-800 font-sans selection:bg-amber-200">
            <main className="max-w-2xl mx-auto px-6 py-20">
                <Header />

                <header className="mb-12">
                    <h1 className="text-3xl font-bold mb-4 tracking-tight">Learning Hub</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Daily automated summaries from my favorite creators. <br />
                        Curated by AI, refined by human curiosity.
                    </p>
                </header>

                <div className="space-y-12">
                    {posts.map((post) => (
                        <article key={post.id} className="group">
                            <Link href={`/learning/${post.id}`} className="block">
                                <div className="flex flex-col gap-2">
                                    <time className="text-sm text-gray-400 font-mono">{post.date}</time>
                                    <h2 className="text-xl font-semibold group-hover:text-amber-600 transition-colors">
                                        {decodeHtmlEntities(post.title)}
                                    </h2>
                                    {post.tags && (
                                        <div className="flex gap-2 mt-2">
                                            {post.tags.map((tag) => (
                                                <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        </article>
                    ))}

                    {posts.length === 0 && (
                        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                            No learning notes yet. The automated agent is sleeping. 💤
                        </div>
                    )}
                </div>
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

