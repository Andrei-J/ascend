import { Head, useForm, router } from '@inertiajs/react';
import {
    Plus,
    FolderOpen,
    MoreHorizontal,
    ChevronDown,
    ChevronRight,
    Dumbbell,
    Pencil,
    Trash2,
    Zap,
    X,
    AlertTriangle,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useWorkout } from '@/hooks/use-workout';
import { EdgeHeader, EdgeCard, EdgeBadge, EdgeButton } from '@/lib/edge/engine';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface TemplateExercise {
    exercise_id: number;
    sets: { weight: number; reps: number; unit?: string }[];
}

interface Template {
    id: number;
    name: string;
    exercises: string[];
    lastUsed: string | null;
    folderName: string | null;
    rawExercises: TemplateExercise[];
}

interface Folder {
    id: number;
    name: string;
    templates: Template[];
}

interface ExerciseType {
    id: number;
    name: string;
    category: string;
    muscleGroup: string;
    equipment: string;
    difficulty: string;
}

function exercisePreview(exercises: string[], max = 3): string {
    if (exercises.length === 0) {
        return 'No exercises configured';
    }

    const shown = exercises.slice(0, max).join(', ');

    return exercises.length > max
        ? `${shown}, +${exercises.length - max} more`
        : shown;
}

function EllipsisMenu({
    id,
    activeMenu,
    setActiveMenu,
    onEdit,
    onDelete,
}: {
    id: string;
    activeMenu: string | null;
    setActiveMenu: (id: string | null) => void;
    onEdit?: () => void;
    onDelete?: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isOpen = activeMenu === id;

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setActiveMenu(null);
            }
        }
        document.addEventListener('mousedown', handleClick);

        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen, setActiveMenu]);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(isOpen ? null : id);
                }}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-1 w-36 animate-in overflow-hidden rounded-xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl duration-150 zoom-in-95 fade-in">
                    {onEdit && (
                        <button
                            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-indigo-500/20 hover:text-indigo-300"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(null);
                                onEdit();
                            }}
                        >
                            <Pencil className="h-3.5 w-3.5 text-indigo-400" />
                            Edit Template
                        </button>
                    )}
                    {onDelete && (
                        <button
                            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(null);
                                onDelete();
                            }}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function TemplateCard({
    template,
    activeMenu,
    setActiveMenu,
    compact = false,
    onEdit,
    onDelete,
    onClick,
    menuKey,
}: {
    template: Template;
    activeMenu: string | null;
    setActiveMenu: (id: string | null) => void;
    compact?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onClick?: () => void;
    menuKey: string;
}) {
    return (
        <EdgeCard
            variant="glass"
            elevation="md"
            className="group cursor-pointer transition-all duration-300 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
            title={
                <div className="flex w-full items-start justify-between gap-2">
                    <span
                        className={`leading-snug font-bold text-white transition-colors group-hover:text-indigo-300 ${compact ? 'text-sm' : 'text-base'}`}
                    >
                        {template.name}
                    </span>
                </div>
            }
            headerAction={
                <div onClick={(e) => e.stopPropagation()}>
                    <EllipsisMenu
                        id={menuKey}
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                </div>
            }
        >
            <div onClick={onClick} className="space-y-3 pt-1">
                <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">
                    {exercisePreview(template.exercises, compact ? 2 : 3)}
                </p>
                <div className="flex items-center justify-between border-t border-white/5 pt-2">
                    <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                        {template.exercises.length}{' '}
                        {template.exercises.length === 1
                            ? 'Exercise'
                            : 'Exercises'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 transition-transform group-hover:translate-x-0.5">
                        Start <ChevronRight className="h-3 w-3" />
                    </span>
                </div>
            </div>
        </EdgeCard>
    );
}

function FolderRow({
    folder,
    isOpen,
    onToggle,
    activeMenu,
    setActiveMenu,
    onEdit,
    onDelete,
    onStart,
}: {
    folder: Folder;
    isOpen: boolean;
    onToggle: () => void;
    activeMenu: string | null;
    setActiveMenu: (id: string | null) => void;
    onEdit?: (template: Template) => void;
    onDelete?: (template: Template) => void;
    onStart?: (template: Template) => void;
}) {
    const menuId = `folder-row-${folder.id}`;

    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md">
            <button
                onClick={onToggle}
                className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-white/5"
            >
                <FolderOpen className="h-4 w-4 shrink-0 text-indigo-400" />
                <span className="flex-1 text-xs font-extrabold tracking-wider text-slate-200 uppercase">
                    {folder.name}{' '}
                    <span className="font-normal text-slate-500">
                        ({folder.templates.length})
                    </span>
                </span>
                {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
                <div onClick={(e) => e.stopPropagation()}>
                    <EllipsisMenu
                        id={menuId}
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                    />
                </div>
            </button>

            {isOpen && (
                <div className="flex flex-col gap-2.5 border-t border-white/10 bg-slate-950/40 p-3">
                    {folder.templates.map((t) => (
                        <TemplateCard
                            key={t.id}
                            template={t}
                            activeMenu={activeMenu}
                            setActiveMenu={setActiveMenu}
                            compact
                            onEdit={onEdit ? () => onEdit(t) : undefined}
                            onDelete={onDelete ? () => onDelete(t) : undefined}
                            onClick={() => onStart?.(t)}
                            menuKey={`folder-${folder.id}-template-${t.id}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function WorkoutPage({
    folders = [],
    myTemplates = [],
    exercises = [],
}: {
    folders?: Folder[];
    myTemplates?: Template[];
    exercises?: ExerciseType[];
} = {}) {
    const [openFolders, setOpenFolders] = useState<Set<number>>(
        () => new Set(folders.length > 0 ? [folders[0].id] : []),
    );
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const { startWorkout } = useWorkout();

    const handleStartTemplate = async (template: Template) => {
        let currentExercises: any[] = exercises;
        try {
            const res = await fetch(`/api/exercises?t=${Date.now()}`, {
                headers: { 'Cache-Control': 'no-cache' },
            });
            if (res.ok) {
                const fresh = await res.json();
                if (Array.isArray(fresh) && fresh.length > 0) {
                    currentExercises = fresh;
                }
            }
        } catch {
            // Fallback to prop exercises if network fails
        }

        const mapped = template.rawExercises.map((rawEx) => {
            const match = currentExercises.find(
                (ex: any) => ex.id === rawEx.exercise_id,
            );

            const lastPerformed = (match as any)?.lastPerformed || rawEx.sets;
            const previousSummary = (match as any)?.previousSummary || null;

            return {
                exercise_id: rawEx.exercise_id,
                name: match ? match.name : 'Unknown Exercise',
                sets: rawEx.sets.map((s, sIdx) => {
                    const prevMatch = lastPerformed && lastPerformed[sIdx];
                    return {
                        weight: prevMatch ? prevMatch.weight : s.weight,
                        reps: prevMatch ? prevMatch.reps : s.reps,
                        unit: s.unit || 'kg',
                    };
                }),
                previousSets: lastPerformed,
                previousSummary: previousSummary,
            };
        });

        startWorkout({
            name: template.name,
            templateId: template.id,
            exercises: mapped,
        });
    };

    const toggleFolder = (id: number) => {
        setOpenFolders((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Inline create-exercise modal state
    const [isCreateExModalOpen, setIsCreateExModalOpen] = useState(false);
    const {
        data: exData,
        setData: setExData,
        post: postEx,
        processing: exProcessing,
        errors: exErrors,
        reset: resetEx,
    } = useForm({
        name: '',
        category: 'Strength',
        muscleGroup: '',
        equipment: 'None',
        difficulty: 'Moderate',
        instructions: '',
        restSeconds: '2:00',
    });

    const submitCreateExercise = (e: React.FormEvent) => {
        e.preventDefault();
        postEx('/Exercises/create', {
            onSuccess: () => {
                setIsCreateExModalOpen(false);
                resetEx();
                // Reload the page data so the new exercise appears in the list
                router.reload({ only: ['exercises'] });
            },
        });
    };

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            folderName: '',
            exercises: [] as {
                exercise_id: number;
                name: string;
                sets: {
                    weight: number | string;
                    reps: number | string;
                    unit?: string;
                }[];
            }[],
        });

    const handleCreate = () => {
        setEditingId(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const handleEdit = (template: Template) => {
        setEditingId(template.id);
        clearErrors();
        const mappedEx = template.rawExercises.map((rawEx) => {
            const match = exercises.find((ex) => ex.id === rawEx.exercise_id);

            return {
                exercise_id: rawEx.exercise_id,
                name: match ? match.name : 'Unknown Exercise',
                sets: rawEx.sets,
            };
        });
        setData({
            name: template.name,
            folderName: template.folderName || '',
            exercises: mappedEx,
        });
        setIsModalOpen(true);
    };

    const handleDelete = (template: Template) => {
        setDeleteTarget(template);
    };

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        setIsDeleting(true);
        window.location.href = `/Workout/delete/${deleteTarget.id}`;
    };

    const addExercise = useCallback((exerciseId: number, name: string) => {
        let initialWeight = 60;
        let initialReps = 10;

        for (const t of folders.flatMap((f) => f.templates).concat(myTemplates)) {
            const found = t.rawExercises.find(
                (re) => re.exercise_id === exerciseId,
            );

            if (found && found.sets.length > 0) {
                initialWeight = Number(found.sets[0].weight) || initialWeight;
                initialReps = Number(found.sets[0].reps) || initialReps;
                break;
            }
        }

        setData('exercises', [
            ...data.exercises,
            {
                exercise_id: exerciseId,
                name,
                sets: [{ weight: initialWeight, reps: initialReps, unit: 'kg' }],
            },
        ]);
    }, [data.exercises, folders, myTemplates, setData]);

    const removeExercise = (index: number) => {
        setData(
            'exercises',
            data.exercises.filter((_, i) => i !== index),
        );
    };

    const addSet = (exIndex: number) => {
        const currentSets = data.exercises[exIndex].sets;
        const lastSet = currentSets[currentSets.length - 1] || {
            weight: 60,
            reps: 10,
            unit: 'kg',
        };
        const updated = [...data.exercises];
        updated[exIndex].sets.push({ ...lastSet });
        setData('exercises', updated);
    };

    const removeSet = (exIndex: number, setIndex: number) => {
        const updated = [...data.exercises];
        updated[exIndex].sets = updated[exIndex].sets.filter(
            (_, i) => i !== setIndex,
        );
        setData('exercises', updated);
    };

    const updateSet = (
        exIndex: number,
        setIndex: number,
        field: string,
        val: any,
    ) => {
        const updated = [...data.exercises];
        updated[exIndex].sets[setIndex] = {
            ...updated[exIndex].sets[setIndex],
            [field]: val,
        };
        setData('exercises', updated);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const onSuccess = () => {
            setIsModalOpen(false);
            reset();
        };

        if (editingId) {
            put(`/Workout/update/${editingId}`, { onSuccess });
        } else {
            post('/Workout/create', { onSuccess });
        }
    };

    const filteredExercises = exercises
        .filter((ex) =>
            ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ex.category.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .slice(0, 20);

    return (
        <>
            <Head title="Workout - Ascend EDGE" />

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
                                        Delete template?
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Permanently remove{' '}
                                        <span className="font-bold text-white">
                                            {deleteTarget.name}
                                        </span>
                                        ? Action cannot be undone.
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

            {/* ── Inline Create Exercise Modal (z-[60] on top of template modal) ── */}
            {isCreateExModalOpen && (
                <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center p-4 bg-slate-950/90">
                    <div className="flex w-full max-w-lg flex-col rounded-3xl border border-white/10 bg-slate-900 shadow-2xl" style={{ maxHeight: '90dvh' }}>
                        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/50 p-5">
                            <div className="flex items-center gap-2">
                                <Dumbbell className="h-5 w-5 text-indigo-400" />
                                <h2 className="text-lg font-bold text-white">Create Custom Exercise</h2>
                            </div>
                            <button
                                onClick={() => { setIsCreateExModalOpen(false); resetEx(); }}
                                className="cursor-pointer text-slate-400 transition-colors hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={submitCreateExercise}
                            className="flex flex-1 flex-col overflow-hidden"
                        >
                            <div className="flex-1 space-y-4 overflow-y-auto p-6">
                                <div>
                                    <label className="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase">Exercise Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={exData.name}
                                        onChange={(e) => setExData('name', e.target.value)}
                                        placeholder="e.g. Incline DB Bench Press"
                                        className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                                    />
                                    {exErrors.name && <span className="mt-1 text-xs text-rose-400">{exErrors.name}</span>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase">Category</label>
                                        <Select value={exData.category} onValueChange={(val) => setExData('category', val)}>
                                            <SelectTrigger className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 text-xs font-semibold text-white outline-none focus:border-indigo-500">
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent className="z-[70] border-white/10 bg-slate-900 shadow-2xl">
                                                {['Strength','Cardio','Flexibility','Core'].map(v => (
                                                    <SelectItem key={v} value={v} className="cursor-pointer text-xs text-slate-200 focus:bg-indigo-500/20 focus:text-indigo-200">{v}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase">Equipment</label>
                                        <Select value={exData.equipment} onValueChange={(val) => setExData('equipment', val)}>
                                            <SelectTrigger className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 text-xs font-semibold text-white outline-none focus:border-indigo-500">
                                                <SelectValue placeholder="Equipment" />
                                            </SelectTrigger>
                                            <SelectContent className="z-[70] border-white/10 bg-slate-900 shadow-2xl">
                                                {['Barbell','Dumbbell','Machine','Bodyweight','Cable','Kettlebell','None'].map(v => (
                                                    <SelectItem key={v} value={v} className="cursor-pointer text-xs text-slate-200 focus:bg-indigo-500/20 focus:text-indigo-200">{v}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase">Muscle Group</label>
                                        <input
                                            type="text"
                                            value={exData.muscleGroup}
                                            onChange={(e) => setExData('muscleGroup', e.target.value)}
                                            placeholder="e.g. Chest, Triceps"
                                            className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase">Difficulty</label>
                                        <Select value={exData.difficulty} onValueChange={(val) => setExData('difficulty', val)}>
                                            <SelectTrigger className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 text-xs font-semibold text-white outline-none focus:border-indigo-500">
                                                <SelectValue placeholder="Difficulty" />
                                            </SelectTrigger>
                                            <SelectContent className="z-[70] border-white/10 bg-slate-900 shadow-2xl">
                                                {['Easy','Moderate','Hard'].map(v => (
                                                    <SelectItem key={v} value={v} className="cursor-pointer text-xs text-slate-200 focus:bg-indigo-500/20 focus:text-indigo-200">{v}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase">Default Rest Timer</label>
                                    <input
                                        type="text"
                                        value={exData.restSeconds}
                                        onChange={(e) => setExData('restSeconds', e.target.value)}
                                        placeholder="2:00"
                                        className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase">Movement Instructions</label>
                                    <textarea
                                        value={exData.instructions}
                                        onChange={(e) => setExData('instructions', e.target.value)}
                                        placeholder="Describe execution cues..."
                                        className="h-20 w-full resize-none rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="sticky bottom-0 z-20 flex shrink-0 justify-end gap-3 border-t border-white/10 bg-slate-950 px-6 py-4 shadow-2xl">
                                <EdgeButton variant="subtle" type="button" onClick={() => { setIsCreateExModalOpen(false); resetEx(); }}>Cancel</EdgeButton>
                                <EdgeButton variant="gradient" type="submit" loading={exProcessing}>Save Exercise</EdgeButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-slate-950/90">
                    <div className="flex w-full max-w-2xl flex-col rounded-3xl border border-white/10 bg-slate-900 shadow-2xl" style={{ maxHeight: '90dvh' }}>
                        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/50 p-5">
                            <div className="flex items-center gap-2">
                                <Dumbbell className="h-5 w-5 text-indigo-400" />
                                <h2 className="text-lg font-bold text-white">
                                    {editingId
                                        ? 'Edit Workout Template'
                                        : 'Create Workout Template'}
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
                            id="workout-template-form"
                            onSubmit={submit}
                            className="flex flex-1 flex-col gap-6 overflow-y-auto p-6"
                        >
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                                        Template Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="e.g. Push Hypertrophy A"
                                        className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                    {errors.name && (
                                        <span className="mt-1 block text-xs text-rose-400">
                                            {errors.name}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                                        Folder Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.folderName}
                                        onChange={(e) =>
                                            setData(
                                                'folderName',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g. UPPER / LOWER"
                                        className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                    {errors.folderName && (
                                        <span className="mt-1 block text-xs text-rose-400">
                                            {errors.folderName}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-6">
                                <label className="mb-3 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                                    Exercises in Template
                                </label>

                                {data.exercises.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 py-10 text-center text-sm text-slate-500">
                                        No exercises added yet. Select an
                                        exercise from the library below.
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {data.exercises.map((item, exIndex) => (
                                            <div
                                                key={exIndex}
                                                className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                                            >
                                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                    <span className="text-sm font-bold text-white">
                                                        {exIndex + 1}.{' '}
                                                        {item.name}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeExercise(
                                                                exIndex,
                                                            )
                                                        }
                                                        className="cursor-pointer text-xs font-semibold text-rose-400 transition-colors hover:text-rose-300"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <div className="grid grid-cols-[30px_1.5fr_75px_1.2fr_30px] items-center gap-2 px-2 text-left text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                                                        <span>Set</span>
                                                        <span>Weight</span>
                                                        <span>Unit</span>
                                                        <span>Reps</span>
                                                        <span></span>
                                                    </div>

                                                    {item.sets.map(
                                                        (set, setIndex) => (
                                                            <div
                                                                key={setIndex}
                                                                className="grid grid-cols-[30px_1.5fr_75px_1.2fr_30px] items-center gap-2"
                                                            >
                                                                <span className="text-center text-xs font-bold text-slate-400">
                                                                    {setIndex +
                                                                        1}
                                                                </span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="any"
                                                                    required
                                                                    value={
                                                                        set.weight
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateSet(
                                                                            exIndex,
                                                                            setIndex,
                                                                            'weight',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="h-9 w-full rounded-lg border border-white/10 bg-slate-900 px-2 text-sm text-white outline-none focus:border-indigo-500"
                                                                />
                                                                <select
                                                                    value={
                                                                        set.unit ||
                                                                        'kg'
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateSet(
                                                                            exIndex,
                                                                            setIndex,
                                                                            'unit',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="h-9 w-full rounded-lg border border-white/10 bg-slate-900 px-1.5 text-xs text-white outline-none focus:border-indigo-500"
                                                                >
                                                                    <option value="kg">
                                                                        kg
                                                                    </option>
                                                                    <option value="lbs">
                                                                        lbs
                                                                    </option>
                                                                </select>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    required
                                                                    value={
                                                                        set.reps
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateSet(
                                                                            exIndex,
                                                                            setIndex,
                                                                            'reps',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="h-9 w-full rounded-lg border border-white/10 bg-slate-900 px-2 text-sm text-white outline-none focus:border-indigo-500"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeSet(
                                                                            exIndex,
                                                                            setIndex,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        item
                                                                            .sets
                                                                            .length <=
                                                                        1
                                                                    }
                                                                    className="flex h-8 w-8 cursor-pointer items-center justify-center text-slate-500 transition-colors hover:text-rose-400 disabled:opacity-30"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        ),
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            addSet(exIndex)
                                                        }
                                                        className="mt-1 cursor-pointer self-start text-xs font-bold text-indigo-400 transition-colors hover:text-indigo-300"
                                                    >
                                                        + Add Set
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-white/10 pt-6">
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                                        Add Exercise from Library
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateExModalOpen(true)}
                                        className="cursor-pointer text-xs font-bold text-indigo-400 transition-colors hover:text-indigo-300"
                                    >
                                        + Create Custom Exercise
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    placeholder="Search by exercise name, target muscle..."
                                    className="mb-3 h-10 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                                />

                                <div className="flex max-h-44 flex-col gap-1 overflow-y-auto rounded-xl border border-white/10 bg-slate-950/40 p-2">
                                    {filteredExercises.length > 0 ? (
                                        filteredExercises.map((ex) => (
                                            <button
                                                key={ex.id}
                                                type="button"
                                                onClick={() => {
                                                    addExercise(ex.id, ex.name);
                                                    setSearchQuery('');
                                                }}
                                                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-indigo-500/20 hover:text-white"
                                            >
                                                <span className="font-semibold">{ex.name}</span>
                                                <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">{ex.category}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="py-4 text-center text-xs text-slate-500">
                                            {searchQuery ? 'No exercises match your search.' : 'No exercises in library yet.'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </form>

                        <div className="sticky bottom-0 z-20 flex shrink-0 justify-end gap-3 border-t border-white/10 bg-slate-950 px-6 py-4 shadow-2xl">
                            <EdgeButton
                                variant="subtle"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </EdgeButton>
                            <EdgeButton
                                variant="gradient"
                                type="submit"
                                form="workout-template-form"
                                loading={processing}
                            >
                                Save Template
                            </EdgeButton>
                        </div>
                    </div>
                </div>
            )}

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:p-8 md:pb-12">
                <EdgeHeader
                    title="Workout Studio"
                    subtitle="Plan your workouts, configure smart templates, and execute training routines."
                    icon={<Dumbbell className="h-7 w-7 text-indigo-400" />}
                />

                <EdgeCard variant="neon" elevation="lg" glow className="p-6">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="space-y-1">
                            <h2 className="flex items-center gap-2 text-lg font-extrabold text-white">
                                <span>Quick Workout Session</span>
                                <EdgeBadge text="INSTANT" variant="neon" />
                            </h2>
                            <p className="text-xs text-slate-300">
                                Launch an empty workout immediately without a
                                pre-configured template.
                            </p>
                        </div>
                        <EdgeButton
                            variant="gradient"
                            glow
                            icon={<Zap className="h-4 w-4" />}
                            onClick={() => startWorkout(null)}
                            className="w-full px-8 py-3 sm:w-auto"
                        >
                            Start Empty Workout
                        </EdgeButton>
                    </div>
                </EdgeCard>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
                    <aside className="flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <h2 className="text-base font-extrabold text-white">
                                Folder Directives
                            </h2>
                            <button
                                onClick={handleCreate}
                                className="cursor-pointer rounded-lg p-1.5 text-indigo-400 transition-colors hover:bg-indigo-500/20"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {folders.map((folder) => (
                                <FolderRow
                                    key={folder.id}
                                    folder={folder}
                                    isOpen={openFolders.has(folder.id)}
                                    onToggle={() => toggleFolder(folder.id)}
                                    activeMenu={activeMenu}
                                    setActiveMenu={setActiveMenu}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onStart={handleStartTemplate}
                                />
                            ))}
                            {folders.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-white/10 py-8 text-center text-xs text-slate-500">
                                    No folder categories defined
                                </div>
                            )}
                        </div>
                    </aside>

                    <div className="flex flex-col gap-6">
                        <div className="flex w-full items-center justify-center border-b border-white/10 pb-3">
                            <EdgeButton
                                variant="gradient"
                                glow
                                icon={<Plus className="h-4 w-4" />}
                                onClick={handleCreate}
                                className="w-full justify-center text-xs font-bold whitespace-nowrap sm:text-sm"
                            >
                                New Template
                            </EdgeButton>
                        </div>

                        {myTemplates.length === 0 ? (
                            <EdgeCard
                                variant="glass"
                                className="flex flex-col items-center py-12 text-center"
                            >
                                <p className="text-sm font-semibold text-slate-400">
                                    No templates created yet
                                </p>
                                <EdgeButton
                                    variant="gradient"
                                    className="mt-4"
                                    onClick={handleCreate}
                                >
                                    Create Your First Template
                                </EdgeButton>
                            </EdgeCard>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {myTemplates.map((t) => (
                                    <TemplateCard
                                        key={t.id}
                                        template={t}
                                        activeMenu={activeMenu}
                                        setActiveMenu={setActiveMenu}
                                        onEdit={() => handleEdit(t)}
                                        onDelete={() => handleDelete(t)}
                                        onClick={() => handleStartTemplate(t)}
                                        menuKey={`my-templates-${t.id}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

WorkoutPage.layout = {
    breadcrumbs: [
        {
            title: 'Workout',
            href: '/Workout',
        },
    ],
};
