import { getSortedLearningPostsData } from "../../lib/learning";
import LearningPageClient from "./LearningPageClient";

export default function LearningPage() {
    const allPosts = getSortedLearningPostsData();
    // Filter out Lenny Podcast posts - they are shown on /lenny page
    const posts = allPosts.filter(post => post.author !== "Lenny's Podcast");
    return <LearningPageClient posts={posts} />;
}
