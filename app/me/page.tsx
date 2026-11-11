import type { Metadata } from "next";
import MeClient from "./MeClient";

export const metadata: Metadata = {
    title: "我的学习冒险 · PotatoEcho",
    description: "你的等级、连续学习天数、技能树和行动清单。",
};

export default function MePage() {
    return <MeClient />;
}
