import { getLearningPostData, getSortedLearningPostsData } from "../../../lib/learning";
import Header from "../../components/Header";
import Link from "next/link";
import { notFound } from "next/navigation";

// Generate static paths for all learning posts
export async function generateStaticParams() {
    const posts = getSortedLearningPostsData();
    return posts.map((post) => ({
        id: post.id,
    }));
}

export default async function LearningPost({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const postData = await getLearningPostData(id);

        return (
            <div className="min-h-screen bg-[#FDFBF7] text-zinc-800 font-sans selection:bg-amber-200">
                <main className="max-w-2xl mx-auto px-6 py-20">
                    <Header />

                    <article className="prose prose-zinc max-w-none">
                        <div className="mb-8">
                            <time className="text-sm text-gray-400 font-mono">{postData.date}</time>
                            <h1 className="text-3xl font-bold mt-2 mb-4">{decodeHtmlEntities(postData.title)}</h1>
                            {postData.source_url && (
                                <a
                                    href={postData.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-amber-600 hover:underline"
                                >
                                    📺 Watch Original Video
                                </a>
                            )}
                        </div>

                        <div
                            className="prose-headings:font-bold prose-h2:text-xl prose-h3:text-lg prose-blockquote:border-l-amber-500 prose-blockquote:bg-amber-50 prose-blockquote:py-2 prose-blockquote:px-4"
                            dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }}
                        />
                    </article>

                    <div className="mt-16 pt-8 border-t border-zinc-200">
                        <Link href="/learning" className="text-amber-600 hover:underline">
                            ← Back to Learning Hub
                        </Link>
                    </div>
                </main>
            </div>
        );
    } catch {
        notFound();
    }
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
