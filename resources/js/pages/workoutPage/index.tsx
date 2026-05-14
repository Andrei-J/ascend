import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard } from '@/routes';

export default function Dashboard() {
    return (
        <>
            <Head title="Workout" />
            <h1>Workout</h1>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Workout',
            href: '/Workout',
        },
    ],
};
