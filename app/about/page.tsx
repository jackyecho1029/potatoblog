
import Link from 'next/link';

export default function About() {
    return (
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-800 font-sans selection:bg-amber-200">
            <main className="max-w-2xl mx-auto px-6 py-20">

                {/* Header */}
                <header className="mb-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="font-bold tracking-tight text-xl hover:text-amber-600 transition">
                            PotatoEcho
                        </Link>
                    </div>
                    <nav className="flex gap-6 text-sm font-medium text-zinc-500">
                        <Link href="/" className="hover:text-amber-600 transition">Blog</Link>
                        <Link href="/about" className="text-amber-600">About</Link>
                    </nav>
                </header>

                <article className="prose prose-zinc prose-lg">
                    <h1 className="text-3xl font-extrabold tracking-tight mb-8">About Me</h1>

                    <div className="bg-amber-50 p-6 rounded-lg border-l-4 border-amber-400 mb-8 italic text-amber-900">
                        "Slogan Goes Here"
                    </div>

                    <p>
                        [Your Bio Here. Keep it authentic.]
                    </p>

                    <h3>My Journey</h3>
                    <ul>
                        <li>🌱 2024: Started learning Code...</li>
                        <li>🥔 2025: Created PotatoEcho...</li>
                        <li>🚀 2026: ...</li>
                    </ul>

                    <h3>Find me online</h3>
                    <ul className="not-prose flex gap-4 mt-8">
                        <li><a href="#" className="underline text-amber-600">GitHub</a></li>
                        <li><a href="#" className="underline text-amber-600">Twitter</a></li>
                    </ul>
                </article>

            </main>
        </div>
    );
}
