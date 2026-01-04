import Link from "next/link";
import { getSortedLearningPostsData } from "../../lib/learning";
import Header from "../components/Header";

export default function LearningPage() {
    const posts = getSortedLearningPostsData();

    return (
        <div className="flex flex-col gap-2">
            <time className="text-sm text-gray-400 font-mono">{post.date}</time>
            <h2 className="text-xl font-semibold group-hover:text-amber-600 transition-colors">
                {post.title}
            </h2>
            {post.tags && (
                <div className="flex gap-2 mt-2">
                    {post.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-500">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
                        </Link >
                    </article >
                ))
}

{
    posts.length === 0 && (
        <div className="p-8 text-center text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-lg">
            No learning notes yet. The automated agent is sleeping. 💤
        </div>
    )
}
      </div >
      </main >
    </div >
  );
}
