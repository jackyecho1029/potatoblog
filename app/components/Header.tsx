"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { levelOf, streakOf, useProgress } from "../../lib/progress";

type NavLink = { href: string; label: string };

const NAV: (NavLink | { label: string; children: NavLink[] })[] = [
    { href: "/", label: "博客" },
    { href: "/learning", label: "学习" },
    { href: "/lenny", label: "🎙️ Lenny" },
    {
        label: "洞察",
        children: [
            { href: "/xhs-viral", label: "🔥 小红书爆款" },
            { href: "/writing-analysis", label: "✍️ 写作拆解" },
            { href: "/x-signals", label: "𝕏 信号" },
        ],
    },
    { href: "/about", label: "关于" },
];

export default function Header() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));
    const linkCls = (active: boolean) =>
        `transition-all duration-300 pb-1 border-b-2 hover:text-zinc-800 ${active ? "text-amber-700 border-amber-700 font-bold" : "text-zinc-400 border-transparent hover:border-zinc-200"}`;

    return (
        <header className="mb-16 flex items-center justify-between py-4 relative z-50">
            <Link href="/" className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-white font-serif text-2xl group-hover:bg-amber-700 transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5">
                    P
                </div>
                <span className="text-2xl font-serif font-medium tracking-tight group-hover:text-amber-700 transition-colors duration-300">PotatoEcho</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-8 text-[13px] font-medium tracking-widest items-center">
                {NAV.map((item) =>
                    "children" in item ? (
                        <div key={item.label} className="relative group">
                            <button className={linkCls(item.children.some((c) => isActive(c.href)))} aria-haspopup="true">
                                {item.label} ▾
                            </button>
                            <div className="invisible absolute right-0 top-full pt-3 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                                <div className="w-44 rounded-xl border border-zinc-100 bg-white p-2 shadow-xl">
                                    {item.children.map((c) => (
                                        <Link key={c.href} href={c.href} className={`block rounded-lg px-3 py-2 tracking-normal hover:bg-amber-50 ${isActive(c.href) ? "text-amber-700 font-bold" : "text-zinc-600"}`}>
                                            {c.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link key={item.href} href={item.href} className={linkCls(isActive(item.href))}>
                            {item.label}
                        </Link>
                    ),
                )}
                <ProgressBadge active={isActive("/me")} />
            </nav>

            {/* Mobile: badge + menu button */}
            <div className="flex items-center gap-2 lg:hidden">
                <ProgressBadge active={isActive("/me")} />
                <button
                    className="p-2 text-zinc-600 hover:text-amber-700 focus:outline-none transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={isMenuOpen}
                >
                    {isMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    )}
                </button>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-zinc-100 shadow-xl lg:hidden flex flex-col gap-1">
                    {NAV.flatMap((item) => ("children" in item ? item.children : [item])).map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`text-sm font-medium tracking-widest py-2 transition-colors ${isActive(link.href) ? "text-amber-700 font-bold" : "text-zinc-500 hover:text-zinc-800"}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link href="/me" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium tracking-widest py-2 text-amber-700">
                        🎮 我的冒险
                    </Link>
                </div>
            )}
        </header>
    );
}

const noopSubscribe = () => () => {};

/** Streak + level pill linking to /me, with a short "+N XP" toast when XP goes up. */
function ProgressBadge({ active }: { active: boolean }) {
    const p = useProgress();
    const lv = levelOf(p.xp);
    const streak = streakOf(p.activeDays);
    // During hydration we see the empty server snapshot; only start tracking once real progress is loaded,
    // otherwise loading saved XP would show up as a fake "+N XP" gain.
    const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
    const prev = useRef<number | null>(null);
    const [toast, setToast] = useState<{ n: number; key: number } | null>(null);

    useEffect(() => {
        if (!hydrated) return;
        if (prev.current !== null && p.xp > prev.current) {
            setToast({ n: p.xp - prev.current, key: Date.now() });
            const t = setTimeout(() => setToast(null), 1800);
            prev.current = p.xp;
            return () => clearTimeout(t);
        }
        prev.current = p.xp;
    }, [p.xp, hydrated]);

    return (
        <Link
            href="/me"
            title="我的学习冒险"
            className={`relative flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-normal transition-colors ${active ? "border-amber-600 bg-amber-600 text-white" : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"}`}
        >
            <span>🔥 {streak}</span>
            <span className="opacity-40">|</span>
            <span>Lv.{lv.level}</span>
            {toast && (
                <span key={toast.key} className="xp-toast pointer-events-none absolute -bottom-7 right-0 whitespace-nowrap rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] text-amber-300">
                    +{toast.n} XP
                </span>
            )}
        </Link>
    );
}
