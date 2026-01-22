import { getAllLennyPosts, getLennyCategories } from "../../lib/lenny-posts";
import LennyIndexClient from "./LennyIndexClient";

export default function LennyPage() {
    const posts = getAllLennyPosts();
    const categories = getLennyCategories();

    return <LennyIndexClient posts={posts} categories={categories} />;
}
