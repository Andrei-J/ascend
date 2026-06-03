import { Link, usePage } from '@inertiajs/react';
import { Dumbbell, Folder, LayoutGrid } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Workout',
        href: '/Workout',
        icon: Dumbbell,
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
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <div
            className={cn(
                'fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-sidebar-border bg-sidebar/95 backdrop-blur-md pb-safe',
                variant === 'header' ? 'lg:hidden' : 'md:hidden',
            )}
        >
            <nav className="flex h-full items-center justify-around px-4">
                {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isCurrentUrl(item.href);
                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            prefetch
                            className={cn(
                                'flex h-full w-16 flex-col items-center justify-center gap-1 text-sidebar-foreground/60 transition-colors duration-200 hover:text-sidebar-foreground',
                                active && 'text-sidebar-accent-foreground font-medium',
                            )}
                        >
                            {Icon && (
                                <div
                                    className={cn(
                                        'flex items-center justify-center rounded-lg p-1.5 transition-all duration-200',
                                        active && 'bg-sidebar-accent text-sidebar-accent-foreground scale-105',
                                    )}
                                >
                                    <Icon className="size-5" />
                                </div>
                            )}
                            <span className="text-[10px] tracking-wide">{item.title}</span>
                        </Link>
                    );
                })}

                {auth.user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex h-full w-16 flex-col items-center justify-center gap-1 text-sidebar-foreground/60 transition-colors duration-200 hover:text-sidebar-foreground focus:outline-hidden">
                                <Avatar className="size-6 overflow-hidden rounded-full border border-sidebar-border shadow-xs">
                                    <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                    <AvatarFallback className="bg-neutral-200 text-[10px] font-bold text-black dark:bg-neutral-700 dark:text-white">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] tracking-wide">Account</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" side="top" sideOffset={8}>
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </nav>
        </div>
    );
}
