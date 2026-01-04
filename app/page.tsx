import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-zinc-800 font-sans selection:bg-amber-200">
      <main className="max-w-2xl mx-auto px-6 py-20">

        {/* Header / Logo Area */}
        <header className="mb-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              P
            </div>
            <h1 className="text-2xl font-bold tracking-tight">PotatoEcho</h1>
          </div>
          <nav className="flex gap-6 text-sm font-medium text-zinc-500">
            <Link href="/" className="hover:text-amber-600 transition">Blog</Link>
            <Link href="/about" className="hover:text-amber-600 transition">About</Link>
          </nav>
        </header>

        {/* Hero / Intro */}
        <section className="mb-20">
          <h2 className="text-4xl font-extrabold tracking-tight mb-6 leading-tight">
            Growing slowly, <br />
            <span className="text-amber-700">Deeply rooted.</span>
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed">
            Exploring the intersection of **Technology** and **Life**.
            Here I share my journey of becoming a better product builder and a thoughtful human being.
          </p>
        </section>

        {/* Latest Posts Area */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-8">Latest Writings</h3>

          <div className="space-y-10">
            {allPostsData.map(({ id, date, title, tags }) => (
              <article key={id} className="group cursor-pointer">
                <Link href={`/posts/${id}`}>
                  <h4 className="text-xl font-bold mb-2 group-hover:text-amber-700 transition">{title}</h4>
                  <p className="text-zinc-500 text-sm mb-3">
                    {date} • {tags?.join(", ")}
                  </p>
                  <p className="text-zinc-600 leading-relaxed line-clamp-2">
                    Click to read more...
                  </p>
                </Link>
              </article>
            ))}

            {allPostsData.length === 0 && (
              <p className="text-zinc-400 italic">No posts found. Create one in /posts/ directory.</p>
            )}
          </div>
        </section>

        <footer className="mt-32 border-t border-zinc-200 pt-8 text-center text-sm text-zinc-400">
          &copy; 2026 Jacky Potato. Built with Next.js & Vercel.
        </footer>

      </main>
    </div>
  );
}
