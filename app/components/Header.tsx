import Link from "next/link";

export default function Header() {
    return (
        <header className="mb-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xl group-hover:bg-amber-700 transition">
                    P
                </div>
                <h1 className="text-2xl font-bold tracking-tight group-hover:text-amber-700 transition">PotatoEcho</h1>
            </Link>
            <nav className="flex gap-6 text-sm font-medium text-zinc-500">
                <Link href="/" className="hover:text-amber-600 transition">Blog</Link>
                <Link href="/learning" className="hover:text-amber-600 transition">Learning</Link>
                <Link href="/about" className="hover:text-amber-600 transition">About</Link>
            </nav>
        </header>
    );
}
