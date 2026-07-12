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
import { useState, useRef, useEffect } from 'react';
import { useWorkout } from '@/hooks/use-workout';

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function exercisePreview(exercises: string[], max = 3): string {
    if (exercises.length === 0) {
return 'No exercises';
}

    const shown = exercises.slice(0, max).join(', ');

    return exercises.length > max ? `${shown}, …` : shown;
}

// ─── EllipsisMenu ─────────────────────────────────────────────────────────────

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
                className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-700 hover:text-neutral-200"
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-1 w-36 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-800 shadow-xl">
                    {onEdit && (
                        <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-200 transition-colors hover:bg-neutral-700"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(null);
                                onEdit();
                            }}
                        >
                            <Pencil className="h-3.5 w-3.5 text-neutral-400" />
                            Edit
                        </button>
                    )}
                    {onDelete && (
                        <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-400 transition-colors hover:bg-neutral-700"
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

// ─── TemplateCard ─────────────────────────────────────────────────────────────

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
        <div
            onClick={onClick}
            className="group flex flex-col gap-3 rounded-xl border border-neutral-700/60 bg-neutral-800/50 p-4 transition-all duration-200 hover:border-neutral-600 hover:bg-neutral-800 hover:shadow-lg cursor-pointer"
        >
            <div className="flex items-start justify-between gap-2">
                <span className={`font-semibold text-neutral-100 leading-snug ${compact ? 'text-sm' : 'text-base'}`}>
                    {template.name}
                </span>
                <div onClick={(e) => e.stopPropagation()}>
                    <EllipsisMenu
                        id={menuKey}
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                </div>
            </div>

            <p className="text-xs leading-relaxed text-neutral-400 line-clamp-2">
                {exercisePreview(template.exercises, compact ? 2 : 3)}
            </p>
        </div>
    );
}

// ─── FolderRow ────────────────────────────────────────────────────────────────

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
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
            {/* Folder header */}
            <button
                onClick={onToggle}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-neutral-800/60"
            >
                <FolderOpen className="h-4 w-4 shrink-0 text-neutral-500" />
                <span className="flex-1 text-xs font-bold uppercase tracking-widest text-neutral-300">
                    {folder.name}{' '}
                    <span className="font-normal text-neutral-600">({folder.templates.length})</span>
                </span>
                {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 text-neutral-600" />
                ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />
                )}
                <div onClick={(e) => e.stopPropagation()}>
                    <EllipsisMenu id={menuId} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
                </div>
            </button>

            {/* Folder contents */}
            {isOpen && (
                <div className="flex flex-col gap-2 border-t border-neutral-800 p-3">
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkoutPage({
    folders = [],
    myTemplates = [],
    exercises = [],
}: {
    folders?: Folder[];
    myTemplates?: Template[];
    exercises?: ExerciseType[];
} = {}) {
    const [openFolders, setOpenFolders] = useState<Set<number>>(() => new Set(folders.length > 0 ? [folders[0].id] : []));
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const { startWorkout } = useWorkout();

    const handleStartTemplate = (template: Template) => {
        // Map rawExercises to their name from our exercise library
        const mapped = template.rawExercises.map((rawEx) => {
            const match = exercises.find((ex) => ex.id === rawEx.exercise_id);

            return {
                exercise_id: rawEx.exercise_id,
                name: match ? match.name : 'Unknown Exercise',
                sets: rawEx.sets,
            };
        });

        startWorkout({
            name: template.name,
            templateId: template.id,
            exercises: mapped,
        });
    };

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        folderName: '',
        exercises: [] as { exercise_id: number; name: string; sets: { weight: number | string; reps: number | string; unit?: string }[] }[],
    });

    function toggleFolder(id: number) {
        setOpenFolders((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    }

    const handleCreate = () => {
        setEditingId(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const handleEdit = (template: Template) => {
        setEditingId(template.id);
        const mappedExs = template.rawExercises.map((rawEx) => {
            const matchedEx = exercises.find((e) => e.id === rawEx.exercise_id);

            return {
                exercise_id: rawEx.exercise_id,
                name: matchedEx ? matchedEx.name : 'Unknown Exercise',
                sets: rawEx.sets,
            };
        });
        setData({
            name: template.name,
            folderName: template.folderName || '',
            exercises: mappedExs,
        });
        clearErrors();
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
        router.delete(`/Workout/delete/${deleteTarget.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    const addExercise = (exerciseId: number, exerciseName: string) => {
        setData('exercises', [
            ...data.exercises,
            {
                exercise_id: exerciseId,
                name: exerciseName,
                sets: [{ weight: 60, reps: 10, unit: 'kg' }],
            },
        ]);
    };

    const removeExercise = (index: number) => {
        const next = [...data.exercises];
        next.splice(index, 1);
        setData('exercises', next);
    };

    const addSet = (exerciseIndex: number) => {
        const next = [...data.exercises];
        const lastSet = next[exerciseIndex].sets[next[exerciseIndex].sets.length - 1];
        next[exerciseIndex].sets.push({
            weight: lastSet ? lastSet.weight : 60,
            reps: lastSet ? lastSet.reps : 10,
            unit: lastSet && lastSet.unit ? lastSet.unit : 'kg',
        });
        setData('exercises', next);
    };

    const removeSet = (exerciseIndex: number, setIndex: number) => {
        const next = [...data.exercises];
        next[exerciseIndex].sets.splice(setIndex, 1);
        setData('exercises', next);
    };

    const updateSet = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps' | 'unit', value: string) => {
        const next = [...data.exercises];
        next[exerciseIndex].sets[setIndex][field] = value;
        setData('exercises', next);
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
        .filter((ex) => ex.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 15);

    return (
        <>
            <Head title="Workout" />

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
                                    <AlertTriangle className="h-5 w-5 text-rose-400" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-neutral-50">
                                        Delete template?
                                    </h2>
                                    <p className="mt-1 text-sm text-neutral-400">
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
                                    className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors disabled:opacity-50"
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

            {/* ── Create / Edit Template Modal ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4 animate-in fade-in duration-200">
                    <div className="flex flex-col w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] sm:rounded-2xl overflow-hidden bg-neutral-900 sm:border sm:border-neutral-700 shadow-2xl">
                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-neutral-800 p-5">
                            <h2 className="text-lg font-bold text-neutral-50">
                                {editingId ? 'Edit Workout Template' : 'Create New Workout Template'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-neutral-400 hover:text-neutral-200 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Scrollable Form Body */}
                        <form
                            id="workout-template-form"
                            onSubmit={submit}
                            className="flex-1 overflow-y-auto p-6 flex flex-col gap-6"
                        >
                            {/* Template Name & Folder */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                        Template Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Legs & Back"
                                        className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-805 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
                                    />
                                    {errors.name && (
                                        <span className="mt-1 block text-xs text-rose-500">{errors.name}</span>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                        Folder Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.folderName}
                                        onChange={(e) => setData('folderName', e.target.value)}
                                        placeholder="e.g. FULLBODY"
                                        className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
                                    />
                                    {errors.folderName && (
                                        <span className="mt-1 block text-xs text-rose-500">{errors.folderName}</span>
                                    )}
                                </div>
                            </div>

                            {/* Exercises Selection */}
                            <div className="border-t border-neutral-800 pt-6">
                                <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                    Exercises in Template
                                </label>

                                {data.exercises.length === 0 ? (
                                    <p className="rounded-xl border border-dashed border-neutral-800 py-8 text-center text-sm text-neutral-500">
                                        No exercises added yet. Select an exercise from the list below to add it.
                                    </p>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {data.exercises.map((item, exIndex) => (
                                            <div key={exIndex} className="rounded-xl border border-neutral-800 bg-neutral-850/50 p-4">
                                                <div className="flex items-center justify-between mb-3 border-b border-neutral-850 pb-2">
                                                    <span className="text-sm font-bold text-neutral-200">
                                                        {exIndex + 1}. {item.name}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExercise(exIndex)}
                                                        className="text-xs font-semibold text-rose-400 hover:text-rose-350 transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                {/* Sets configuration */}
                                                <div className="flex flex-col gap-2">
                                                    <div className="grid grid-cols-[30px_1.5fr_75px_1.2fr_30px] gap-2 items-center text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-2">
                                                        <span>Set</span>
                                                        <span>Weight</span>
                                                        <span>Unit</span>
                                                        <span>Reps</span>
                                                        <span></span>
                                                    </div>

                                                    {item.sets.map((set, setIndex) => (
                                                        <div key={setIndex} className="grid grid-cols-[30px_1.5fr_75px_1.2fr_30px] gap-2 items-center">
                                                            <span className="text-xs text-neutral-400 text-center font-bold">
                                                                {setIndex + 1}
                                                            </span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="any"
                                                                required
                                                                value={set.weight}
                                                                onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)}
                                                                placeholder="60"
                                                                className="h-9 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-2 text-sm text-neutral-200 outline-none focus:border-neutral-500"
                                                            />
                                                            <select
                                                                value={set.unit || 'kg'}
                                                                onChange={(e) => updateSet(exIndex, setIndex, 'unit', e.target.value)}
                                                                className="h-9 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-1.5 text-xs text-neutral-200 outline-none focus:border-neutral-500"
                                                            >
                                                                <option value="kg">kg</option>
                                                                <option value="lbs">lbs</option>
                                                            </select>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                required
                                                                value={set.reps}
                                                                onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)}
                                                                placeholder="10"
                                                                className="h-9 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-2 text-sm text-neutral-200 outline-none focus:border-neutral-500"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeSet(exIndex, setIndex)}
                                                                disabled={item.sets.length <= 1}
                                                                className="flex items-center justify-center h-8 w-8 text-neutral-500 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-neutral-500 transition-colors"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    <button
                                                        type="button"
                                                        onClick={() => addSet(exIndex)}
                                                        className="mt-1 self-start text-xs font-bold text-sky-400 hover:text-sky-350 transition-colors"
                                                    >
                                                        + Add Set
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Search and add exercise list */}
                            <div className="border-t border-neutral-800 pt-6">
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                                    Add Exercise from Library
                                </label>
                                <div className="relative mb-3">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by name, muscle, or category..."
                                        className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-850 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:border-neutral-550 focus:ring-1 focus:ring-neutral-550"
                                    />
                                </div>

                                <div className="max-h-40 overflow-y-auto border border-neutral-800 rounded-xl bg-neutral-950/20 p-2 flex flex-col gap-1">
                                    {filteredExercises.map((ex) => (
                                        <button
                                            key={ex.id}
                                            type="button"
                                            onClick={() => {
                                                addExercise(ex.id, ex.name);
                                                setSearchQuery('');
                                            }}
                                            className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-neutral-350 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
                                        >
                                            <span>{ex.name}</span>
                                            <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                                                {ex.category}
                                            </span>
                                        </button>
                                    ))}
                                    {filteredExercises.length === 0 && (
                                        <p className="text-center text-xs text-neutral-500 py-4">
                                            No exercises match your search
                                        </p>
                                    )}
                                </div>
                            </div>
                        </form>

                        {/* Sticky Footer */}
                        <div className="shrink-0 flex justify-end gap-3 border-t border-neutral-800 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-xl border border-neutral-700 px-5 py-2 text-sm font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="workout-template-form"
                                disabled={processing}
                                className="rounded-xl bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-400 disabled:opacity-50 transition-colors"
                            >
                                {processing ? 'Saving...' : 'Save Template'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">

                {/* ── Page header ── */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                        Workout
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Plan your sessions, manage templates, and track your training.
                    </p>
                </div>

                {/* ── Quick Start ── */}
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                        Quick start
                    </p>
                    <button
                        onClick={() => startWorkout(null)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-sky-500/20 transition-all duration-200 hover:bg-sky-400 active:scale-[0.99] sm:w-auto sm:px-10 sm:self-start"
                    >
                        <Zap className="h-4 w-4" />
                        Start an empty workout
                    </button>
                </div>

                {/* ── Divider ── */}
                <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

                {/* ── Two-column desktop layout ── */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">

                    {/* LEFT — Templates sidebar */}
                    <aside className="flex flex-col gap-4">
                        {/* Section header */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                                Templates
                            </h2>
                            <div className="flex items-center gap-0.5">
                                <button
                                    onClick={handleCreate}
                                    className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                                <button className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200">
                                    <FolderOpen className="h-4 w-4" />
                                </button>
                                <button className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200">
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Folder list */}
                        <div className="flex flex-col gap-2">
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
                                <p className="rounded-xl border border-dashed border-neutral-700 py-8 text-center text-sm text-neutral-500">
                                    No folders yet
                                </p>
                            )}
                        </div>
                    </aside>

                    {/* RIGHT — My Templates + Example Templates */}
                    <div className="flex flex-col gap-10">

                        {/* My Templates */}
                        <section className="flex flex-col gap-4">
                            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800">
                                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                                    My Templates{' '}
                                    <span className="ml-1 font-normal text-neutral-400">
                                        ({myTemplates.length})
                                    </span>
                                </h2>
                                <button
                                    onClick={handleCreate}
                                    className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    New template
                                </button>
                            </div>

                            {myTemplates.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-700 bg-neutral-900/30 py-16 text-center">
                                    <Dumbbell className="mb-3 h-8 w-8 text-neutral-600" />
                                    <p className="text-sm text-neutral-500">
                                        No templates yet —{' '}
                                        <span onClick={handleCreate} className="text-sky-400 cursor-pointer hover:underline">
                                            create one
                                        </span>
                                    </p>
                                </div>
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
                        </section>

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
