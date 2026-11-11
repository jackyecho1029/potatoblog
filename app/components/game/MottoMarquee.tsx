import Link from "next/link";

/** Endless band of "带走一句心法" lines. Pure CSS (transform) so it costs nothing on the main thread. */
export default function MottoMarquee({ mottos }: { mottos: { id: string; motto: string; author: string }[] }) {
    if (!mottos.length) return null;
    const row = [...mottos, ...mottos]; // duplicated for a seamless -50% loop
    return (
        <div className="relative -mx-4 overflow-hidden border-y-2 border-ink bg-ink py-4 md:-mx-8">
            <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
                {row.map((m, i) => (
                    <Link key={i} href={`/learning/${m.id}`} className="group flex items-center gap-3 text-white/90 hover:text-white" tabIndex={i >= mottos.length ? -1 : 0}>
                        <span className="h-2.5 w-2.5 rotate-45 bg-arcade" aria-hidden />
                        <span className="text-lg font-bold">{m.motto}</span>
                        <span className="font-mono text-xs text-white/40 group-hover:text-arcade">{m.author}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
