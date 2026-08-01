import { ActiveWorkoutPanel } from '@/components/active-workout-panel';
import { WorkoutProvider } from '@/hooks/use-workout';
import AppLayoutTemplate from '@/layouts/app/app-header-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <WorkoutProvider>
            <AppLayoutTemplate breadcrumbs={breadcrumbs}>
                {children}
            </AppLayoutTemplate>
            <ActiveWorkoutPanel />
        </WorkoutProvider>
    );
}
