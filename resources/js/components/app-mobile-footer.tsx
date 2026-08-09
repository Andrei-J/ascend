import { Link } from '@inertiajs/react';
import { Dumbbell, Folder, History, LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Workout',
        href: '/Workout',
        icon: Dumbbell,
    },
    {
        title: 'History',
        href: '/History',
        icon: History,
    },
    {
        title: 'Exercises',
        href: '/Exercises',
        icon: Folder,
    },
];

type Props = {
    variant?: 'sidebar' | 'header';
};

export function AppMobileFooter({ variant = 'sidebar' }: Props) {
    const { isCurrentUrl } = useCurrentUrl();
    const [spinningHref, setSpinningHref] = useState<string | null>(null);

    return (
        <div
            className={cn(
                'fixed right-0 bottom-0 left-0 z-50 h-auto min-h-[4rem] border-t border-white/10 bg-slate-950/90 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl',
                variant === 'header' ? 'lg:hidden' : 'md:hidden',
            )}
        >
            <nav className="mx-auto flex max-w-md items-center justify-around px-2 py-0.5">
                {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isCurrentUrl(item.href);
                    const isSpinning = active || spinningHref === item.href;

                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            prefetch
                            onClick={() =>
                                setSpinningHref(
                                    typeof item.href === 'string'
                                        ? item.href
                                        : item.href.url,
                                )
                            }
                            className={cn(
                                'group relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-slate-400 transition-all duration-300 hover:text-white',
                                active &&
                                    'scale-105 font-semibold text-indigo-400',
                            )}
                        >
                            {Icon && (
                                <div className="relative flex items-center justify-center p-1 transition-all duration-300 group-active:scale-90">
                                    <Icon
                                        className={cn(
                                            'h-5 w-5 transition-transform duration-300 group-hover:scale-110',
                                            active
                                                ? 'text-indigo-400'
                                                : 'text-slate-400 group-hover:text-slate-200',
                                            isSpinning &&
                                                'animate-[spin_4s_linear_infinite]',
                                        )}
                                    />
                                </div>
                            )}
                            <span
                                className={cn(
                                    'text-[11px] tracking-tight transition-colors',
                                    active
                                        ? 'text-indigo-300'
                                        : 'text-slate-400',
                                )}
                            >
                                {item.title}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
