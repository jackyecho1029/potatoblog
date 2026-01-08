
import { getXSignalPostData } from "../../../lib/x-signals";
import Link from 'next/link';
import GiscusComments from '@/app/components/GiscusComments';

export default async function XSignalPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const postData = await getXSignalPostData(slug);

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-800 font-sans selection:bg-amber-200">
            <main className="max-w-2xl mx-auto px-6 py-20">

                {/* Navigation */}
                <header className="mb-12">
                    <Link href="/x-signals" className="text-zinc-500 hover:text-amber-600 transition flex items-center gap-2">
                        ← Back to Intelligence
                    </Link>
                </header>

                {/* Article Header */}
                <article className="prose prose-zinc prose-lg mx-auto">
                    <h1 className="mb-2 leading-tight">{postData.title_best || postData.title}</h1>

                    {postData.anchor_thought && (
                        <div className="text-xl font-serif italic text-gray-600 mb-8 border-l-4 border-amber-400 pl-4 py-2 bg-amber-50/50">
                            "{postData.anchor_thought}"
                        </div>
                    )}

                    <div className="flex gap-4 text-sm text-zinc-500 mb-8 not-prose border-b border-gray-100 pb-8">
                        <time className="font-mono">{postData.date}</time>
                        <div className="flex gap-2">
                            {postData.tags?.map(tag => (
                                <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Markdown Content */}
                    <div dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }} />

                    <hr className="my-12 border-zinc-200" />

                    {/* Comments Section */}
                    <GiscusComments />
                </article>

            </main>
        </div>
    );
}
