import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { dashboard, login, register } from '@/routes';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;
    const [scrolled, setScrolled] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 5v14M18 5v14M6 12h12M3 8h3M18 8h3M3 16h3M18 16h3" />
                </svg>
            ),
            title: 'Smart Workouts',
            desc: 'Log every set, rep, and weight with effortless precision. Your sessions, structured.',
        },
        {
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
            ),
            title: 'Progress Tracking',
            desc: 'See your growth over time with beautiful charts. Every PR celebrated, every plateau spotted.',
        },
        {
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                </svg>
            ),
            title: 'Exercise Library',
            desc: 'Hundreds of exercises at your fingertips. Build custom routines that fit your goals.',
        },
    ];

    const stats = [
        { value: '10k+', label: 'Workouts Logged' },
        { value: '500+', label: 'Exercises' },
        { value: '98%', label: 'User Satisfaction' },
        { value: '∞', label: 'Potential' },
    ];

    return (
        <>
            <Head>
                <title>Ascend — Elevate Your Training</title>
                <meta name="description" content="Ascend is the minimalist fitness tracking app that helps you log workouts, track progress, and reach new personal records." />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
            </Head>

            <div style={{ fontFamily: "'Inter', sans-serif" }} className="min-h-screen bg-[#080810] text-white overflow-x-hidden">

                {/* ── NAV ── */}
                <nav
                    className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-500 ${scrolled ? 'bg-[#080810]/90 backdrop-blur-md border-b border-white/5' : ''}`}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight">
                            <span className="text-white">asc</span><span className="text-[#818cf8]">end</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                id="nav-dashboard"
                                className="px-4 py-2 rounded-lg bg-[#818cf8] text-white text-sm font-medium hover:bg-[#6366f1] transition-colors duration-200"
                            >
                                Dashboard →
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    id="nav-login"
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
                                >
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        id="nav-register"
                                        className="px-4 py-2 rounded-lg bg-[#818cf8] text-white text-sm font-medium hover:bg-[#6366f1] transition-colors duration-200"
                                    >
                                        Get started
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </nav>

                {/* ── HERO ── */}
                <section ref={heroRef} className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-16 text-center overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                        <div
                            style={{
                                position: 'absolute',
                                top: '20%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '600px',
                                height: '400px',
                                background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, transparent 70%)',
                                filter: 'blur(40px)',
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '10%',
                                right: '10%',
                                width: '300px',
                                height: '300px',
                                background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, transparent 70%)',
                                filter: 'blur(60px)',
                            }}
                        />
                        {/* Grid lines */}
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                                backgroundSize: '80px 80px',
                                maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
                            }}
                        />
                    </div>

                    {/* Badge */}
                    <div className="relative mb-8 inline-flex items-center gap-2 rounded-full border border-[#818cf8]/30 bg-[#818cf8]/10 px-4 py-1.5">
                        <span className="size-1.5 rounded-full bg-[#818cf8] animate-pulse" />
                        <span className="text-xs font-medium text-[#818cf8] tracking-wide uppercase">Your training, elevated</span>
                    </div>

                    {/* Headline */}
                    <h1 className="relative max-w-3xl text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight">
                        Train with{' '}
                        <span
                            style={{
                                background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #e879f9 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            purpose.
                        </span>
                        <br />
                        Ascend further.
                    </h1>

                    {/* Subheadline */}
                    <p className="relative mt-6 max-w-xl text-base sm:text-lg text-white/50 leading-relaxed">
                        The minimalist workout tracker built for lifters who care about progress.
                        Log smarter, lift heavier, rise higher.
                    </p>

                    {/* CTA buttons */}
                    <div className="relative mt-10 flex flex-col sm:flex-row gap-3 items-center">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                id="hero-dashboard-cta"
                                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-300"
                                style={{
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    boxShadow: '0 0 30px rgba(99,102,241,0.4)',
                                }}
                            >
                                Open Dashboard
                                <svg className="group-hover:translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </Link>
                        ) : (
                            <>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        id="hero-register-cta"
                                        className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-300 hover:scale-[1.02]"
                                        style={{
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            boxShadow: '0 0 30px rgba(99,102,241,0.35)',
                                        }}
                                    >
                                        Start for free
                                        <svg className="group-hover:translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </Link>
                                )}
                                <Link
                                    href={login()}
                                    id="hero-login-cta"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-medium text-white/60 text-sm border border-white/10 hover:border-white/20 hover:text-white/80 transition-all duration-200"
                                >
                                    Sign in
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Stats row */}
                    <div className="relative mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-16">
                        {stats.map((stat) => (
                            <div key={stat.label} className="flex flex-col items-center gap-1">
                                <span className="text-3xl font-bold text-white">{stat.value}</span>
                                <span className="text-xs text-white/40 tracking-wide uppercase">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── FEATURES ── */}
                <section className="relative px-6 py-24 max-w-5xl mx-auto">
                    <div className="mb-16 text-center">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#818cf8] mb-3">Everything you need</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white">Built for the serious lifter.</h2>
                        <p className="mt-4 text-white/50 max-w-lg mx-auto">No bloat. No distractions. Just the tools that move the needle on your training.</p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-5">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                id={`feature-${i}`}
                                className="group relative rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 hover:border-[#818cf8]/20"
                            >
                                <div
                                    className="mb-4 inline-flex p-2.5 rounded-xl text-[#818cf8]"
                                    style={{ background: 'rgba(129,140,248,0.1)' }}
                                >
                                    {f.icon}
                                </div>
                                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── CTA BANNER ── */}
                <section className="px-6 py-24">
                    <div
                        className="max-w-2xl mx-auto rounded-3xl p-px"
                        style={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.2), rgba(99,102,241,0.1))',
                        }}
                    >
                        <div
                            className="rounded-3xl px-10 py-14 text-center"
                            style={{ background: '#0d0d1a' }}
                        >
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                Ready to ascend?
                            </h2>
                            <p className="text-white/50 mb-8 text-sm leading-relaxed max-w-sm mx-auto">
                                Join thousands of lifters tracking their journey and reaching new heights every session.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        id="cta-dashboard"
                                        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-300 hover:scale-[1.02]"
                                        style={{
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            boxShadow: '0 0 30px rgba(99,102,241,0.4)',
                                        }}
                                    >
                                        Go to Dashboard →
                                    </Link>
                                ) : (
                                    <>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                id="cta-register"
                                                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-300 hover:scale-[1.02]"
                                                style={{
                                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                    boxShadow: '0 0 30px rgba(99,102,241,0.4)',
                                                }}
                                            >
                                                Create free account
                                            </Link>
                                        )}
                                        <Link
                                            href={login()}
                                            id="cta-login"
                                            className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-medium text-white/60 text-sm border border-white/10 hover:border-white/20 hover:text-white/80 transition-all duration-200"
                                        >
                                            I have an account
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="border-t border-white/[0.04] px-6 py-8">
                    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-sm font-semibold">
                            <span className="text-white">asc</span><span className="text-[#818cf8]">end</span>
                        </span>
                        <p className="text-xs text-white/30">© {new Date().getFullYear()} Ascend. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
