import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppMobileFooter } from '@/components/app-mobile-footer';
import { AppShell } from '@/components/app-shell';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    return (
        <AppShell variant="header">
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent
                variant="header"
                className="pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-0"
            >
                {children}
            </AppContent>
            <AppMobileFooter variant="header" />
        </AppShell>
    );
}
