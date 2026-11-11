"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CaretDown, Fire, GameController, List, Microphone, X } from "@phosphor-icons/react";
import { levelOf, streakOf, useProgress } from "../../lib/progress";

type NavLink = { href: string; label: string };

const NAV: (NavLink | { label: string; children: NavLink[] })[] = [
    { href: "/", label: "大厅" },
    { href: "/learning", label: "选关" },
    { href: "/lenny", label: "Lenny" },
    {
        label: "洞察",
        children: [
            { href: "/xhs-viral", label: "小红书爆款" },
            { href: "/writing-analysis", label: "写作拆解" },
            { href: "/x-signals", label: "X 信号" },
        ],
    },
    { href: "/about", label: "关于" },
];

const noopSubscribe = () => () => {};

export default function Header() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

    const linkCls = (active: boolean) =>
        `relative rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${active ? "bg-ink text-white" : "text-ink-soft hover:bg-white hover:text-ink"}`;

    return (
        <header className="relative z-50 mb-12 md:mb-16">
            <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-ink bg-white/90 px-3 py-2 shadow-[4px_4px_0_#1C1B1F] backdrop-blur">
                <Link href="/" className="group flex items-center gap-3 pl-1">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-ink bg-arcade text-lg font-black text-white shadow-[0_3px_0_#1C1B1F] transition-transform group-hover:-rotate-6 group-active:translate-y-[2px]">
                        P
                    </span>
                    <span className="hidden sm:block">
                        <span className="block text-base font-black leading-none tracking-tight text-ink">PotatoEcho</span>
                        <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">learning arcade</span>
                    </span>
                </Link>

                <nav className="hidden items-center gap-1 lg:flex">
                    {NAV.map((item) =>
                        "children" in item ? (
                            <div key={item.label} className="group relative">
                                <button className={`${linkCls(item.children.some((c) => isActive(c.href)))} inline-flex items-center gap-1`} aria-haspopup="true">
                                    {item.label} <CaretDown size={12} weight="bold" />
                                </button>
                                <div className="invisible absolute left-0 top-full pt-3 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                                    <div className="w-44 arcade-card p-1.5">
                                        {item.children.map((c) => (
                                            <Link key={c.href} href={c.href} className={`block rounded-lg px-3 py-2 text-sm font-semibold ${isActive(c.href) ? "bg-arcade-soft text-arcade-deep" : "text-ink-soft hover:bg-paper"}`}>
                                                {c.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link key={item.href} href={item.href} className={`${linkCls(isActive(item.href))} inline-flex items-center gap-1.5`}>
                                {item.href === "/lenny" && <Microphone size={14} weight="bold" />}
                                {item.label}
                            </Link>
                        ),
                    )}
                </nav>

                <div className="flex items-center gap-2">
                    <PlayerChip active={isActive("/me")} />
                    <button
                        className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-ink bg-white text-ink active:translate-y-[2px] lg:hidden"
                        onClick={() => setIsMenuOpen((v) => !v)}
                        aria-label="打开菜单"
                        aria-expanded={isMenuOpen}
                    >
                        {isMenuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                        className="absolute left-0 right-0 top-full mt-3 grid grid-cols-2 gap-2 arcade-card p-3 lg:hidden"
                    >
                        {NAV.flatMap((item) => ("children" in item ? item.children : [item])).map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`rounded-xl border-2 px-3 py-3 text-sm font-bold ${isActive(link.href) ? "border-ink bg-ink text-white" : "border-transparent bg-paper text-ink"}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link href="/me" onClick={() => setIsMenuOpen(false)} className="col-span-2 btn-arcade">
                            <GameController size={18} weight="fill" /> 我的冒险
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

/** Level ring + XP + streak, linking to /me. Shows "+N XP" when XP rises (not on first load). */
function PlayerChip({ active }: { active: boolean }) {
    const p = useProgress();
    const lv = levelOf(p.xp);
    const streak = streakOf(p.activeDays);
    const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
    const prev = useRef<number | null>(null);
    const [gain, setGain] = useState<{ n: number; key: number } | null>(null);

    useEffect(() => {
        if (!hydrated) return;
        if (prev.current !== null && p.xp > prev.current) {
            setGain({ n: p.xp - prev.current, key: Date.now() });
            const t = setTimeout(() => setGain(null), 1800);
            prev.current = p.xp;
            return () => clearTimeout(t);
        }
        prev.current = p.xp;
    }, [p.xp, hydrated]);

    const R = 15;
    const C = 2 * Math.PI * R;

    return (
        <Link
            href="/me"
            title="我的冒险"
            className={`relative flex items-center gap-2 rounded-xl border-2 border-ink py-1 pl-1 pr-3 transition-transform active:translate-y-[2px] ${active ? "bg-arcade text-white" : "bg-paper text-ink hover:bg-white"}`}
        >
            <span className="relative flex h-9 w-9 items-center justify-center">
                <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
                    <circle cx="18" cy="18" r={R} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="4" />
                    <motion.circle
                        cx="18" cy="18" r={R} fill="none" stroke={active ? "#fff" : "#E8622C"} strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={C}
                        initial={false}
                        animate={{ strokeDashoffset: C * (1 - lv.pct / 100) }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    />
                </svg>
                <span className="font-mono text-xs font-black">{lv.level}</span>
            </span>
            <span className="hidden flex-col leading-none sm:flex">
                <span className="text-xs font-black">{lv.title}</span>
                <span className="mt-0.5 font-mono text-[10px] opacity-70">{p.xp} XP</span>
            </span>
            <span className={`flex items-center gap-0.5 font-mono text-sm font-black ${streak > 0 ? (active ? "text-white" : "text-arcade") : "opacity-40"}`}>
                <Fire size={16} weight="fill" className={streak > 0 ? "animate-flicker" : ""} />
                {streak}
            </span>
            <AnimatePresence>
                {gain && (
                    <motion.span
                        key={gain.key}
                        initial={{ y: 0, opacity: 0, scale: 0.6 }}
                        animate={{ y: 30, opacity: 1, scale: 1 }}
                        exit={{ y: 44, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 16 }}
                        className="xp-gain pointer-events-none absolute right-0 top-full whitespace-nowrap rounded-full border-2 border-ink bg-[#F5C04A] px-2 py-0.5 font-mono text-xs font-black text-ink"
                    >
                        +{gain.n} XP
                    </motion.span>
                )}
            </AnimatePresence>
        </Link>
    );
}
