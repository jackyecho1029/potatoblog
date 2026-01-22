
import { getPostData } from '@/lib/posts';
import Link from 'next/link';
import GiscusComments from '@/app/components/GiscusComments';
import PasswordProtection from '@/app/components/PasswordProtection';

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const postData = await getPostData(slug);

    const content = (
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-800 font-sans selection:bg-amber-200">
            <main className="max-w-5xl mx-auto px-6 py-20">

                {/* Navigation */}
                <header className="mb-12">
                    <Link href="/" className="text-zinc-500 hover:text-amber-600 transition flex items-center gap-2">
                        ← Back to Blog
                    </Link>
                </header>

                {/* Article Header */}
                <article className="prose prose-zinc prose-lg mx-auto">
                    <h1 className="mb-2">{postData.title}</h1>
                    <div className="flex gap-4 text-sm text-zinc-500 mb-8 not-prose">
                        <time>{postData.date}</time>
                        <div className="flex gap-2">
                            {postData.tags?.map(tag => (
                                <span key={tag} className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold">
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

    // If post is private and has password, wrap with protection
    if (postData.private && postData.password) {
        return (
            <PasswordProtection postId={slug} correctPassword={postData.password}>
                {content}
            </PasswordProtection>
        );
    }

    return content;
}
