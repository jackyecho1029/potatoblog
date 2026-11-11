"use client";

import { AnimatePresence, motion } from "framer-motion";
import { memo, useEffect, useState, useSyncExternalStore } from "react";
import { Crown, Trophy, X } from "@phosphor-icons/react";
import { achievementsOf, actions, celebrate, levelOf, useProgress, type CelebrateDetail } from "../../../lib/progress";
import { AchievementIcon } from "./icons";

const COLORS = ["#E8622C", "#1C1B1F", "#2F9E6A", "#F5C04A", "#FFFFFF"];

interface Burst extends CelebrateDetail { id: number }

const noopSubscribe = () => () => {};

/** One global layer: confetti bursts, level-up modal, achievement toasts. Mounted once in the root layout. */
export default function Celebrations() {
    const [bursts, setBursts] = useState<Burst[]>([]);
    const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
    const p = useProgress();

    useEffect(() => {
        const onCelebrate = (e: Event) => {
            const d = (e as CustomEvent<CelebrateDetail>).detail;
            const id = Date.now() + Math.random();
            setBursts((b) => [...b, { ...d, id }]);
            setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1600);
        };
        window.addEventListener("potatoecho:celebrate", onCelebrate);
        return () => window.removeEventListener("potatoecho:celebrate", onCelebrate);
    }, []);

    const level = levelOf(p.xp);
    const leveledUp = hydrated && level.level > (p.seenLevel ?? 1);
    const fresh = hydrated ? achievementsOf(p).filter((a) => a.unlocked && !(p.seenAchievements ?? []).includes(a.id)) : [];

    // Achievements toast: show newest unlock, then mark all fresh ones as seen after a moment.
    const [toast, setToast] = useState<{ title: string; desc: string; icon: string } | null>(null);
    const freshKey = fresh.map((a) => a.id).join(",");
    useEffect(() => {
        if (!freshKey || leveledUp) return;
        const first = achievementsOf(p).find((a) => a.id === freshKey.split(",")[0]);
        if (first) setToast({ title: first.title, desc: first.desc, icon: first.icon });
        celebrate({ x: window.innerWidth - 160, y: window.innerHeight - 120 });
        const t = setTimeout(() => { actions.markCelebrated(level.level, freshKey.split(",")); setToast(null); }, 3200);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [freshKey, leveledUp]);

    useEffect(() => {
        if (leveledUp) celebrate({ x: window.innerWidth / 2, y: window.innerHeight / 2.4, big: true });
    }, [leveledUp]);

    return (
        <>
            <div className="pointer-events-none fixed inset-0 z-[100]" aria-hidden>
                {bursts.map((b) => <ConfettiBurst key={b.id} x={b.x} y={b.y} big={b.big} />)}
            </div>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        key={toast.title}
                        initial={{ y: 80, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 40, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 18 }}
                        className="fixed bottom-6 right-6 z-[90] flex max-w-xs items-center gap-3 arcade-card px-4 py-3"
                        role="status"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-[#F5C04A]">
                            <AchievementIcon name={toast.icon} size={22} weight="fill" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-arcade">成就解锁</p>
                            <p className="font-bold text-ink leading-tight">{toast.title}</p>
                            <p className="text-xs text-zinc-500">{toast.desc}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {leveledUp && (
                    <motion.div
                        className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/60 px-6 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => actions.markCelebrated(level.level, [])}
                    >
                        <motion.div
                            initial={{ scale: 0.6, rotate: -6, y: 40 }}
                            animate={{ scale: 1, rotate: 0, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 220, damping: 14 }}
                            className="relative w-full max-w-sm arcade-card p-8 text-center"
                            onClick={(e) => e.stopPropagation()}
                            role="dialog"
                            aria-label="升级了"
                        >
                            <button onClick={() => actions.markCelebrated(level.level, [])} className="absolute right-4 top-4 text-zinc-400 hover:text-ink" aria-label="关闭">
                                <X size={20} weight="bold" />
                            </button>
                            <motion.div
                                className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-ink bg-arcade text-white shadow-[0_6px_0_#1C1B1F]"
                                animate={{ rotate: [0, -8, 8, -4, 0] }}
                                transition={{ duration: 0.9, delay: 0.25 }}
                            >
                                <Crown size={48} weight="fill" />
                            </motion.div>
                            <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-arcade">Level Up</p>
                            <p className="mt-1 font-mono text-5xl font-black text-ink">Lv.{level.level}</p>
                            <p className="mt-2 text-xl font-bold text-ink">你现在是「{level.title}」</p>
                            <p className="mt-2 text-sm text-zinc-500">
                                {level.next ? `再拿 ${level.next - p.xp} XP 到下一级。` : "你已经到顶了。"}
                            </p>
                            <button onClick={() => actions.markCelebrated(level.level, [])} className="btn-arcade mt-6 w-full">
                                <Trophy size={18} weight="fill" /> 继续冒险
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

const ConfettiBurst = memo(function ConfettiBurst({ x, y, big }: { x: number; y: number; big?: boolean }) {
    const [pieces] = useState(() =>
        Array.from({ length: big ? 70 : 28 }, (_, i) => {
            const angle = Math.random() * Math.PI * 2;
            const dist = (big ? 260 : 130) * (0.45 + Math.random() * 0.75);
            return {
                i,
                dx: Math.cos(angle) * dist,
                dy: Math.sin(angle) * dist - (big ? 80 : 50),
                rot: Math.random() * 720 - 360,
                w: 6 + Math.random() * 6,
                h: 4 + Math.random() * 8,
                color: COLORS[i % COLORS.length],
                round: Math.random() > 0.7,
            };
        }),
    );
    return (
        <>
            {pieces.map((pc) => (
                <motion.span
                    key={pc.i}
                    className="absolute block border border-ink/70"
                    style={{ left: x, top: y, width: pc.w, height: pc.h, background: pc.color, borderRadius: pc.round ? 999 : 2 }}
                    initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
                    animate={{ x: pc.dx, y: [0, pc.dy, pc.dy + 160], opacity: [1, 1, 0], rotate: pc.rot, scale: 1 }}
                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], times: [0, 0.55, 1] }}
                />
            ))}
        </>
    );
});
