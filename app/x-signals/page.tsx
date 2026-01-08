
import { getSortedXSignalPostsData } from "../../lib/x-signals";
import XSignalsClient from "./XSignalsClient";

export default function XSignalsPage() {
    const posts = getSortedXSignalPostsData();
    return <XSignalsClient posts={posts} />;
}
