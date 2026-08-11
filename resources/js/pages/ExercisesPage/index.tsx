import { Head, useForm } from '@inertiajs/react';
import {
    Search,
    Plus,
    Dumbbell,
    Activity,
    Clock,
    X,
    Pencil,
    Trash2,
    AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    EdgeHeader,
    EdgeCard,
    EdgeBadge,
    EdgeButton,
    EdgeGrid,
} from '@/lib/edge/engine';

interface ExerciseType {
    id: number;
    name: string;
    category: string;
    muscleGroup: string;
    equipment: string;
    difficulty: string;
    instructions: string;
    restSeconds: number;
    lastPerformed: string | null;
}

function getDifficultyVariant(
    difficulty: string,
): 'success' | 'warning' | 'danger' | 'subtle' {
    const diff = (difficulty || '').toLowerCase();

    if (diff === 'beginner' || diff === 'easy') {
        return 'success';
    }

    if (diff === 'intermediate' || diff === 'medium') {
        return 'warning';
    }

    if (diff === 'advanced' || diff === 'hard' || diff === 'monster') {
        return 'danger';
    }

    return 'subtle';
}

function formatSecondsToTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default function Exercise({
    exercises = [],
}: {
    exercises: ExerciseType[];
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ExerciseType | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            category: 'Strength',
            muscleGroup: '',
            equipment: 'None',
            difficulty: 'Moderate',
            instructions: '',
            restSeconds: '2:00',
        });

    const handleCreate = () => {
        setEditingId(null);
        setData({
            name: '',
            category: 'Strength',
            muscleGroup: '',
            equipment: 'None',
            difficulty: 'Moderate',
            instructions: '',
            restSeconds: '2:00',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleEdit = (exercise: ExerciseType) => {
        setEditingId(exercise.id);
        setData({
            name: exercise.name,
            category: exercise.category || 'Strength',
            muscleGroup: exercise.muscleGroup,
            equipment: exercise.equipment || 'None',
            difficulty: exercise.difficulty || 'Moderate',
            instructions: exercise.instructions,
            restSeconds: formatSecondsToTime(exercise.restSeconds ?? 120),
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const handleDelete = (exercise: ExerciseType) => {
        setDeleteTarget(exercise);
    };

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        setIsDeleting(true);
        window.location.href = `/Exercises/delete/${deleteTarget.id}`;
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const onSuccess = () => {
            setIsModalOpen(false);
            reset();
        };

        if (editingId) {
            put(`/Exercises/update/${editingId}`, { onSuccess });
        } else {
            post('/Exercises/create', { onSuccess });
        }
    };

    const filteredExercises = exercises.filter(
        (ex) =>
            ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ex.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ex.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <>
            <Head title="Exercises - Ascend EDGE" />

            {/* ── Delete Confirmation Modal ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex animate-in items-center justify-center p-4 duration-200 fade-in">
                    <div
                        className="absolute inset-0 bg-slate-950/80"
                        onClick={() => !isDeleting && setDeleteTarget(null)}
                    />
                    <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-rose-500/30 bg-slate-900 shadow-2xl">
                        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 to-red-600" />
                        <div className="p-6">
                            <div className="mb-4 flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-white">
                                        Delete Exercise?
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Permanently remove{' '}
                                        <span className="font-bold text-white">
                                            {deleteTarget.name}
                                        </span>{' '}
                                        from library?
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <EdgeButton
                                    variant="subtle"
                                    onClick={() => setDeleteTarget(null)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </EdgeButton>
                                <EdgeButton
                                    variant="danger"
                                    onClick={confirmDelete}
                                    loading={isDeleting}
                                >
                                    Yes, delete
                                </EdgeButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Create / Edit Modal ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-12 sm:p-6 bg-slate-950/90">
                    <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/50 p-5">
                            <div className="flex items-center gap-2">
                                <Dumbbell className="h-5 w-5 text-indigo-400" />
                                <h2 className="text-lg font-bold text-white">
                                    {editingId
                                        ? 'Edit Exercise'
                                        : 'Create Custom Exercise'}
                                </h2>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="cursor-pointer text-slate-400 transition-colors hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={submit}
                            className="flex-1 space-y-4 overflow-y-auto p-6"
                        >
                            <div>
                                <label className="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                                    Exercise Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="e.g. Incline DB Bench Press"
                                    className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                                />
                                {errors.name && (
                                    <span className="mt-1 text-xs text-rose-400">
                                        {errors.name}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                                        Category
                                    </label>
                                    <Select
                                        value={data.category}
                                        onValueChange={(val) =>
                                            setData('category', val)
                                        }
                                    >
                                        <SelectTrigger className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-xs font-semibold text-white outline-none focus:border-indigo-500">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[60] border-white/10 bg-slate-900 shadow-2xl backdrop-blur-xl">
                                            <SelectItem
                                                value="Strength"
                                                className="cursor-pointer text-xs text-slate-200 focus:bg-indigo-500/20 focus:text-indigo-200"
                                            >
                                                Strength
                                            </SelectItem>
                                            <SelectItem
                                                value="Cardio"
                                                className="cursor-pointer text-xs text-slate-200 focus:bg-indigo-500/20 focus:text-indigo-200"
                                            >
                                                Cardio
                                            </SelectItem>
                                            <SelectItem
                                                value="Flexibility"
                                                className="cursor-pointer text-xs text-slate-200 focus:bg-indigo-500/20 focus:text-indigo-200"
                                            >
                                                Flexibility
                                            </SelectItem>
                                            <SelectItem
                                                value="Core"
                                                className="cursor-pointer text-xs text-slate-200 focus:bg-indigo-500/20 focus:text-indigo-200"
                                            >
                                                Core
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.category && (
                                        <span className="mt-1 text-xs text-rose-400">
                                            {errors.category}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                                        Equipment
                                    </label>
                                    <Select
                                        value={data.equipment}
                                        onValueChange={(val) =>
                                            setData('equipment', val)
                                        }
                                    >
                                        <SelectTrigger className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-xs font-semibold text-white outline-none focus:border-indigo-500">
                                            <SelectValue placeholder="Equipment" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[60] border-white/10 bg-slate-900 shadow-2xl backdrop-blur-xl">
                                            <SelectItem
                                                value="Barbell"
                                                className="cursor-pointer text-xs text-slate-200 focus:bg-indigo-500/20 focus:text-indigo-200"
                                            >
                                                Barbell
                                            </SelectItem>
                                            <SelectItem
                                                value="Dumbbell"
                                                className="cursor-pointer text-xs text-slate-200 focus:bg-indigo-500/20 focus:text-indigo-200"
                                            >
                                                Dumbbell
                                            </SelectItem>
                                            <SelectItem
                                                value="Machine"
                                                className="cursor-pointer text-xs text-slate-200 focus:bg-indigo-500/20 focus:text-indigo-200"
                                            >
                                                Machine
                                            </SelectItem>
                                            <SelectItem
                                                value="None"
                                                className="cursor-pointer text-xs text-slate-200 focus:bg-indigo-500/20 focus:text-indigo-200"
                                            >
                                                None
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.equipment && (
                                        <span className="mt-1 text-xs text-rose-400">
                                            {errors.equipment}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                                        Muscle Group
                                    </label>
                                    <input
                                        type="text"
                                        value={data.muscleGroup}
                                        onChange={(e) =>
                                            setData(
                                                'muscleGroup',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g. Chest, Triceps"
                                        className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                                        Difficulty
                                    </label>
                                    <Select
                                        value={data.difficulty}
                                        onValueChange={(val) =>
                                            setData('difficulty', val)
                                        }
                                    >
                                        <SelectTrigger className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-xs font-semibold text-white outline-none focus:border-indigo-500">
                                            <SelectValue placeholder="Difficulty" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[60] border-white/10 bg-slate-900 shadow-2xl backdrop-blur-xl">
                                            <SelectItem
                                                value="Easy"
                                                className="cursor-pointer text-xs text-slate-200 focus:bg-indigo-500/20 focus:text-indigo-200"
                                            >
                                                Easy
                                            </SelectItem>
                                            <SelectItem
                                                value="Moderate"
                                                className="cursor-pointer text-xs text-slate-200 focus:bg-indigo-500/20 focus:text-indigo-200"
                                            >
                                                Moderate
                                            </SelectItem>
                                            <SelectItem
                                                value="Hard"
                                                className="cursor-pointer text-xs text-slate-200 focus:bg-indigo-500/20 focus:text-indigo-200"
                                            >
                                                Hard
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.difficulty && (
                                        <span className="mt-1 text-xs text-rose-400">
                                            {errors.difficulty}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                                    Default Rest Timer
                                </label>
                                <input
                                    type="text"
                                    value={data.restSeconds}
                                    onChange={(e) =>
                                        setData('restSeconds', e.target.value)
                                    }
                                    placeholder="2:00"
                                    className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                                    Movement Instructions
                                </label>
                                <textarea
                                    value={data.instructions}
                                    onChange={(e) =>
                                        setData('instructions', e.target.value)
                                    }
                                    placeholder="Describe execution cues..."
                                    className="h-24 w-full resize-none rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                                <EdgeButton
                                    variant="subtle"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </EdgeButton>
                                <EdgeButton
                                    variant="gradient"
                                    type="submit"
                                    loading={processing}
                                >
                                    Save Exercise
                                </EdgeButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:p-8 md:pb-12">
                {/* ── EDGE Page Header ── */}
                <EdgeHeader
                    title="Exercise Directory"
                    icon={<Dumbbell className="h-7 w-7 text-indigo-400" />}
                />

                {/* ── Search & Filter Controls ── */}
                <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md sm:flex-row">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by name, target muscle group, or equipment..."
                            className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 pr-4 pl-10 text-sm text-white transition-all outline-none placeholder:text-slate-500 focus:border-indigo-500"
                        />
                    </div>
                    <EdgeButton
                        variant="gradient"
                        glow
                        icon={<Plus className="h-4 w-4" />}
                        onClick={handleCreate}
                        className="w-full sm:w-auto"
                    >
                        Create Exercise
                    </EdgeButton>
                </div>

                {/* ── Exercise Cards Grid ── */}
                {filteredExercises.length === 0 ? (
                    <EdgeCard
                        variant="glass"
                        className="flex flex-col items-center py-12 text-center"
                    >
                        <h3 className="text-xl font-extrabold text-white">
                            No matching exercises found
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                            Try adjusting your search keywords or add a new
                            exercise to your catalog.
                        </p>
                    </EdgeCard>
                ) : (
                    <EdgeGrid columns="responsive" gap="md">
                        {filteredExercises.map((exercise) => (
                            <EdgeCard
                                key={exercise.id}
                                variant="glass"
                                elevation="lg"
                                title={exercise.name}
                                headerAction={
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleEdit(exercise)}
                                            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-indigo-300"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(exercise)
                                            }
                                            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                }
                            >
                                <div className="space-y-3 pt-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <EdgeBadge
                                            text={
                                                exercise.category || 'Movement'
                                            }
                                            variant="neon"
                                        />
                                        {exercise.difficulty && (
                                            <EdgeBadge
                                                text={exercise.difficulty}
                                                variant={getDifficultyVariant(
                                                    exercise.difficulty,
                                                )}
                                            />
                                        )}
                                    </div>

                                    {exercise.instructions ? (
                                        <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">
                                            {exercise.instructions}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-slate-600 italic">
                                            No description provided
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-2 border-t border-white/5 pt-2">
                                        {exercise.muscleGroup && (
                                            <span className="inline-flex items-center gap-1 rounded-lg border border-white/5 bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                                                <Activity className="h-3 w-3 text-indigo-400" />
                                                {exercise.muscleGroup}
                                            </span>
                                        )}
                                        {exercise.equipment && (
                                            <span className="inline-flex items-center gap-1 rounded-lg border border-white/5 bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
                                                <Dumbbell className="h-3 w-3 text-purple-400" />
                                                {exercise.equipment}
                                            </span>
                                        )}
                                        {exercise.restSeconds !== undefined && (
                                            <span className="inline-flex items-center gap-1 rounded-lg border border-white/5 bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
                                                <Clock className="h-3 w-3 text-amber-400" />
                                                {Math.floor(
                                                    exercise.restSeconds / 60,
                                                )}
                                                m {exercise.restSeconds % 60}s
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </EdgeCard>
                        ))}
                    </EdgeGrid>
                )}
            </div>
        </>
    );
}

Exercise.layout = {
    breadcrumbs: [
        {
            title: 'Exercises',
            href: '/Exercises',
        },
    ],
};
