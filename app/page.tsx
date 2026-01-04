import { getSortedPostsData } from "@/lib/posts";
import HomePageClient from "./HomePageClient";

export default function Home() {
  const allPostsData = getSortedPostsData();
  return <HomePageClient posts={allPostsData} />;
}
