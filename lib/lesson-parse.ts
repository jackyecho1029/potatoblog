// Splits a learning post's markdown into the plain parts and the two structured
// sections the summarizer emits: "## 🧭 导师带你想" (lessons) and "## 🌳 背后的道" (tao).
// Field labels vary slightly between posts (他/她, 树干 label may carry the framework
// name), so fields are matched by keyword rather than exact text.

export interface Lesson {
    title: string;
    question?: string; // markdown
    answer?: string;
    practice?: string;
    check?: string;
}

export interface TaoBranch {
    view: string;
    derive: string;
}

export interface Tao {
    root?: string;
    trunk?: string;
    trunkName?: string;
    branches: TaoBranch[];
    boundary?: string;
    motto?: string;
}

export interface InteractiveSplit {
    before: string; // markdown before the first extracted section
    after: string; // markdown after the extracted sections
    lessons: Lesson[];
    tao: Tao | null;
}

const LESSON_H2 = /^##\s*🧭/;
const TAO_H2 = /^##\s*🌳/;

type FieldKey = 'question' | 'answer' | 'practice' | 'check' | 'root' | 'trunk' | 'branches' | 'boundary' | 'motto';

const FIELD_RULES: [RegExp, FieldKey][] = [
    [/先想/, 'question'],
    [/答案/, 'answer'],
    [/学以致用/, 'practice'],
    [/学会/, 'check'],
    [/树根/, 'root'],
    [/树干/, 'trunk'],
    [/枝叶/, 'branches'],
    [/边界/, 'boundary'],
    [/心法/, 'motto'],
];

/** A line like `**他想让你先想一想：** text` → { key, label, rest }. Unknown labels return null. */
function matchField(line: string): { key: FieldKey; label: string; rest: string } | null {
    // Normal `**label：** text`, or an unclosed `**label：text` (GLM occasionally drops the closing **).
    const m = line.match(/^\*\*(.+?)\*\*\s*[:：]?\s*(.*)$/) ?? line.match(/^\*\*([^*:：]+)[:：]\s*(.*)$/);
    if (!m) return null;
    const label = m[1].replace(/[:：]\s*$/, '');
    for (const [re, key] of FIELD_RULES) {
        if (re.test(label)) return { key, label, rest: m[2] };
    }
    return null;
}

function clean(text: string): string {
    return text
        .split('\n')
        .filter((l) => !/^\s*-{3,}\s*$/.test(l))
        .join('\n')
        .trim();
}

/** Group a block of markdown into labelled fields (text before the first label is ignored). */
function collectFields(block: string): Map<FieldKey, { label: string; text: string }> {
    const fields = new Map<FieldKey, { label: string; text: string }>();
    let current: { key: FieldKey; label: string; lines: string[] } | null = null;
    const flush = () => {
        if (current && !fields.has(current.key)) {
            fields.set(current.key, { label: current.label, text: clean(current.lines.join('\n')) });
        }
    };
    for (const line of block.split('\n')) {
        const f = matchField(line.trim());
        if (f) {
            flush();
            current = { key: f.key, label: f.label, lines: f.rest ? [f.rest] : [] };
        } else if (current) {
            current.lines.push(line);
        }
    }
    flush();
    return fields;
}

function parseLessons(section: string): Lesson[] {
    const chunks = section.split(/^###\s+/m).slice(1);
    return chunks
        .map((chunk) => {
            const nl = chunk.indexOf('\n');
            const heading = (nl === -1 ? chunk : chunk.slice(0, nl)).trim();
            const title = heading.replace(/^第[一二三四五六七八九十\d]+课\s*[｜|:：]\s*/, '');
            const f = collectFields(nl === -1 ? '' : chunk.slice(nl + 1));
            return {
                title,
                question: f.get('question')?.text,
                answer: f.get('answer')?.text,
                practice: f.get('practice')?.text,
                check: f.get('check')?.text,
            };
        })
        .filter((l) => l.title && (l.question || l.answer));
}

function parseTable(md: string): TaoBranch[] {
    return md
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.startsWith('|'))
        .slice(2) // header + separator
        .map((l) => l.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()))
        .filter((cells) => cells.length >= 2 && cells[0])
        .map(([view, derive]) => ({ view, derive }));
}

function parseTao(section: string): Tao {
    const f = collectFields(section);
    const trunkField = f.get('trunk');
    let trunkName: string | undefined;
    if (trunkField) {
        const quote = /[「“"]([^」”"]{2,20})[」”"]/;
        trunkName = (trunkField.label.match(quote) ?? trunkField.text.match(quote))?.[1];
    }
    return {
        root: f.get('root')?.text,
        trunk: trunkField?.text,
        trunkName,
        branches: parseTable(f.get('branches')?.text ?? ''),
        boundary: f.get('boundary')?.text,
        motto: f.get('motto')?.text?.replace(/^\*+|\*+$/g, '').trim(),
    };
}

/** Cut the 🧭 and 🌳 sections out of the markdown and parse them. Posts without them pass through unchanged. */
export function splitInteractive(markdown: string): InteractiveSplit {
    const lines = markdown.split('\n');
    const h2 = lines.map((l, i) => (/^##\s/.test(l) ? i : -1)).filter((i) => i >= 0);
    const sectionRange = (re: RegExp): [number, number] | null => {
        const start = h2.find((i) => re.test(lines[i]));
        if (start === undefined) return null;
        const next = h2.find((i) => i > start);
        return [start, next ?? lines.length];
    };
    const lessonR = sectionRange(LESSON_H2);
    const taoR = sectionRange(TAO_H2);
    if (!lessonR && !taoR) return { before: markdown, after: '', lessons: [], tao: null };

    const ranges = [lessonR, taoR].filter(Boolean) as [number, number][];
    const first = Math.min(...ranges.map((r) => r[0]));
    const last = Math.max(...ranges.map((r) => r[1]));
    const slice = (r: [number, number] | null) => (r ? lines.slice(r[0] + 1, r[1]).join('\n') : '');

    const lessons = lessonR ? parseLessons(slice(lessonR)) : [];
    const tao = taoR ? parseTao(slice(taoR)) : null;
    return {
        before: lines.slice(0, first).join("\n").trimEnd(),
        after: lines.slice(last).join('\n'),
        lessons,
        tao,
    };
}

/** Cheap motto lookup for list pages (no markdown rendering). */
export function extractMotto(markdown: string): string | undefined {
    const m = markdown.match(/^\*\*带走一句心法[:：]?\*\*\s*[:：]?\s*(.+)$/m);
    return m?.[1]?.replace(/\*+/g, '').trim() || undefined;
}
