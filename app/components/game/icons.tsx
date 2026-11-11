"use client";

import {
    BookOpen, Brain, CheckSquare, Coins, Compass, Crown, Fire, Flask, Footprints, Heartbeat, Lightbulb, Lightning,
    Microphone, PaintBrush, PenNib, Robot, Storefront, Sword, Target, Trophy, UsersThree,
    type IconProps,
} from "@phosphor-icons/react";

const MAP = {
    BookOpen, Brain, CheckSquare, Coins, Compass, Crown, Fire, Flask, Footprints, Heartbeat, Lightbulb, Lightning,
    Microphone, PaintBrush, PenNib, Robot, Storefront, Sword, Target, Trophy, UsersThree,
};

/** Resolve a Phosphor icon by name (names come from lib/categories WORLDS and lib/progress achievements). */
export function AchievementIcon({ name, ...props }: { name: string } & IconProps) {
    const Icon = MAP[name as keyof typeof MAP] ?? Trophy;
    return <Icon {...props} />;
}

export const WorldIcon = AchievementIcon;
