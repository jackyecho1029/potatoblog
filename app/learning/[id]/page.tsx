import { getLearningPostData, getSortedLearningPostsData } from "../../../lib/learning";
import Header from "../../components/Header";
import GiscusComments from "../../components/GiscusComments";
import PasswordProtection from "../../components/PasswordProtection";
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

        const content = (
            <div className="min-h-screen bg-[#FDFBF7] text-zinc-800 font-sans selection:bg-amber-200">
                <main className="max-w-2xl mx-auto px-6 py-20">
                    <Header />

                    <article>
                        {/* Title and Meta */}
                        <header className="mb-8 pb-6 border-b border-gray-200">
                            <h1 className="text-3xl font-bold mb-4 leading-tight">{decodeHtmlEntities(postData.title)}</h1>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                {postData.author && (
                                    <span className="flex items-center gap-1">
                                        <span className="text-gray-400">频道：</span>
                                        <span className="font-medium text-zinc-700">{postData.author}</span>
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <span className="text-gray-400">发布日期：</span>
                                    <span>{postData.date}</span>
                                </span>
                                {postData.category && (
                                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
                                        {postData.category}
                                    </span>
                                )}
                            </div>

                            {postData.source_url && (
                                <a
                                    href={postData.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 mt-4 text-sm text-amber-600 hover:underline"
                                >
                                    📺 观看原视频
                                </a>
                            )}
                        </header>

                        {/* Content */}
                        <div
                            className="prose prose-zinc max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-blockquote:border-l-amber-500 prose-blockquote:bg-amber-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-zinc-700 prose-li:my-1"
                            dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }}
                        />
                    </article>

                    <div className="mt-16 pt-8 border-t border-zinc-200">
                        <Link href="/learning" className="text-amber-600 hover:underline">
                            ← 返回学习中心
                        </Link>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-12">
                        <h3 className="text-lg font-semibold mb-4">💬 讨论区</h3>
                        <GiscusComments />
                    </div>
                </main>
            </div>
        );

        // If post is private and has password, wrap with protection
        if (postData.private && postData.password) {
            return (
                <PasswordProtection postId={id} correctPassword={postData.password}>
                    {content}
                </PasswordProtection>
            );
        }

        return content;
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
