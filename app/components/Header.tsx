import Link from "next/link";

export default function Header() {
    return (
        <header className="mb-24 flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-white font-serif text-2xl group-hover:bg-amber-700 transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5">
                    P
                </div>
                <h1 className="text-2xl font-serif font-medium tracking-tight group-hover:text-amber-700 transition-colors duration-300">PotatoEcho</h1>
            </Link>
            <nav className="hidden md:flex gap-10 text-[13px] font-medium tracking-widest uppercase text-zinc-400">
                <Link href="/" className="hover:text-zinc-800 transition-colors duration-200">博客</Link>
                <Link href="/lenny" className="hover:text-zinc-800 transition-colors duration-200">🎙️ Lenny</Link>
                <Link href="/xhs-viral" className="hover:text-zinc-800 transition-colors duration-200">🔥 小红书</Link>
                <Link href="/x-signals" className="hover:text-zinc-800 transition-colors duration-200 font-bold text-amber-700 border-b-2 border-amber-700 pb-1">X 信号</Link>
                <Link href="/learning" className="hover:text-zinc-800 transition-colors duration-200">学习</Link>
            </nav>
        </header>
    );
}
