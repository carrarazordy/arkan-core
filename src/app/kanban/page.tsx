"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

import { useTaskStore } from "@/store/useTaskStore";
import { useDialogStore } from "@/store/useDialogStore";
import { Task, Status } from "@/lib/types";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { KanbanCard } from "@/components/kanban/KanbanCard";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";

export default function KanbanPage() {
    const { tasks, fetchTasks, updateTask, addTask } = useTaskStore();
    const [activeDragTask, setActiveDragTask] = useState<Task | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        fetchTasks();
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, [fetchTasks]);

    // Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent accidental drags
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Columns
    const columns: { id: Status; title: string }[] = [
        { id: 'todo', title: 'TO_DO' },
        { id: 'in-progress', title: 'IN_PROGRESS' },
        { id: 'completed', title: 'COMPLETED' }
    ];

    // Memoize tasks per column
    const tasksByStatus = useMemo(() => {
        const acc: Record<Status, Task[]> = {
            'todo': [],
            'in-progress': [],
            'completed': []
        };

        tasks.forEach(task => {
            // Normalize status to match columns
            const status = task.status;
            // Type guard to ensure we only push valid statuses
            if (status === 'todo' || status === 'in-progress' || status === 'completed') {
                acc[status].push(task);
            } else {
                // Fallback for unknown/legacy statuses
                acc['todo'].push(task);
            }
        });
        return acc;
    }, [tasks]);


    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find(t => t.id === active.id);
        if (task) {
            setActiveDragTask(task);
            ArkanAudio.playFast('ui_hover_shimmer');
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragTask(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find the active task
        const activeTask = tasks.find(t => t.id === activeId);
        if (!activeTask) return;

        // Determine if dropped over a column or a card
        let newStatus: Status | undefined;

        // Check if `overId` is a column ID
        const isOverColumn = columns.some(col => col.id === overId);

        if (isOverColumn) {
            newStatus = overId as Status;
        } else {
            // Dropped over another card, find that card's status
            const overTask = tasks.find(t => t.id === overId);
            if (overTask) {
                newStatus = overTask.status;
            }
        }

        if (newStatus && newStatus !== activeTask.status) {
            ArkanAudio.playFast('system_execute_clack');
            // Optimistic update handled by store if we wanted, 
            // but we'll await for reliability or just fire and forget.
            await updateTask(activeId, { status: newStatus });
        } else {
            ArkanAudio.playFast('thump'); // Drop without change
        }
    };

    const handleInitializeTask = () => {
        ArkanAudio.play('system_execute_clack');
        useDialogStore.getState().openDialog({
            title: "INITIALIZE_SUBROUTINE // ENTER_ID",
            placeholder: "TASK_DESIGNATION...",
            confirmLabel: "INITIALIZE",
            onConfirm: async (title) => {
                if (title) {
                    ArkanAudio.play('system_execute_clack');
                    await addTask({
                        title: title.toUpperCase(),
                        status: 'todo',
                        priority: 'medium',
                        projectId: undefined // Default project context
                    });
                }
            }
        });
    };



    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    if (!mounted) {
        return <div className="p-8 text-primary/50 text-xs font-mono animate-pulse">INITIALIZING_TACTICAL_BOARD...</div>;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] relative">

            {/* Page Header */}
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                        KANBAN BOARD
                        <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 uppercase">Unified_View</span>
                    </h1>
                    <p className="text-slate-500 text-xs mt-1">Strategic task distribution across operational nodes</p>
                </div>
                <button
                    onClick={handleInitializeTask}
                    className="bg-primary hover:bg-primary/90 text-black px-4 py-2 rounded-lg font-bold text-xs transition-transform active:scale-95 shadow-[0_0_15px_rgba(255,255,0,0.2)] flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" /> INITIALIZE NEW TASK
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {/* Kanban Columns */}
                <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar min-h-0">
                    <KanbanColumn
                        id="todo"
                        title="TO_DO"
                        tasks={tasksByStatus['todo']}
                    />
                    <KanbanColumn
                        id="in-progress"
                        title="IN_PROGRESS"
                        tasks={tasksByStatus['in-progress']}
                    />
                    <KanbanColumn
                        id="completed"
                        title="COMPLETED"
                        tasks={tasksByStatus['completed']}
                    />
                </div>


                {mounted && typeof document !== 'undefined' && createPortal(
                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeDragTask && (
                            <KanbanCard task={activeDragTask} />
                        )}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext >

            {/* Bottom Widgets */}
            < div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0" >
                <div className="bg-[#121208] border border-white/5 p-4 rounded-lg">
                    <p className="text-[10px] text-slate-500 font-mono mb-1">DATA_STREAM</p>
                    <div className="h-10 w-full flex items-end gap-1">
                        <div className="bg-primary/20 w-full h-[20%] rounded-sm"></div>
                        <div className="bg-primary/40 w-full h-[50%] rounded-sm"></div>
                        <div className="bg-primary w-full h-[80%] rounded-sm"></div>
                        <div className="bg-primary/30 w-full h-[40%] rounded-sm"></div>
                        <div className="bg-primary/60 w-full h-[60%] rounded-sm"></div>
                    </div>
                </div>
                <div className="bg-[#121208] border border-white/5 p-4 rounded-lg flex flex-col justify-center">
                    <p className="text-[10px] text-slate-500 font-mono mb-1">LOCAL_TIME</p>
                    <p className="text-xl font-bold text-white tracking-widest">{currentTime.toLocaleTimeString()}</p>
                </div>
                <div className="bg-[#121208] border border-white/5 p-4 rounded-lg flex flex-col justify-center">
                    <p className="text-[10px] text-slate-500 font-mono mb-1">UPTIME</p>
                    <p className="text-xl font-bold text-primary tracking-widest">312:08:12</p>
                </div>
                <div className="bg-[#121208] border border-white/5 p-4 rounded-lg overflow-hidden relative group cursor-pointer">
                    <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity"></div>
                    <p className="text-[10px] text-slate-500 font-mono mb-1">QUICK_NOTES</p>
                    <p className="text-[10px] text-slate-300">New batch of neuro-chips arriving 08:00...</p>
                </div>
            </div >
        </div >
    );
}
