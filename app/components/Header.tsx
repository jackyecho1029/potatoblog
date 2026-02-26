"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { href: "/", label: "博客" },
        { href: "/lenny", label: "🎙️ Lenny" },
        { href: "/xhs-viral", label: "🔥 小红书" },
        { href: "/writing-analysis", label: "✍️ 写作" },
        { href: "/x-signals", label: "X 信号" },
        { href: "/learning", label: "学习" },
        { href: "/about", label: "关于" },
    ];

    const isActive = (path: string) => {
        if (path === "/" && pathname !== "/") return false;
        return pathname.startsWith(path);
    };

    return (
        <header className="mb-24 flex items-center justify-between py-4 relative z-50">
            <Link href="/" className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-white font-serif text-2xl group-hover:bg-amber-700 transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5">
                    P
                </div>
                <h1 className="text-2xl font-serif font-medium tracking-tight group-hover:text-amber-700 transition-colors duration-300">PotatoEcho</h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-8 text-[13px] font-medium tracking-widest uppercase items-center">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`transition-all duration-300 pb-1 border-b-2 hover:text-zinc-800 ${isActive(link.href)
                                ? "text-amber-700 border-amber-700 font-bold"
                                : "text-zinc-400 border-transparent hover:border-zinc-200"
                            }`}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
                className="lg:hidden p-2 text-zinc-600 hover:text-amber-700 focus:outline-none transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
            >
                {isMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>

            {/* Mobile Navigation Dropdown */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-zinc-100 shadow-xl lg:hidden flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`text-sm font-medium tracking-widest uppercase py-2 transition-colors ${isActive(link.href)
                                    ? "text-amber-700 font-bold"
                                    : "text-zinc-400 hover:text-zinc-800"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
}
