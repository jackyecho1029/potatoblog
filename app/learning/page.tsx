import { getSortedLearningPostsData } from "../../lib/learning";
import LearningPageClient from "./LearningPageClient";

export default function LearningPage() {
    const posts = getSortedLearningPostsData();
    return <LearningPageClient posts={posts} />;
}
