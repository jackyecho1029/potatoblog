import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Header from '../components/Header';

export const metadata = {
    title: '文案分析实验室 | PotatoEcho',
    description: 'AI 驱动的微信公众号写作风格深度拆解。',
};

export default function WritingAnalysis() {
    const reportsDir = path.join(process.cwd(), 'public', 'reports');
    let reports: string[] = [];

    try {
        if (fs.existsSync(reportsDir)) {
            reports = fs.readdirSync(reportsDir).filter(f =>
                f.endsWith('.html') &&
                f !== 'index.html' &&
                !f.includes('公众号')
            );
        }
    } catch (e) {
        console.error("Error reading reports:", e);
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-800 font-sans selection:bg-amber-200">
            <main className="max-w-5xl mx-auto px-6 py-20">
                <Header />

                <section className="mb-16 text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-4">
                        AI Lab
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-zinc-900 leading-tight">
                        文案风格<span className="text-amber-700">深度拆解</span>
                    </h1>
                    <p className="text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
                        基于 Gemini 2.0 模型，对数十位顶级微信公众号作者进行的全量风格分析。
                        <br />
                        揭秘他们的<span className="font-bold text-zinc-800">用户画像、写作套路与金句逻辑</span>。
                    </p>
                </section>

                {reports.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reports.map(file => {
                            const name = file.replace(/_/g, ' ').replace('.html', '');
                            // Use encodeURIComponent to handle Chinese characters in URLs
                            const href = `/reports/${encodeURIComponent(file)}`;

                            return (
                                <a href={href} key={file} target="_blank" className="block group">
                                    <div className="h-full bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-xl hover:border-amber-100 transition-all duration-300 hover:-translate-y-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-xl group-hover:scale-110 group-hover:bg-amber-100 transition">
                                                ✍️
                                            </div>
                                            <span className="text-xs font-medium text-zinc-300 group-hover:text-amber-500 transition">HTML 报告</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-zinc-800 mb-2 group-hover:text-amber-700 truncate">{name}</h3>
                                        <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
                                            点击查看该作者的完整写作风格分析、框架拆解与用户画像。
                                        </p>
                                        <div className="flex items-center text-sm font-bold text-amber-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                            阅读报告 <span className="ml-1">&rarr;</span>
                                        </div>
                                    </div>
                                </a>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-200">
                        <p className="text-zinc-400">正在生成分析报告，请稍候...</p>
                    </div>
                )}
            </main>
        </div>
    )
}
