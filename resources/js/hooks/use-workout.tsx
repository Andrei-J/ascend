import { router } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export interface ActiveSet {
    weight: string | number;
    reps: string | number;
    unit: string;
    isFinished: boolean;
}

export interface ActiveExercise {
    exercise_id: number | null;
    name: string;
    sets: ActiveSet[];
    restSeconds: number;
}

export interface WorkoutSession {
    name: string;
    templateId: number | null;
    startTime: string; // ISO String
    exercises: ActiveExercise[];
    activeRest?: { exerciseIndex: number; setIndex: number; remaining: number; total: number; timestamp: number } | null;
}

interface WorkoutContextType {
    isActive: boolean;
    isExpanded: boolean;
    name: string;
    templateId: number | null;
    startTime: string | null;
    exercises: ActiveExercise[];
    elapsedSeconds: number;
    activeRest: { exerciseIndex: number; setIndex: number; remaining: number; total: number } | null;
    startWorkout: (initialData?: {
        name: string;
        templateId: number | null;
        exercises: {
            exercise_id: number | null;
            name: string;
            sets: { weight: number | string; reps: number | string; unit?: string }[];
            restSeconds?: number;
        }[];
    } | null) => void;
    setIsExpanded: (expanded: boolean) => void;
    updateWorkoutName: (name: string) => void;
    addActiveExercise: (exerciseId: number | null, name: string) => void;
    removeActiveExercise: (exerciseIndex: number) => void;
    addActiveSet: (exerciseIndex: number) => void;
    removeActiveSet: (exerciseIndex: number, setIndex: number) => void;
    updateActiveSet: (exerciseIndex: number, setIndex: number, fields: Partial<ActiveSet>) => void;
    toggleSetCompleted: (exerciseIndex: number, setIndex: number) => void;
    updateExerciseRest: (exerciseIndex: number, seconds: number) => void;
    adjustActiveRest: (seconds: number) => void;
    skipActiveRest: () => void;
    cancelWorkout: () => void;
    finishWorkout: () => void;
}


const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

function getDefaultWorkoutName(): string {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
return 'Morning Workout';
}

    if (hour >= 12 && hour < 17) {
return 'Afternoon Workout';
}

    if (hour >= 17 && hour < 22) {
return 'Evening Workout';
}

    return 'Night Workout';
}

const LOCAL_STORAGE_KEY = 'ascend_active_workout';

function getInitialWorkout(): WorkoutSession | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (stored) {
        try {
            const parsed = JSON.parse(stored) as WorkoutSession;

            if (parsed.startTime && parsed.name) {
                return parsed;
            }
        } catch (e) {
            console.error('Failed to parse active workout from localStorage', e);
        }
    }

    return null;
}

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
    const [initialWorkout] = useState<WorkoutSession | null>(() => getInitialWorkout());

    const [pendingWorkout, setPendingWorkout] = useState<{
        initialData: {
            name: string;
            templateId: number | null;
            exercises: {
                exercise_id: number | null;
                name: string;
                sets: { weight: number | string; reps: number | string; unit?: string }[];
                restSeconds?: number;
            }[];
        } | null;
    } | null>(null);

    const [isActive, setIsActive] = useState(!!initialWorkout);
    const [isExpanded, setIsExpanded] = useState(false);
    const [name, setName] = useState(initialWorkout?.name || '');
    const [templateId, setTemplateId] = useState<number | null>(initialWorkout?.templateId || null);
    const [startTime, setStartTime] = useState<string | null>(initialWorkout?.startTime || null);
    const [exercises, setExercises] = useState<ActiveExercise[]>(initialWorkout?.exercises || []);
    const [elapsedSeconds, setElapsedSeconds] = useState(() => {
        if (initialWorkout?.startTime) {
            const diffMs = Date.now() - new Date(initialWorkout.startTime).getTime();

            return Math.max(0, Math.floor(diffMs / 1000));
        }

        return 0;
    });

    // Active rest countdown state
    const [activeRest, setActiveRest] = useState<{ exerciseIndex: number; setIndex: number; remaining: number; total: number } | null>(() => {
        if (initialWorkout?.activeRest) {
            const savedRest = initialWorkout.activeRest;
            const elapsed = Math.floor((Date.now() - savedRest.timestamp) / 1000);
            const remaining = savedRest.remaining - elapsed;

            if (remaining > 0) {
                return {
                    exerciseIndex: savedRest.exerciseIndex,
                    setIndex: savedRest.setIndex !== undefined ? savedRest.setIndex : 0,
                    remaining,
                    total: savedRest.total,
                };
            }
        }

        return null;
    });

    // Track state in ref to avoid setInterval closure stale data
    const stateRef = useRef({ startTime, isActive });
    useEffect(() => {
        stateRef.current = { startTime, isActive };
    }, [startTime, isActive]);

    // Save to localStorage on change
    useEffect(() => {
        if (isActive && startTime) {
            const dataToStore: WorkoutSession = {
                name,
                templateId,
                startTime,
                exercises,
                activeRest: activeRest ? {
                    exerciseIndex: activeRest.exerciseIndex,
                    setIndex: activeRest.setIndex,
                    remaining: activeRest.remaining,
                    total: activeRest.total,
                    timestamp: Date.now(),
                } : null,
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
        } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    }, [isActive, name, templateId, startTime, exercises, activeRest]);

    const hasActiveRest = !!activeRest;

    // Timer Effect
    useEffect(() => {
        if (!isActive && !hasActiveRest) {
            return;
        }

        const interval = setInterval(() => {
            const currentStartTime = stateRef.current.startTime;

            if (isActive && currentStartTime) {
                const diffMs = Date.now() - new Date(currentStartTime).getTime();
                setElapsedSeconds(Math.max(0, Math.floor(diffMs / 1000)));
            }

            if (hasActiveRest) {
                setActiveRest((currentRest) => {
                    if (!currentRest) {
return null;
}

                    if (currentRest.remaining <= 1) {
                        toast.info('Rest finished!');

                        return null;
                    }

                    return {
                        ...currentRest,
                        remaining: currentRest.remaining - 1,
                    };
                });
            }
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [isActive, startTime, hasActiveRest]);

    const executeStartWorkout = (initialData?: {
        name: string;
        templateId: number | null;
        exercises: {
            exercise_id: number | null;
            name: string;
            sets: { weight: number | string; reps: number | string; unit?: string }[];
            restSeconds?: number;
        }[];
    } | null) => {
        const defaultName = getDefaultWorkoutName();
        const workoutName = initialData?.name || defaultName;
        const nowStr = new Date().toISOString();

        const activeExercises: ActiveExercise[] = (initialData?.exercises || []).map((ex) => ({
            exercise_id: ex.exercise_id,
            name: ex.name,
            restSeconds: ex.restSeconds !== undefined ? ex.restSeconds : 120,
            sets: ex.sets.map((s) => ({
                weight: s.weight,
                reps: s.reps,
                unit: s.unit || 'kg',
                isFinished: false,
            })),
        }));

        setName(workoutName);
        setTemplateId(initialData?.templateId || null);
        setStartTime(nowStr);
        setExercises(activeExercises);
        setIsActive(true);
        setIsExpanded(true);
        setElapsedSeconds(0);
        setActiveRest(null);

        toast.success(`Started "${workoutName}"!`);
    };

    const startWorkout = (initialData?: {
        name: string;
        templateId: number | null;
        exercises: {
            exercise_id: number | null;
            name: string;
            sets: { weight: number | string; reps: number | string; unit?: string }[];
            restSeconds?: number;
        }[];
    } | null) => {
        if (isActive) {
            setPendingWorkout({ initialData: initialData !== undefined ? initialData : null });

            return;
        }

        executeStartWorkout(initialData);
    };

    const updateWorkoutName = (newName: string) => {
        setName(newName);
    };

    const addActiveExercise = (exerciseId: number | null, exerciseName: string) => {
        setExercises((prev) => [
            ...prev,
            {
                exercise_id: exerciseId,
                name: exerciseName,
                restSeconds: 120,
                sets: [{ weight: 60, reps: 10, unit: 'kg', isFinished: false }],
            },
        ]);
        toast.message(`Added ${exerciseName} to workout`);
    };


    const removeActiveExercise = (exerciseIndex: number) => {
        const removed = exercises[exerciseIndex];

        if (removed) {
            toast.message(`Removed ${removed.name}`);
        }

        setExercises((prev) => prev.filter((_, idx) => idx !== exerciseIndex));
    };

    const addActiveSet = (exerciseIndex: number) => {
        setExercises((prev) =>
            prev.map((ex, idx) => {
                if (idx !== exerciseIndex) {
return ex;
}

                const lastSet = ex.sets[ex.sets.length - 1];
                const newSet = {
                    weight: lastSet ? lastSet.weight : 60,
                    reps: lastSet ? lastSet.reps : 10,
                    unit: lastSet ? lastSet.unit : 'kg',
                    isFinished: false,
                };

                return {
                    ...ex,
                    sets: [...ex.sets, newSet],
                };
            })
        );
    };

    const removeActiveSet = (exerciseIndex: number, setIndex: number) => {
        setExercises((prev) =>
            prev.map((ex, idx) => {
                if (idx !== exerciseIndex) {
return ex;
}

                return {
                    ...ex,
                    sets: ex.sets.filter((_, sIdx) => sIdx !== setIndex),
                };
            })
        );
    };

    const updateActiveSet = (exerciseIndex: number, setIndex: number, fields: Partial<ActiveSet>) => {
        setExercises((prev) =>
            prev.map((ex, idx) => {
                if (idx !== exerciseIndex) {
return ex;
}

                return {
                    ...ex,
                    sets: ex.sets.map((s, sIdx) => {
                        if (sIdx !== setIndex) {
return s;
}

                        return { ...s, ...fields };
                    }),
                };
            })
        );
    };

    const toggleSetCompleted = (exerciseIndex: number, setIndex: number) => {
        let restSec = 0;
        let exerciseName = '';

        setExercises((prev) => {
            const exercise = prev[exerciseIndex];
            const currentSet = exercise?.sets[setIndex];

            if (currentSet && !currentSet.isFinished) {
                restSec = exercise.restSeconds !== undefined ? exercise.restSeconds : 120;
                exerciseName = exercise.name;
            }

            return prev.map((ex, idx) => {
                if (idx !== exerciseIndex) {
                    return ex;
                }

                return {
                    ...ex,
                    sets: ex.sets.map((s, sIdx) => {
                        if (sIdx !== setIndex) {
                            return s;
                        }

                        return { ...s, isFinished: !s.isFinished };
                    }),
                };
            });
        });

        if (restSec > 0) {
            setActiveRest({
                exerciseIndex,
                setIndex,
                remaining: restSec,
                total: restSec,
            });
            toast.info(`Rest timer started: ${restSec}s (${exerciseName})`);
        }
    };

    const updateExerciseRest = (exerciseIndex: number, seconds: number) => {
        setExercises((prev) =>
            prev.map((ex, idx) => {
                if (idx !== exerciseIndex) {
                    return ex;
                }

                return { ...ex, restSeconds: seconds };
            })
        );
        toast.message(`Updated rest time to ${seconds}s`);
    };

    const adjustActiveRest = (seconds: number) => {
        let exIndex = -1;
        setActiveRest((currentRest) => {
            if (!currentRest) {
                return null;
            }

            const newRemaining = Math.max(0, currentRest.remaining + seconds);

            if (newRemaining <= 0) {
                return null;
            }

            exIndex = currentRest.exerciseIndex;

            return {
                ...currentRest,
                remaining: newRemaining,
                total: Math.max(currentRest.total, newRemaining),
            };
        });

        if (exIndex !== -1) {
            setExercises((prev) =>
                prev.map((ex, idx) => {
                    if (idx !== exIndex) {
                        return ex;
                    }

                    const currentRestSec = ex.restSeconds !== undefined ? ex.restSeconds : 120;

                    return { ...ex, restSeconds: Math.max(15, currentRestSec + seconds) };
                })
            );
            toast.message(seconds > 0 ? `+${seconds}s added & saved to exercise` : `${seconds}s removed & saved to exercise`);
        }
    };

    const skipActiveRest = () => {
        setActiveRest(null);
        toast.message('Rest timer skipped');
    };

    const cancelWorkout = () => {
        setIsActive(false);
        setIsExpanded(false);
        setName('');
        setTemplateId(null);
        setStartTime(null);
        setExercises([]);
        setElapsedSeconds(0);
        setActiveRest(null);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        toast.error('Workout cancelled');
    };

    const finishWorkout = () => {
        if (!startTime) {
            return;
        }

        // Collect logged data
        const logData = {
            name: name || getDefaultWorkoutName(),
            workout_template_id: templateId,
            started_at: startTime,
            completed_at: new Date().toISOString(),
            exercises: exercises.map((ex) => ({
                exercise_id: ex.exercise_id,
                name: ex.name,
                sets: ex.sets.map((s) => ({
                    weight: s.weight === '' ? null : s.weight,
                    reps: s.reps === '' ? null : s.reps,
                    isFinished: s.isFinished,
                    is_completed: s.isFinished,
                })),
            })),
        };

        // Send backend POST request
        router.post('/Workout/session', logData, {
            onSuccess: () => {
                setIsActive(false);
                setIsExpanded(false);
                setName('');
                setTemplateId(null);
                setStartTime(null);
                setExercises([]);
                setElapsedSeconds(0);
                setActiveRest(null);
                localStorage.removeItem(LOCAL_STORAGE_KEY);
                toast.success('Workout logged successfully!');
            },
            onError: (err) => {
                console.error(err);
                toast.error('Failed to log workout session. Please try again.');
            },
        });
    };

    return (
        <WorkoutContext.Provider
            value={{
                isActive,
                isExpanded,
                name,
                templateId,
                startTime,
                exercises,
                elapsedSeconds,
                activeRest,
                startWorkout,
                setIsExpanded,
                updateWorkoutName,
                addActiveExercise,
                removeActiveExercise,
                addActiveSet,
                removeActiveSet,
                updateActiveSet,
                toggleSetCompleted,
                updateExerciseRest,
                adjustActiveRest,
                skipActiveRest,
                cancelWorkout,
                finishWorkout,
            }}
        >
            {children}
            {pendingWorkout && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-5 bg-neutral-955/80 bg-neutral-950/80 backdrop-blur-md">
                    <div className="w-full max-w-sm rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl text-center space-y-4">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-base font-extrabold text-neutral-100">
                                Start new workout?
                            </h3>
                            <p className="text-xs text-neutral-400 leading-relaxed">
                                You already have an active workout session in progress. Starting a new session will discard your current active workout.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setPendingWorkout(null)}
                                className="flex-1 rounded-2xl border border-neutral-850 bg-neutral-800/40 py-2.5 text-xs font-bold text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors"
                            >
                                Keep current
                            </button>
                            <button
                                onClick={() => {
                                    const data = pendingWorkout.initialData;
                                    setPendingWorkout(null);
                                    executeStartWorkout(data);
                                }}
                                className="flex-1 rounded-2xl bg-sky-500 py-2.5 text-xs font-bold text-white hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/10"
                            >
                                Start new
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </WorkoutContext.Provider>
    );
}

export function useWorkout() {
    const context = useContext(WorkoutContext);

    if (context === undefined) {
        throw new Error('useWorkout must be used within a WorkoutProvider');
    }

    return context;
}
