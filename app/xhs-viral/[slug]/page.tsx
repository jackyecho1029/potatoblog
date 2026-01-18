
import { getXhsViralPostData } from "../../../lib/xhs-viral";
import Link from 'next/link';
import GiscusComments from '@/app/components/GiscusComments';

export default async function XhsViralPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const postData = await getXhsViralPostData(slug);

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-800 font-sans selection:bg-red-200">
            <main className="max-w-3xl mx-auto px-6 py-20">

                {/* Navigation */}
                <header className="mb-12">
                    <Link href="/xhs-viral" className="text-zinc-500 hover:text-red-500 transition flex items-center gap-2">
                        ← 返回爆款分析列表
                    </Link>
                </header>

                {/* Article Header */}
                <article className="prose prose-zinc prose-lg mx-auto max-w-none">
                    <div className="flex items-center gap-3 mb-4 not-prose">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-red-100 text-red-600">
                            🔥 #{postData.keyword}
                        </span>
                        {postData.analyzed_posts && (
                            <span className="text-gray-400 text-sm">
                                分析 {postData.analyzed_posts} 篇爆款
                            </span>
                        )}
                    </div>

                    <h1 className="mb-4 leading-tight text-3xl font-bold">{postData.title}</h1>

                    {postData.summary && (
                        <div className="text-xl font-serif italic text-gray-600 mb-8 border-l-4 border-red-400 pl-4 py-2 bg-red-50/50 not-prose">
                            {postData.summary}
                        </div>
                    )}

                    <div className="flex gap-4 text-sm text-zinc-500 mb-8 not-prose border-b border-gray-100 pb-8">
                        <time className="font-mono">{postData.date}</time>
                        <span className="flex items-center gap-1">
                            <span>🤖</span> Gemini 3 Flash
                        </span>
                        <span className="flex items-center gap-1">
                            <span>🥔</span> Potato Analytics
                        </span>
                    </div>

                    {/* Markdown Content */}
                    <div
                        className="prose-headings:text-zinc-900 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-table:text-sm"
                        dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }}
                    />

                    <hr className="my-12 border-zinc-200" />

                    {/* Comments Section */}
                    <GiscusComments />
                </article>

            </main>
        </div>
    );
}
