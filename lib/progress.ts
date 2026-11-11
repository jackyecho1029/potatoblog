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
}

export const XP = {
    read: 10,
    answer: 10,
    addAction: 5,
    learned: 15,
    completeAction: 30,
    dailyQuest: 50,
} as const;

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
    learned: {}, actions: [], questBonusDays: [], log: [],
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
