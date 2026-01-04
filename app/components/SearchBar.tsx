"use client";

import { useState, useMemo, useEffect } from "react";

interface SearchableItem {
    title: string;
    tags?: string[];
    author?: string;
    id: string;
    date: string;
}

interface SearchBarProps<T extends SearchableItem> {
    items: T[];
    onFilteredItems: (filtered: T[]) => void;
    placeholder?: string;
    showAuthorFilter?: boolean;
}

export default function SearchBar<T extends SearchableItem>({
    items,
    onFilteredItems,
    placeholder = "搜索...",
    showAuthorFilter = false
}: SearchBarProps<T>) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);

    // Get all unique tags (excluding authors)
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        items.forEach(item => {
            item.tags?.forEach(tag => {
                if (tag !== item.author) tags.add(tag);
            });
        });
        return Array.from(tags);
    }, [items]);

    // Get all unique authors
    const allAuthors = useMemo(() => {
        const authors = new Set<string>();
        items.forEach(item => {
            if (item.author) authors.add(item.author);
        });
        return Array.from(authors);
    }, [items]);

    // Filter items based on search term, selected tag, and selected author
    useEffect(() => {
        let filtered = items;

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(lowerSearch) ||
                item.tags?.some(tag => tag.toLowerCase().includes(lowerSearch)) ||
                item.author?.toLowerCase().includes(lowerSearch)
            );
        }

        if (selectedTag) {
            filtered = filtered.filter(item => item.tags?.includes(selectedTag));
        }

        if (selectedAuthor) {
            filtered = filtered.filter(item => item.author === selectedAuthor);
        }

        onFilteredItems(filtered);
    }, [searchTerm, selectedTag, selectedAuthor, items, onFilteredItems]);

    return (
        <div className="mb-8 space-y-4">
            {/* Search Input */}
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white shadow-sm"
                />
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Author Filter (for Learning Hub) */}
            {showAuthorFilter && allAuthors.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-500 mr-2">按作者：</span>
                    <button
                        onClick={() => setSelectedAuthor(null)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedAuthor === null
                                ? "bg-amber-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        全部
                    </button>
                    {allAuthors.map((author) => (
                        <button
                            key={author}
                            onClick={() => setSelectedAuthor(selectedAuthor === author ? null : author)}
                            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedAuthor === author
                                    ? "bg-amber-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {author}
                        </button>
                    ))}
                </div>
            )}

            {/* Tag Filters */}
            {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-500 mr-2">按分类：</span>
                    <button
                        onClick={() => setSelectedTag(null)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedTag === null
                                ? "bg-zinc-700 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        全部
                    </button>
                    {allTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedTag === tag
                                    ? "bg-zinc-700 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
