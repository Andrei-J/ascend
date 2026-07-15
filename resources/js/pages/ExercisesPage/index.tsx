import { Head, useForm, router } from '@inertiajs/react';
import { Search, Plus, Dumbbell, Activity, Clock, X, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ExerciseType {
    id: number;
    name: string;
    category: string;
    muscleGroup: string;
    equipment: string;
    difficulty: string;
    instructions: string;
    lastPerformed: string | null;
}

function getDifficultyColor(difficulty: string) {
    const diff = (difficulty || '').toLowerCase();
    
    if (diff === 'beginner' || diff === 'easy') {
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    }

    if (diff === 'intermediate' || diff === 'medium') {
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
    }

    if (diff === 'advanced' || diff === 'hard' || diff === 'monster') {
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
    }
    
    // Default fallback if no match
    return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';
}

export default function Exercise({
    exercises = [],
}: {
    exercises: ExerciseType[];
}) {
    // 1. Modal visibility state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<ExerciseType | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // 2. Inertia form helper to manage data, submission, and errors
    const { data, setData, post,put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        category: 'Strength',
        muscleGroup: '',
        equipment: '',
        difficulty: '',
        instructions: '',
    });

    // Handle opening modal for CREATE
    const handleCreate = () => {
        setEditingId(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    // Handle opening modal for EDIT
    const handleEdit = (exercise: ExerciseType) => {
        setEditingId(exercise.id);
        setData({
            name: exercise.name,
            category: exercise.category,
            muscleGroup: exercise.muscleGroup,
            equipment: exercise.equipment,
            difficulty: exercise.difficulty,
            instructions: exercise.instructions,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    

    // 3. Handle the form submission (Handles both Create and Update)
    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const onSuccess = () => {
            setIsModalOpen(false);
            reset();
        };

        if (editingId) {
            // Changed from `/Exercises/${editingId}`
            put(`/Exercises/update/${editingId}`, { onSuccess }); 
        } else {
            post('/Exercises/create', { onSuccess });
        }
    };

    const handleDelete = (exercise: ExerciseType) => {
        setDeleteTarget(exercise);
    };

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        setIsDeleting(true);
        router.delete(`/Exercises/delete/${deleteTarget.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <>
            <Head title="Exercises" />

            {/* ── Delete Confirmation Modal ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => !isDeleting && setDeleteTarget(null)}
                    />
                    <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-900 shadow-2xl">
                        <div className="h-1 w-full bg-gradient-to-r from-rose-500 to-red-500" />
                        <div className="p-6">
                            <div className="mb-4 flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-950/40">
                                    <AlertTriangle className="h-5 w-5 text-rose-450" />
                                </div>
                                <div className="text-left">
                                    <h2 className="text-base font-semibold text-neutral-50">
                                        Delete exercise?
                                    </h2>
                                    <p className="mt-1 text-sm text-neutral-400 leading-relaxed">
                                        You're about to permanently delete{' '}
                                        <span className="font-semibold text-neutral-200">
                                            {deleteTarget.name}
                                        </span>
                                        . This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => setDeleteTarget(null)}
                                    className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-350 hover:bg-neutral-800 hover:text-white transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={confirmDelete}
                                    className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-500 transition-colors disabled:opacity-50"
                                >
                                    {isDeleting ? 'Deleting…' : 'Yes, delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. The Modal Overlay & Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex flex-col bg-black/50 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4">
                    <div className="flex flex-col w-full h-full sm:h-auto sm:max-w-md overflow-hidden sm:rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 p-5 dark:border-neutral-800">
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
                            className="flex-1 overflow-y-auto flex flex-col gap-4 p-5"
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

                            {/* Difficulty */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Difficulty
                                </label>
                                <Input
                                    value={data.difficulty}
                                    onChange={(e) =>
                                        setData('difficulty', e.target.value)
                                    }
                                    placeholder="e.g. Beginner, intermidiate & Monster"
                                />
                                {errors.difficulty && (
                                    <span className="mt-1 text-xs text-red-500">
                                        {errors.difficulty}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    instructions
                                </label>
                                <textarea
                                    value={data.instructions}
                                    onChange={(e) =>
                                        setData('instructions', e.target.value)
                                    }
                                    placeholder="Describe the movement..."
                                    className="flex min-h-[80px] w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300"
                                />
                                {errors.instructions && (
                                    <span className="mt-1 text-xs text-red-500">
                                        {errors.instructions}
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
                        onClick={handleCreate}
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
                        {exercises.map((exercise) => {
                            const cc = getCategoryColor(exercise.category);

                            return (
                                <Card
                                    key={exercise.id}
                                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-0 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-neutral-800/60 dark:bg-neutral-900"
                                >
                                    {/* Coloured accent bar */}
                                    <div className={`h-1 w-full ${cc.bar}`} />

                                    {/* Main body */}
                                    <div className="flex flex-1 flex-col gap-4 p-5">


                                        {/* Icon + category badge row */}
                                        <div className="flex items-center justify-between">
                                            <div
                                                className={`flex items-center justify-center rounded-xl p-2.5 ${cc.icon}`}
                                            >
                                                <Dumbbell className="h-4 w-4" />
                                            </div>
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${cc.badge}`}
                                            >
                                                {exercise.category || '—'}
                                            </span>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleEdit(exercise)}
                                                    className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
                                                    title="Edit Exercise"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(exercise)}
                                                    className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-rose-500 dark:hover:bg-neutral-800 dark:hover:text-rose-450"
                                                    title="Delete Exercise"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Name & Difficulty Row */}
                                        <div>
                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="line-clamp-1 text-base font-bold text-neutral-900 dark:text-neutral-50">
                                                    {exercise.name}
                                                </h3> 

                                                {/* Styled Difficulty Badge */}
                                                <span
                                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${getDifficultyColor(exercise.difficulty)}`}
                                                >
                                                    {exercise.difficulty}
                                                </span>
                                            </div>

                                            {exercise.instructions ? (
                                                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                                                    {exercise.instructions}
                                                </p>
                                            ) : (
                                                <p className="mt-1 text-xs text-neutral-400 italic dark:text-neutral-600">
                                                    No description provided.
                                                </p>
                                            )}
                                        </div>

                                        {/* Muscle group + equipment chips */}
                                        <div className="flex flex-wrap gap-2">
                                            {exercise.muscleGroup && (
                                                <div className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1 dark:bg-neutral-800">
                                                    <Activity className="h-3 w-3 text-neutral-500 dark:text-neutral-400" />
                                                    <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                                                        {exercise.muscleGroup}
                                                    </span>
                                                </div>
                                            )}
                                            {exercise.equipment && (
                                                <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1 dark:border-neutral-700">
                                                    <Dumbbell className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
                                                    <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                                                        {exercise.equipment}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer: last performed */}
                                    <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3 dark:border-neutral-800/60">
                                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                                            <Clock className="h-3.5 w-3.5" />
                                            Last performed
                                        </span>
                                        <span
                                            className={`text-[11px] font-semibold ${
                                                exercise.lastPerformed
                                                    ? 'text-neutral-700 dark:text-neutral-300'
                                                    : 'text-neutral-400 dark:text-neutral-600'
                                            }`}
                                        >
                                            {exercise.lastPerformed || 'Never'}
                                        </span>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

/** Returns Tailwind colour classes keyed by exercise category. */
function getCategoryColor(category: string) {
    const cat = (category || '').toLowerCase();

    if (cat === 'strength') {
return {
            bar: 'bg-gradient-to-r from-violet-500 to-indigo-500',
            icon: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
            badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
        };
}

    if (cat === 'cardio') {
return {
            bar: 'bg-gradient-to-r from-orange-400 to-rose-500',
            icon: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
            badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
        };
}

    if (cat === 'flexibility' || cat === 'mobility') {
return {
            bar: 'bg-gradient-to-r from-teal-400 to-cyan-500',
            icon: 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400',
            badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
        };
}

    if (cat === 'balance' || cat === 'core') {
return {
            bar: 'bg-gradient-to-r from-amber-400 to-yellow-400',
            icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
            badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        };
}

    return {
        bar: 'bg-gradient-to-r from-neutral-400 to-neutral-500',
        icon: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
        badge: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    };
}

Exercise.layout = {
    breadcrumbs: [
        {
            title: 'Exercise',
            href: '/Exercise',
        },
    ],
};
