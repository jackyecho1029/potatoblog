import { getSortedLearningPostsData, type LearningPostData } from './learning';
import { WORLDS, normalizeCategory, type World } from './categories';
import { getAllLennyPosts } from './lenny-posts';

/** Slim card shape sent to client components (keeps the RSC payload small). */
export interface LevelCard {
    id: string;
    title: string;
    author: string;
    date: string;
    world: string; // normalized category
    thumbnail?: string;
    motto?: string;
    lessonCount: number;
    isLenny: boolean;
}

export interface WorldSummary extends World {
    total: number;
}

function decode(text: string): string {
    return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'");
}

function youtubeThumb(url?: string): string | undefined {
    const id = url?.match(/(?:v=|youtu\.be\/)([\w-]{11})/)?.[1];
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : undefined;
}

export function toCard(p: LearningPostData): LevelCard {
    const isLenny = p.id.includes('lenny-');
    return {
        id: p.id,
        title: decode(p.title || p.original_title || ''),
        author: isLenny ? "Lenny's Podcast" : (p.author || ''),
        date: p.date,
        world: normalizeCategory(p.category),
        thumbnail: p.thumbnail || youtubeThumb(p.source_url),
        motto: p.motto,
        lessonCount: p.lessonCount || 0,
        isLenny,
    };
}

export function getAllLevelCards(): LevelCard[] {
    // Lenny files have generic Chinese titles ("Lenny's Podcast 笔记：X 深度访谈"); show guest + topic and their quote instead.
    const lenny = new Map(getAllLennyPosts().map((l) => [l.id, l]));
    return getSortedLearningPostsData()
        .filter((p) => !p.private && p.category !== 'X Signal')
        .map((p) => {
            const card = toCard(p);
            const l = lenny.get(p.id);
            if (!card.isLenny || !l) return card;
            const topic = decode(p.original_title || '').split('|')[0].trim();
            const guestInTopic = topic.toLowerCase().startsWith(l.guest.toLowerCase());
            return {
                ...card,
                title: topic && !guestInTopic ? `${l.guest}：${topic}` : (topic || l.guest),
                motto: card.motto ?? (l.quote ? l.quote.replace(/^["“「]|["”」]$/g, '') : undefined),
            };
        });
}

export function getArcadeSummary() {
    const cards = getAllLevelCards();
    const counts = new Map<string, number>();
    cards.forEach((c) => counts.set(c.world, (counts.get(c.world) || 0) + 1));
    const worlds: WorldSummary[] = WORLDS.map((w) => ({ ...w, total: counts.get(w.category) || 0 }))
        .filter((w) => w.total > 0)
        .sort((a, b) => b.total - a.total);
    const withLessons = cards.filter((c) => c.lessonCount > 0);
    return {
        totals: {
            levels: cards.length,
            mentorLevels: withLessons.length,
            mentors: new Set(cards.map((c) => c.author).filter(Boolean)).size,
        },
        worlds,
        featured: withLessons.slice(0, 14),
        mottos: withLessons.filter((c) => c.motto).slice(0, 24).map((c) => ({ id: c.id, motto: c.motto!, author: c.author })),
    };
}
