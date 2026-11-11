import { getSortedPostsData } from "@/lib/posts";
import { getArcadeSummary } from "@/lib/arcade";
import HomePageClient from "./HomePageClient";

export default function Home() {
  const allPostsData = getSortedPostsData();
  return <HomePageClient posts={allPostsData} arcade={getArcadeSummary()} />;
}
