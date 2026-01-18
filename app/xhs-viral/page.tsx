
import { getSortedXhsViralPostsData } from "../../lib/xhs-viral";
import XhsViralClient from "./XhsViralClient";

export default function XhsViralPage() {
    const posts = getSortedXhsViralPostsData();
    return <XhsViralClient posts={posts} />;
}
