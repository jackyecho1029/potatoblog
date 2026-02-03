
import { getSortedXSignalPostsData } from "../../lib/x-signals";
import XSignalsClient from "./XSignalsClient";

// Revalidate every 60 seconds to pick up new posts
export const revalidate = 60;

export default function XSignalsPage() {
    const posts = getSortedXSignalPostsData();
    return <XSignalsClient posts={posts} />;
}
