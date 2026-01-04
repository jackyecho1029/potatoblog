"use client";

import { useState, useMemo } from "react";

interface SearchBarProps {
    items: Array<{ title: string; tags?: string[]; author?: string; id: string; date: string }>;
    onFilteredItems: (filtered: typeof items) => void;
    placeholder?: string;
}

export default function SearchBar({ items, onFilteredItems, placeholder = "搜索..." }: SearchBarProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Get all unique tags
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        items.forEach(item => {
            item.tags?.forEach(tag => tags.add(tag));
            if (item.author) tags.add(item.author);
        });
        return Array.from(tags);
    }, [items]);

    // Filter items based on search term and selected tag
    useMemo(() => {
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
            filtered = filtered.filter(item =>
                item.tags?.includes(selectedTag) || item.author === selectedTag
            );
        }

        onFilteredItems(filtered);
    }, [searchTerm, selectedTag, items, onFilteredItems]);

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

            {/* Tag Filters */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedTag(null)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedTag === null
                            ? "bg-amber-600 text-white"
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
                                ? "bg-amber-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    );
}
