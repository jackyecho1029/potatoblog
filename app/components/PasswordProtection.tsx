"use client";

import { useState, useEffect } from "react";

interface PasswordProtectionProps {
    postId: string;
    correctPassword: string;
    children: React.ReactNode;
}

export default function PasswordProtection({
    postId,
    correctPassword,
    children,
}: PasswordProtectionProps) {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    // Check localStorage on mount
    useEffect(() => {
        const storedUnlock = localStorage.getItem(`unlock-${postId}`);
        if (storedUnlock === "true") {
            setIsUnlocked(true);
        }
    }, [postId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === correctPassword) {
            setIsUnlocked(true);
            localStorage.setItem(`unlock-${postId}`, "true");
            setError(false);
        } else {
            setError(true);
        }
    };

    if (isUnlocked) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-paper-grid flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-6">
                    <span className="text-4xl mb-4 block">🔒</span>
                    <h1 className="text-xl font-bold text-zinc-800 mb-2">
                        私密内容
                    </h1>
                    <p className="text-gray-500 text-sm">
                        这篇文章需要密码才能查看
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="请输入密码"
                        className={`w-full px-4 py-3 rounded-lg border ${error
                                ? "border-red-300 bg-red-50"
                                : "border-gray-200"
                            } focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all`}
                        autoFocus
                    />
                    {error && (
                        <p className="text-red-500 text-sm text-center">
                            密码错误，请重试
                        </p>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 rounded-lg transition-colors"
                    >
                        解锁
                    </button>
                </form>
            </div>
        </div>
    );
}
