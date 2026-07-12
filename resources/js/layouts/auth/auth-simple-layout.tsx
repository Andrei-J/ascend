import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10 overflow-hidden"
            // Dark background matching the landing page
            // bg-[#080810] applied via inline style since it's outside Tailwind theme
        >
            {/* ── Background ── */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#080810',
                    zIndex: 0,
                }}
            />

            {/* Radial glow top-center */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '700px',
                    height: '500px',
                    background:
                        'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)',
                    filter: 'blur(50px)',
                    zIndex: 0,
                }}
            />

            {/* Subtle grid */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                    backgroundSize: '80px 80px',
                    maskImage:
                        'radial-gradient(ellipse at center, black 30%, transparent 80%)',
                    zIndex: 0,
                }}
            />

            {/* ── Content ── */}
            <div className="relative z-10 w-full max-w-sm">
                <div className="flex flex-col gap-8">

                    {/* Logo */}
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-3 font-medium group"
                        >
                            <div
                                className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                                style={{
                                    background:
                                        'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                                    border: '1px solid rgba(129,140,248,0.3)',
                                }}
                            >
                                <AppLogoIcon
                                    className="size-6"
                                    style={{ fill: '#818cf8' }}
                                />
                            </div>
                            <span className="text-lg font-bold tracking-tight">
                                <span className="text-white">asc</span>
                                <span style={{ color: '#818cf8' }}>end</span>
                            </span>
                        </Link>

                        {/* Title + description */}
                        <div className="space-y-1.5 text-center">
                            <h1 className="text-xl font-semibold text-white">
                                {title}
                            </h1>
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Form card */}
                    <div
                        className="rounded-2xl p-px"
                        style={{
                            background:
                                'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.15), rgba(99,102,241,0.08))',
                        }}
                    >
                        <div
                            className="rounded-2xl px-8 py-8"
                            style={{ background: '#0d0d1a' }}
                        >
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
