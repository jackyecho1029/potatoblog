"use client";

// Learner progress, stored only in this browser (localStorage). No account needed.
// XP is weighted toward doing (completing an action) over clicking, so the game
// rewards applying lessons rather than farming points.

import { useSyncExternalStore } from "react";
export { normalizeCategory } from "./categories";

export interface ActionItem {
    id: string; // `${postId}#${lessonIndex}`
    postId: string;
    postTitle: string;
    lessonTitle: string;
    text: string;
    category: string;
    addedAt: number;
    doneAt?: number;
}

export interface Progress {
    v: 1;
    xp: number;
    activeDays: string[]; // YYYY-MM-DD, local time
    catXp: Record<string, number>;
    read: Record<string, { at: number; title: string; category: string }>;
    answers: Record<string, { text: string; at: number }>; // key: `${postId}#${i}`
    revealed: Record<string, number>;
    learned: Record<string, number>;
    actions: ActionItem[];
    questBonusDays: string[];
    log: { at: number; xp: number; label: string }[];
    // Celebration bookkeeping: what the player has already been shown.
    seenLevel?: number;
    seenAchievements?: string[];
}

import { XP } from "./xp";
export { XP };

const LEVELS = [
    { min: 0, title: "新手" },
    { min: 50, title: "好奇者" },
    { min: 150, title: "学徒" },
    { min: 300, title: "思考者" },
    { min: 500, title: "实践者" },
    { min: 800, title: "行动派" },
    { min: 1200, title: "洞察者" },
    { min: 1700, title: "架构师" },
    { min: 2300, title: "导师" },
    { min: 3000, title: "宗师" },
];

const KEY = "potatoecho-progress-v1";
const EMPTY: Progress = {
    v: 1, xp: 0, activeDays: [], catXp: {}, read: {}, answers: {}, revealed: {},
    learned: {}, actions: [], questBonusDays: [], log: [], seenLevel: 1, seenAchievements: [],
};

export function today(d = new Date()): string {
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

let cache: Progress | null = null;
const listeners = new Set<() => void>();

function load(): Progress {
    if (cache) return cache;
    if (typeof window === "undefined") return EMPTY;
    try {
        const raw = window.localStorage.getItem(KEY);
        cache = raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
    } catch {
        cache = { ...EMPTY };
    }
    return cache!;
}

function save(next: Progress) {
    cache = next;
    try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
        /* storage full or disabled: progress stays in memory for this visit */
    }
    listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
        if (e.key === KEY) {
            cache = null;
            listeners.forEach((l) => l());
        }
    });
}

function subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
}

export function useProgress(): Progress {
    return useSyncExternalStore(subscribe, load, () => EMPTY);
}

/** Apply a mutation; award xp (optionally to a category) and run the daily quest check. */
function update(mutate: (p: Progress) => void, award = 0, label = "", category?: string) {
    const p: Progress = structuredClone(load());
    mutate(p);
    const d = today();
    if (award > 0) {
        p.xp += award;
        if (category) p.catXp[category] = (p.catXp[category] || 0) + award;
        p.log = [{ at: Date.now(), xp: award, label }, ...p.log].slice(0, 50);
        if (!p.activeDays.includes(d)) p.activeDays = [...p.activeDays, d].slice(-400);
    }
    const q = questStatus(p);
    if (q.done && !p.questBonusDays.includes(d)) {
        p.questBonusDays = [...p.questBonusDays, d].slice(-400);
        p.xp += XP.dailyQuest;
        p.log = [{ at: Date.now(), xp: XP.dailyQuest, label: "完成今日任务" }, ...p.log].slice(0, 50);
    }
    save(p);
}

const lessonKey = (postId: string, i: number) => `${postId}#${i}`;

export const actions = {
    markRead(postId: string, title: string, category: string) {
        if (load().read[postId]) return;
        update((p) => { p.read[postId] = { at: Date.now(), title, category }; }, XP.read, `读完《${title}》`, category);
    },
    saveAnswer(postId: string, i: number, text: string, category: string) {
        const k = lessonKey(postId, i);
        const first = !load().answers[k] && text.trim().length >= 10;
        update((p) => { p.answers[k] = { text, at: Date.now() }; }, first ? XP.answer : 0, "写下自己的思考", category);
    },
    reveal(postId: string, i: number) {
        const k = lessonKey(postId, i);
        if (load().revealed[k]) return;
        update((p) => { p.revealed[k] = Date.now(); });
    },
    toggleLearned(postId: string, i: number, category: string) {
        const k = lessonKey(postId, i);
        if (load().learned[k]) {
            update((p) => { delete p.learned[k]; });
        } else {
            update((p) => { p.learned[k] = Date.now(); }, XP.learned, "掌握一课", category);
        }
    },
    addAction(item: Omit<ActionItem, "addedAt" | "doneAt">) {
        if (load().actions.some((a) => a.id === item.id)) return;
        update((p) => { p.actions = [{ ...item, addedAt: Date.now() }, ...p.actions]; }, XP.addAction, "加入行动清单", item.category);
    },
    toggleAction(id: string) {
        const a = load().actions.find((x) => x.id === id);
        if (!a) return;
        if (a.doneAt) {
            update((p) => { p.actions = p.actions.map((x) => (x.id === id ? { ...x, doneAt: undefined } : x)); });
        } else {
            update(
                (p) => { p.actions = p.actions.map((x) => (x.id === id ? { ...x, doneAt: Date.now() } : x)); },
                XP.completeAction, `完成行动：${a.lessonTitle}`, a.category,
            );
        }
    },
    removeAction(id: string) {
        update((p) => { p.actions = p.actions.filter((x) => x.id !== id); });
    },
    reset() {
        save({ ...EMPTY });
    },
    markCelebrated(level: number, achievementIds: string[]) {
        const p = load();
        const seen = new Set(p.seenAchievements ?? []);
        achievementIds.forEach((id) => seen.add(id));
        save({ ...p, seenLevel: Math.max(p.seenLevel ?? 1, level), seenAchievements: [...seen] });
    },
};

export function levelOf(xp: number) {
    let i = 0;
    while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].min) i++;
    const cur = LEVELS[i];
    const next = LEVELS[i + 1];
    return {
        level: i + 1,
        title: cur.title,
        next: next?.min,
        pct: next ? Math.round(((xp - cur.min) / (next.min - cur.min)) * 100) : 100,
    };
}

export function streakOf(days: string[]): number {
    const set = new Set(days);
    const d = new Date();
    if (!set.has(today(d))) d.setDate(d.getDate() - 1); // today not started yet: count up to yesterday
    let n = 0;
    while (set.has(today(d))) {
        n++;
        d.setDate(d.getDate() - 1);
    }
    return n;
}

/** Daily quest: study one lesson (answer or reveal) + complete one action, today. */
export function questStatus(p: Progress) {
    const d = today();
    const isToday = (t: number) => today(new Date(t)) === d;
    const studied = Object.values(p.revealed).some(isToday) || Object.values(p.answers).some((a) => isToday(a.at));
    const acted = p.actions.some((a) => a.doneAt && isToday(a.doneAt));
    return { studied, acted, done: studied && acted, bonusClaimed: p.questBonusDays.includes(d) };
}

// ---------------- Achievements ----------------

export interface Achievement {
    id: string;
    title: string;
    desc: string;
    icon: "Footprints" | "Fire" | "CheckSquare" | "Lightbulb" | "Compass" | "Microphone" | "BookOpen" | "Trophy" | "Crown" | "Target" | "Sword";
    current: number;
    target: number;
    unlocked: boolean;
}

function longestStreak(days: string[]): number {
    const sorted = [...new Set(days)].sort();
    let best = 0, run = 0, prev: number | null = null;
    for (const d of sorted) {
        const t = new Date(d + "T00:00:00").getTime();
        run = prev !== null && t - prev === 86400000 ? run + 1 : 1;
        best = Math.max(best, run);
        prev = t;
    }
    return best;
}

export function achievementsOf(p: Progress): Achievement[] {
    const done = p.actions.filter((a) => a.doneAt).length;
    const answers = Object.values(p.answers).filter((a) => a.text.trim().length >= 10).length;
    const reads = Object.keys(p.read).length;
    const lenny = Object.keys(p.read).filter((id) => id.includes("lenny-")).length;
    const worlds = Object.keys(p.catXp).length;
    const learned = Object.keys(p.learned).length;
    const streak = longestStreak(p.activeDays);
    const quests = p.questBonusDays.length;
    const rows: Omit<Achievement, "unlocked">[] = [
        { id: "first-step", title: "第一步", desc: "获得第一份 XP", icon: "Footprints", current: Math.min(p.xp, 1), target: 1 },
        { id: "thinker-5", title: "先想后看", desc: "写下 5 次自己的思考", icon: "Lightbulb", current: answers, target: 5 },
        { id: "doer-1", title: "知行合一", desc: "完成第 1 个行动", icon: "CheckSquare", current: done, target: 1 },
        { id: "doer-10", title: "行动派", desc: "完成 10 个行动", icon: "Sword", current: done, target: 10 },
        { id: "streak-3", title: "三日之火", desc: "连续学习 3 天", icon: "Fire", current: streak, target: 3 },
        { id: "streak-7", title: "一周不断", desc: "连续学习 7 天", icon: "Fire", current: streak, target: 7 },
        { id: "quest-5", title: "任务猎人", desc: "完成 5 次每日任务", icon: "Target", current: quests, target: 5 },
        { id: "explorer-3", title: "跨界旅人", desc: "在 3 个世界获得 XP", icon: "Compass", current: worlds, target: 3 },
        { id: "reader-20", title: "书虫", desc: "读完 20 篇", icon: "BookOpen", current: reads, target: 20 },
        { id: "lenny-5", title: "Lenny 常客", desc: "读完 5 集 Lenny's Podcast", icon: "Microphone", current: lenny, target: 5 },
        { id: "master-25", title: "融会贯通", desc: "掌握 25 课", icon: "Trophy", current: learned, target: 25 },
        { id: "grandmaster", title: "宗师之路", desc: "达到 Lv.10", icon: "Crown", current: levelOf(p.xp).level, target: 10 },
    ];
    return rows.map((r) => ({ ...r, current: Math.min(r.current, r.target), unlocked: r.current >= r.target }));
}

// ---------------- Celebration bus ----------------
// Components fire celebrate() at the click point; a single <Celebrations/> layer renders confetti.

export type CelebrateDetail = { x: number; y: number; big?: boolean };

export function celebrate(detail: CelebrateDetail) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent<CelebrateDetail>("potatoecho:celebrate", { detail }));
}

export function celebrateFrom(el: Element | null, big = false) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    celebrate({ x: r.left + r.width / 2, y: r.top + r.height / 2, big });
}
