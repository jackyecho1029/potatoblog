
import { getPostData } from '@/lib/posts';
import Link from 'next/link';
import GiscusComments from '@/app/components/GiscusComments';
import PasswordProtection from '@/app/components/PasswordProtection';
import Header from '@/app/components/Header';

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const postData = await getPostData(slug);

    const content = (
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-900 font-sans selection:bg-amber-100 selection:text-amber-900 border-t-8 border-amber-600">
            <main className="max-w-4xl mx-auto px-8 py-24">
                <div className="animate-fade-in-up stagger-1">
                    <Header />
                </div>

                {/* Article Layout */}
                <article className="max-w-none">
                    <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-100 pb-12 animate-fade-in-up stagger-2">
                        <div className="flex-1">
                            <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-300 hover:text-amber-600 transition-colors mb-8 block">
                                ← Back to Blog
                            </Link>
                            <h1 className="text-5xl md:text-7xl font-serif font-medium leading-[1] tracking-tighter text-zinc-900 mb-8">
                                {postData.title}
                            </h1>
                            <div className="flex items-center gap-6 text-[11px] text-zinc-400 font-mono uppercase tracking-widest">
                                <time className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    {postData.date}
                                </time>
                                <span className="text-zinc-200">|</span>
                                <div className="flex gap-3">
                                    {postData.tags?.map(tag => (
                                        <span key={tag} className="uppercase tracking-widest text-[9px] bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100 italic">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="prose prose-zinc prose-lg lg:prose-xl prose-headings:font-serif prose-headings:font-medium prose-headings:tracking-tight prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline prose-img:rounded-3xl prose-img:shadow-2xl mx-auto max-w-3xl animate-fade-in-up stagger-3">
                        <div
                            className="markdown-content font-light leading-relaxed text-zinc-800"
                            dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }}
                        />
                    </div>

                    <div className="mt-48 pt-16 border-t border-zinc-100 max-w-3xl mx-auto animate-fade-in-up stagger-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-300 mb-12">Comments & Reflection</h4>
                        <GiscusComments />
                    </div>
                </article>

                <footer className="mt-48 pt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] uppercase tracking-widest text-zinc-400 font-medium animate-fade-in-up stagger-5">
                    <span>Potato Echo &copy; 2026</span>
                    <div className="flex gap-8">
                        <Link href="/" className="hover:text-amber-600 transition-colors">Thinking</Link>
                        <Link href="/about" className="hover:text-amber-600 transition-colors">About</Link>
                    </div>
                </footer>
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
