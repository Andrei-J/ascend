import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { dashboard, login, register } from '@/routes';
import { EdgeBadge, EdgeButton, EdgeCard, EdgeGrid } from '@/lib/edge/engine';
import { Dumbbell, Activity, Trophy, Zap, ArrowRight, Sparkles } from 'lucide-react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: <Dumbbell className="w-6 h-6 text-indigo-400" />,
            title: 'Smart Workout Studio',
            desc: 'Log every set, weight, rep, and rest timer with real-time feedback and EDGE reactive engine.',
        },
        {
            icon: <Activity className="w-6 h-6 text-purple-400" />,
            title: 'Analytics & Insights',
            desc: 'Continuous performance scoring, volume trends, and week-over-week AI progressive overload analysis.',
        },
        {
            icon: <Trophy className="w-6 h-6 text-rose-400" />,
            title: 'PR & Record Engine',
            desc: 'Automatic record tracking for strength milestones. Celebrate personal bests across all exercises.',
        },
    ];

    const stats = [
        { value: '10k+', label: 'Workouts Logged' },
        { value: '500+', label: 'Exercises Cataloged' },
        { value: '98%', label: 'User Satisfaction' },
        { value: '∞', label: 'Potential Unlocked' },
    ];

    return (
        <>
            <Head>
                <title>Ascend — Elevate Your Training with EDGE Engine</title>
                <meta name="description" content="Ascend is the next-generation minimalist workout tracker powered by EDGE Element Definition and Generation Engine." />
            </Head>

            <div className="min-h-screen bg-[#090D16] text-white overflow-x-hidden relative font-sans">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-[120px] pointer-events-none" />
                <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

                <nav
                    className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-500 ${scrolled ? 'bg-slate-950/85 backdrop-blur-xl border-b border-white/10 shadow-2xl' : ''
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black tracking-tight flex items-center gap-2">
                            <Zap className="w-6 h-6 text-indigo-400 fill-indigo-400" />
                            <span className="text-white">asc</span>
                            <span className="text-indigo-400">end</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Link href="/dashboard" id="nav-dashboard">
                                <EdgeButton as="span" variant="gradient" glow icon={<ArrowRight className="w-4 h-4" />}>
                                    Dashboard
                                </EdgeButton>
                            </Link>
                        ) : (
                            <>
                                <Link href={login()} id="nav-login">
                                    <EdgeButton as="span" variant="ghost">Sign in</EdgeButton>
                                </Link>
                                {canRegister && (
                                    <Link href={register()} id="nav-register">
                                        <EdgeButton as="span" variant="gradient" glow>
                                            Get Started
                                        </EdgeButton>
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </nav>

                <section className="relative pt-36 pb-24 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-none max-w-4xl">
                        Train with <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">purpose.</span>
                        <br />
                        Ascend further.
                    </h1>

                    <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl leading-relaxed font-normal">
                        The minimalist, high-performance workout tracker built for lifters who demand progress. Log smarter, lift heavier, and conquer plateaus.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
                        {auth.user ? (
                            <Link href="/dashboard" className="w-full sm:w-auto">
                                <EdgeButton as="span" variant="gradient" elevation="glow" glow icon={<Zap className="w-5 h-5" />} className="w-full sm:w-auto px-8 py-3.5 text-base">
                                    Open Dashboard
                                </EdgeButton>
                            </Link>
                        ) : (
                            <>
                                {canRegister && (
                                    <Link href={register()} className="w-full sm:w-auto">
                                        <EdgeButton as="span" variant="gradient" elevation="glow" glow icon={<ArrowRight className="w-5 h-5" />} className="w-full sm:w-auto px-8 py-3.5 text-base">
                                            Start for free
                                        </EdgeButton>
                                    </Link>
                                )}
                                <Link href={login()} className="w-full sm:w-auto">
                                    <EdgeButton as="span" variant="glass" className="w-full sm:w-auto px-8 py-3.5 text-base">
                                        Sign in
                                    </EdgeButton>
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="mt-20 w-full max-w-4xl">
                        <EdgeGrid columns={4} gap="md">
                            {stats.map((s, idx) => (
                                <EdgeCard key={idx} variant="glass" elevation="md" className="py-6 text-center">
                                    <p className="text-3xl sm:text-4xl font-black text-indigo-400 tracking-tight">{s.value}</p>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">{s.label}</p>
                                </EdgeCard>
                            ))}
                        </EdgeGrid>
                    </div>
                </section>

                <section className="py-20 px-6 max-w-6xl mx-auto border-t border-white/5">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <EdgeBadge text="FEATURES" variant="accent" className="mb-3" />
                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                            Engineered for peak performance
                        </h2>
                        <p className="text-slate-400 mt-2 text-sm">
                            Everything you need to plan, track, and elevate your fitness journey.
                        </p>
                    </div>

                    <EdgeGrid columns={3} gap="lg">
                        {features.map((f, i) => (
                            <EdgeCard
                                key={i}
                                variant="glass"
                                elevation="lg"
                                glow
                                icon={f.icon}
                                title={f.title}
                                className="text-left"
                            >
                                <p className="text-sm text-slate-400 leading-relaxed mt-2">{f.desc}</p>
                            </EdgeCard>
                        ))}
                    </EdgeGrid>
                </section>

                <footer className="py-12 border-t border-white/10 text-center text-xs text-slate-500">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span className="font-bold text-slate-300">Ascend EDGE UI Framework</span>
                    </div>
                    <p>© 2026 Ascend Fitness. Built with NativePHP & Inertia.js.</p>
                </footer>
            </div>
        </>
    );
}
