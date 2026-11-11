"use client";

import Link from "next/link";
import Image from "next/image";
import { Microphone, Play, SealCheck, Compass } from "@phosphor-icons/react";
import type { LevelCard } from "../../../lib/arcade";
import { worldOf } from "../../../lib/categories";
import { useProgress } from "../../../lib/progress";
import { WorldIcon } from "./icons";

/** A level card: thumbnail, world sticker, title, motto, and a "cleared" stamp once read. */
export default function LevelTile({ card, index = 0, compact = false, hero = false }: { card: LevelCard; index?: number; compact?: boolean; hero?: boolean }) {
    const p = useProgress();
    const cleared = !!p.read[card.id];
    const mastered = card.lessonCount
        ? Array.from({ length: card.lessonCount }).filter((_, i) => p.learned[`${card.id}#${i}`]).length
        : 0;
    const world = worldOf(card.world);

    return (
        <Link
            href={`/learning/${card.id}`}
            className="rise-in group relative flex h-full flex-col overflow-hidden arcade-card arcade-card-hover"
            style={{ ["--i" as string]: index % 12 }}
        >
            <div className={`relative ${hero ? "aspect-video lg:aspect-auto lg:flex-1 lg:min-h-[260px]" : compact ? "aspect-[16/8]" : "aspect-video"} overflow-hidden border-b-2 border-ink bg-paper-deep`}>
                {card.thumbnail ? (
                    <Image src={card.thumbnail} alt="" fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="flex h-full items-center justify-center text-ink/30"><WorldIcon name={world.icon} size={48} /></div>
                )}
                <span className="chip-arcade absolute left-3 top-3 bg-white">
                    <WorldIcon name={world.icon} size={13} weight="bold" /> {world.name}
                </span>
                {cleared && (
                    <span className="absolute right-3 top-3 flex -rotate-6 items-center gap-1 rounded-md border-2 border-ink bg-win px-2 py-0.5 text-xs font-black text-white shadow-[2px_2px_0_#1C1B1F]">
                        <SealCheck size={14} weight="fill" /> 已通关
                    </span>
                )}
                <span className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full border-2 border-ink bg-arcade text-white opacity-0 shadow-[0_3px_0_#1C1B1F] transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <Play size={16} weight="fill" />
                </span>
            </div>
            <div className={`flex flex-col p-4 ${hero ? "" : "flex-1"}`}>
                <h3 className={`line-clamp-2 font-bold leading-snug text-ink transition-colors group-hover:text-arcade-deep ${hero ? "text-xl md:text-2xl" : ""}`}>{card.title}</h3>
                {card.motto && !compact && (
                    <p className="mt-2 line-clamp-2 border-l-[3px] border-arcade pl-2.5 text-sm text-zinc-600">{card.motto}</p>
                )}
                <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-xs text-zinc-500">
                    <span className="flex min-w-0 items-center gap-1 truncate">
                        {card.isLenny && <Microphone size={12} weight="bold" />}
                        <span className="truncate">{card.author}</span>
                    </span>
                    {card.lessonCount > 0 && (
                        <span className="flex shrink-0 items-center gap-1 font-mono font-bold text-ink">
                            <Compass size={13} weight="bold" className="text-arcade" />
                            {mastered}/{card.lessonCount}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
