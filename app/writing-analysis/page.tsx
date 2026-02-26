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
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-900 font-sans selection:bg-amber-100 selection:text-amber-900 border-t-8 border-amber-600">
            <main className="max-w-6xl mx-auto px-8 py-24">
                <div className="animate-fade-in-up stagger-1">
                    <Header />
                </div>

                <section className="mb-32 animate-fade-in-up stagger-2">
                    <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-[11px] font-extrabold uppercase tracking-[0.25em] rounded-md border border-amber-100 mb-8">
                        AI WRITING LAB
                    </span>
                    <h1 className="text-6xl md:text-8xl font-serif leading-[1] mb-10 tracking-tighter text-zinc-900">
                        文案风格<span className="text-amber-600 italic">深度拆解.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-500 leading-relaxed max-w-2xl font-light">
                        基于深度模型，对数十位顶级微信公众号作者进行的全量风格分析。揭秘他们的用户画像、写作套路与金句逻辑。
                    </p>
                </section>

                {reports.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up stagger-3">
                        {reports.map((file, index) => {
                            const name = file.replace(/_/g, ' ').replace('.html', '');
                            const href = `/reports/${encodeURIComponent(file)}`;

                            return (
                                <a href={href} key={file} target="_blank" className={`bento-card group flex flex-col justify-between stagger-${(index % 5) + 1}`}>
                                    <div>
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-amber-100 group-hover:scale-110 transition-all duration-300">
                                                ✍️
                                            </div>
                                            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-300 font-bold group-hover:text-amber-600 transition-colors">REPORT</span>
                                        </div>

                                        <h3 className="text-2xl md:text-3xl font-serif font-medium text-zinc-800 mb-4 group-hover:text-amber-700 transition-colors leading-tight">{name}</h3>
                                        <p className="text-zinc-500 font-light leading-relaxed mb-10 line-clamp-4 text-sm md:text-base">
                                            深入解析该作者的内容架构、情绪共鸣点及表达张力。包含全量数据拆解，适合深度学习研究。
                                        </p>
                                    </div>

                                    <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                        Explore Analysis <span className="ml-2 font-mono">→</span>
                                    </div>
                                </a>
                            )
                        })}
                    </div>
                ) : (
                    <div className="py-40 text-center bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200 animate-fade-in-up stagger-3">
                        <div className="text-6xl mb-8 animate-pulse text-zinc-200">🧪</div>
                        <p className="text-zinc-300 text-xl font-light italic">正在生成分析报告，请稍候...</p>
                    </div>
                )}

                <footer className="mt-48 pt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] uppercase tracking-widest text-zinc-400 font-medium animate-fade-in-up stagger-4">
                    <span>Potato Lab &copy; 2026. Data-Driven Creativity.</span>
                    <div className="flex gap-8">
                        <Link href="/" className="hover:text-amber-600 transition-colors">Main Hub</Link>
                        <Link href="/about" className="hover:text-amber-600 transition-colors">Contact</Link>
                    </div>
                </footer>
            </main>
        </div>
    );
}
