import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, Plus, Dumbbell, Activity, Clock, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

interface ExerciseType {
    id: number;
    name: string;
    category: string;
    muscleGroup: string;
    equipment: string;
    description: string;
    lastPerformed: string | null;
}

export default function Exercise({
    exercises = [],
}: {
    exercises: ExerciseType[];
}) {
    // 1. Modal visibility state
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 2. Inertia form helper to manage data, submission, and errors
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        category: 'Strength',
        muscleGroup: '',
        equipment: '',
        description: '',
    });

    // 3. Handle the form submission
    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // This will send a POST request to your Laravel route
        post('/exercises/create', {
            onSuccess: () => {
                // If successful, close the modal and clear the form inputs
                setIsModalOpen(false);
                reset();
            },
        });
    };

    return (
        <>
            <Head title="Exercises" />

            {/* 4. The Modal Overlay & Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between border-b border-neutral-100 p-5 dark:border-neutral-800">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                                Create New Exercise
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={submit}
                            className="flex flex-col gap-4 p-5"
                        >
                            {/* Name */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Exercise Name
                                </label>
                                <Input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="e.g. Barbell Bench Press"
                                />
                                {errors.name && (
                                    <span className="mt-1 text-xs text-red-500">
                                        {errors.name}
                                    </span>
                                )}
                            </div>

                            {/* Category & Equipment Row */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Category
                                    </label>
                                    <Input
                                        value={data.category}
                                        onChange={(e) =>
                                            setData('category', e.target.value)
                                        }
                                        placeholder="e.g. Strength, Cardio"
                                    />
                                    {errors.category && (
                                        <span className="mt-1 text-xs text-red-500">
                                            {errors.category}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Equipment
                                    </label>
                                    <Input
                                        value={data.equipment}
                                        onChange={(e) =>
                                            setData('equipment', e.target.value)
                                        }
                                        placeholder="e.g. Barbell, Dumbbell"
                                    />
                                    {errors.equipment && (
                                        <span className="mt-1 text-xs text-red-500">
                                            {errors.equipment}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Muscle Group */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Muscle Group
                                </label>
                                <Input
                                    value={data.muscleGroup}
                                    onChange={(e) =>
                                        setData('muscleGroup', e.target.value)
                                    }
                                    placeholder="e.g. Chest, Quads & Glutes"
                                />
                                {errors.muscleGroup && (
                                    <span className="mt-1 text-xs text-red-500">
                                        {errors.muscleGroup}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Describe the movement..."
                                    className="flex min-h-[80px] w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300"
                                />
                                {errors.description && (
                                    <span className="mt-1 text-xs text-red-500">
                                        {errors.description}
                                    </span>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="mt-4 flex justify-end gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Exercise'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
                {/* Header Title Section */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                        Exercises
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Create, search, and manage your library of physical
                        movements.
                    </p>
                </div>

                {/* Top Actions Row: Search on Left, Create on Right */}
                <div className="flex flex-col gap-3 border-b border-neutral-100 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800/60">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
                        <Input
                            type="text"
                            placeholder="Search by exercise, muscle, or equipment..."
                            className="w-full border-neutral-200 bg-white pl-10 dark:border-neutral-800 dark:bg-neutral-900"
                        />
                    </div>

                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full bg-neutral-900 font-medium text-neutral-50 shadow-sm transition-colors hover:bg-neutral-800 sm:w-auto dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Exercise
                    </Button>
                </div>

                {/* 2. Conditional Rendering: Check if the exercises array is empty */}
                {exercises.length === 0 ? (
                    /* Empty State UI */
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900/20">
                        <Dumbbell className="mb-3 h-10 w-10 text-neutral-400" />
                        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-50">
                            No exercises yet
                        </h3>
                        <p className="mt-1 max-w-sm text-sm text-neutral-500">
                            You haven't added any exercises to your library.
                            Click the "Create Exercise" button to get started.
                        </p>
                    </div>
                ) : (
                    /* Populated Grid UI */
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {exercises.map((exercise) => (
                            <Card
                                key={exercise.id}
                                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/50 p-5 transition-all duration-300 hover:border-neutral-300 hover:bg-white hover:shadow-md dark:border-neutral-800/60 dark:bg-neutral-900/30 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
                            >
                                <div>
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="rounded-xl bg-neutral-100 p-2 text-neutral-700 transition-transform duration-300 group-hover:scale-110 dark:bg-neutral-800 dark:text-neutral-300">
                                            <Dumbbell className="h-4.5 w-4.5" />
                                        </div>
                                    </div>

                                    <h3 className="mb-1.5 line-clamp-1 text-base font-semibold text-neutral-900 transition-colors duration-200 group-hover:text-neutral-950 dark:text-neutral-50 dark:group-hover:text-white">
                                        {exercise.name}
                                    </h3>

                                    <p className="mb-4 line-clamp-2 min-h-[2.5rem] text-xs text-neutral-500 dark:text-neutral-400">
                                        {exercise.description}
                                    </p>
                                </div>

                                <div className="space-y-3 border-t border-neutral-100 pt-3 dark:border-neutral-800/60">
                                    <div className="flex flex-wrap gap-1.5">
                                        <Badge
                                            variant="secondary"
                                            className="rounded-full border-none bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                        >
                                            {exercise.muscleGroup}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="rounded-full border-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 dark:border-neutral-800 dark:text-neutral-400"
                                        >
                                            {exercise.equipment}
                                        </Badge>
                                    </div>

                                    <div className="text-neutral-450 flex items-center justify-between text-[10px] font-medium dark:text-neutral-500">
                                        <span className="flex items-center gap-1">
                                            <Activity className="h-3 w-3" />
                                            {exercise.category}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Last:{' '}
                                            {exercise.lastPerformed || 'Never'}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

Exercise.layout = {
    breadcrumbs: [
        {
            title: 'Exercise',
            href: '/Exercise',
        },
    ],
};
