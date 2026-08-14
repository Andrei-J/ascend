import { Head, Link, usePage } from '@inertiajs/react';
import {
    Dumbbell,
    Activity,
    Trophy,
    Zap,
    ArrowRight,
    Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { EdgeBadge, EdgeButton, EdgeCard, EdgeGrid } from '@/lib/edge/engine';
import { login, register } from '@/routes';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth, appVersion } = usePage<{
        auth: any;
        appVersion?: { version: string; version_code: number; build_id: string };
    }>().props;
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: <Dumbbell className="h-6 w-6 text-indigo-400" />,
            title: 'Smart Workout Studio',
            desc: 'Log every set, weight, rep, and rest timer with real-time feedback and EDGE reactive engine.',
        },
        {
            icon: <Activity className="h-6 w-6 text-purple-400" />,
            title: 'Analytics & Insights',
            desc: 'Continuous performance scoring, volume trends, and week-over-week AI progressive overload analysis.',
        },
        {
            icon: <Trophy className="h-6 w-6 text-rose-400" />,
            title: 'PR & Record Engine',
            desc: 'Automatic record tracking for strength milestones. Celebrate personal bests across all exercises.',
        },
    ];

    return (
        <>
            <Head>
                <title>Ascend — Elevate Your Training with EDGE Engine</title>
                <meta
                    name="description"
                    content="Ascend is the next-generation minimalist workout tracker powered by EDGE Element Definition and Generation Engine."
                />
            </Head>

            <div className="relative min-h-screen overflow-x-hidden bg-[#090D16] font-sans text-white">
                <div className="pointer-events-none absolute top-0 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-[120px]" />
                <div className="pointer-events-none absolute top-[40%] right-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

                <nav
                    className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-500 ${
                        scrolled
                            ? 'border-b border-white/10 bg-[#090d16]/90 shadow-2xl backdrop-blur-xl'
                            : 'bg-transparent'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-2xl font-black tracking-tight">
                            <Zap className="h-6 w-6 fill-indigo-400 text-indigo-400" />
                            <span className="text-white">asc</span>
                            <span className="text-indigo-400">end</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Link href="/dashboard" id="nav-dashboard">
                                <EdgeButton
                                    as="span"
                                    variant="gradient"
                                    glow
                                    icon={<ArrowRight className="h-4 w-4" />}
                                    className="rounded-xl px-4 py-2 text-sm font-bold"
                                >
                                    Dashboard
                                </EdgeButton>
                            </Link>
                        ) : (
                            <>
                                <Link href={login()} id="nav-login">
                                    <EdgeButton as="span" variant="ghost">
                                        Sign in
                                    </EdgeButton>
                                </Link>
                                {canRegister && (
                                    <Link href={register()} id="nav-register">
                                        <EdgeButton
                                            as="span"
                                            variant="gradient"
                                            glow
                                        >
                                            Get Started
                                        </EdgeButton>
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </nav>

                <section className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pt-32 pb-16 text-center">
                    <h1 className="max-w-3xl text-4xl leading-tight font-black tracking-tight text-white sm:text-6xl md:text-7xl">
                        Train with{' '}
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                            purpose.
                        </span>
                        <br />
                        Ascend{' '}
                        <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            further.
                        </span>
                    </h1>

                    <p className="mt-6 max-w-xl text-sm leading-relaxed font-normal text-slate-400 sm:text-base">
                        The minimalist, high-performance workout tracker built
                        for lifters who demand progress. Log smarter, lift
                        heavier, and conquer plateaus.
                    </p>

                    <div className="mt-8 flex w-full max-w-xs flex-col items-center justify-center gap-4">
                        {auth.user ? (
                            <Link href="/dashboard" className="w-full">
                                <EdgeButton
                                    as="span"
                                    variant="gradient"
                                    elevation="glow"
                                    glow
                                    icon={<Zap className="h-5 w-5" />}
                                    className="w-full justify-center rounded-2xl py-3.5 text-base font-bold"
                                >
                                    Open Dashboard
                                </EdgeButton>
                            </Link>
                        ) : (
                            <>
                                {canRegister && (
                                    <Link href={register()} className="w-full">
                                        <EdgeButton
                                            as="span"
                                            variant="gradient"
                                            elevation="glow"
                                            glow
                                            icon={<ArrowRight className="h-5 w-5" />}
                                            className="w-full justify-center rounded-2xl py-3.5 text-base font-bold"
                                        >
                                            Start for free
                                        </EdgeButton>
                                    </Link>
                                )}
                                <Link href={login()} className="w-full">
                                    <EdgeButton
                                        as="span"
                                        variant="glass"
                                        className="w-full justify-center rounded-2xl py-3.5 text-base font-bold"
                                    >
                                        Sign in
                                    </EdgeButton>
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="mt-16 w-full max-w-md space-y-4">
                        {[
                            { value: '10k+', label: 'WORKOUTS LOGGED' },
                            { value: '500+', label: 'EXERCISES CATALOGED' },
                            { value: '98%', label: 'USER SATISFACTION' },
                        ].map((s, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl border border-white/10 bg-slate-900/50 py-6 text-center shadow-lg backdrop-blur-md"
                            >
                                <p className="text-3xl font-black tracking-tight text-indigo-400 sm:text-4xl">
                                    {s.value}
                                </p>
                                <p className="mt-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mx-auto max-w-6xl border-t border-white/5 px-6 py-20">
                    <div className="mx-auto mb-14 max-w-2xl text-center">
                        <EdgeBadge
                            text="FEATURES"
                            variant="accent"
                            className="mb-3"
                        />
                        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                            Engineered for peak performance
                        </h2>
                        <p className="mt-2 text-sm text-slate-400">
                            Everything you need to plan, track, and elevate your
                            fitness journey.
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
                                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                                    {f.desc}
                                </p>
                            </EdgeCard>
                        ))}
                    </EdgeGrid>
                </section>

                <footer className="border-t border-white/10 py-12 text-center text-xs text-slate-500">
                    <div className="mb-2 flex items-center justify-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-400" />
                        <span className="font-bold text-slate-300">
                            Ascend EDGE UI Framework
                        </span>
                    </div>
                    <p>
                        © 2026 Ascend Fitness. Built with NativePHP &
                        Inertia.js.
                    </p>
                    {appVersion && (
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-950/40 px-3 py-1 text-[11px] font-mono text-indigo-300">
                            <span>Version: {appVersion.version}</span>
                            <span className="text-indigo-500">•</span>
                            <span>Version Code: {appVersion.version_code}</span>
                            {appVersion.build_id && (
                                <>
                                    <span className="text-indigo-500">•</span>
                                    <span>Build: {appVersion.build_id}</span>
                                </>
                            )}
                        </div>
                    )}
                </footer>
            </div>
        </>
    );
}
