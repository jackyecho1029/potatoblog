"use client";

import { useState, useMemo, useEffect } from "react";

interface SearchableItem {
    title: string;
    tags?: string[];
    author?: string;
    category?: string;
    id: string;
    date: string;
}

interface SearchBarProps<T extends SearchableItem> {
    items: T[];
    onFilteredItems: (filtered: T[]) => void;
    placeholder?: string;
    showAuthorFilter?: boolean;
    showCategoryFilter?: boolean;
}

export default function SearchBar<T extends SearchableItem>({
    items,
    onFilteredItems,
    placeholder = "搜索...",
    showAuthorFilter = false,
    showCategoryFilter = false
}: SearchBarProps<T>) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Get all unique tags (excluding authors), sorted by count and limited to top 10
    const allTags = useMemo(() => {
        const tagCounts = new Map<string, number>();
        items.forEach(item => {
            item.tags?.forEach(tag => {
                if (tag !== item.author) {
                    tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
                }
            });
        });
        // Sort by count descending and limit to top 10
        return Array.from(tagCounts.keys())
            .sort((a, b) => (tagCounts.get(b) || 0) - (tagCounts.get(a) || 0))
            .slice(0, 10);
    }, [items]);


    // Get all unique authors with counts, sorted by count descending
    const { allAuthors, authorCounts } = useMemo(() => {
        const counts = new Map<string, number>();
        items.forEach(item => {
            if (item.author) {
                counts.set(item.author, (counts.get(item.author) || 0) + 1);
            }
        });
        // Sort by count descending and limit to top 12
        const sortedAuthors = Array.from(counts.keys())
            .sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0))
            .slice(0, 12);
        return { allAuthors: sortedAuthors, authorCounts: counts };
    }, [items]);


    // Get tag counts
    const tagCounts = useMemo(() => {
        const counts = new Map<string, number>();
        items.forEach(item => {
            item.tags?.forEach(tag => {
                if (tag !== item.author) {
                    counts.set(tag, (counts.get(tag) || 0) + 1);
                }
            });
        });
        return counts;
    }, [items]);

    // Get all unique categories with counts
    const { allCategories, categoryCounts } = useMemo(() => {
        const counts = new Map<string, number>();
        items.forEach(item => {
            if (item.category) {
                counts.set(item.category, (counts.get(item.category) || 0) + 1);
            }
        });
        const sortedCategories = Array.from(counts.keys())
            .sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0));
        return { allCategories: sortedCategories, categoryCounts: counts };
    }, [items]);

    // Filter items based on search term, selected tag, selected author, and selected category
    useEffect(() => {
        let filtered = items;

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(lowerSearch) ||
                item.tags?.some(tag => tag.toLowerCase().includes(lowerSearch)) ||
                item.author?.toLowerCase().includes(lowerSearch) ||
                item.category?.toLowerCase().includes(lowerSearch)
            );
        }

        if (selectedTag) {
            filtered = filtered.filter(item => item.tags?.includes(selectedTag));
        }

        if (selectedAuthor) {
            filtered = filtered.filter(item => item.author === selectedAuthor);
        }

        if (selectedCategory) {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        onFilteredItems(filtered);
    }, [searchTerm, selectedTag, selectedAuthor, selectedCategory, items, onFilteredItems]);

    return (
        <div className="mb-8 space-y-6">
            {/* Search Input */}
            <div className="relative group">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-6 py-4 pl-14 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500/20 bg-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] transition-all duration-300 placeholder:text-zinc-300 font-light"
                />
                <svg
                    className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-amber-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Author Filter (for Learning Hub) */}
            {showAuthorFilter && allAuthors.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-500 mr-2">按频道：</span>
                    <button
                        onClick={() => setSelectedAuthor(null)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedAuthor === null
                            ? "bg-amber-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        全部 {items.length}
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
                            {author} <span className="ml-1 text-xs opacity-75">{authorCounts.get(author)}</span>
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
                        全部 {items.length}
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
                            {tag} <span className="ml-1 text-xs opacity-75">{tagCounts.get(tag)}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Category Filters (for X Signals) */}
            {showCategoryFilter && allCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-500 mr-2">按主题：</span>
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedCategory === null
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        全部 {items.length}
                    </button>
                    {allCategories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedCategory === category
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {category} <span className="ml-1 text-xs opacity-75">{categoryCounts.get(category)}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
