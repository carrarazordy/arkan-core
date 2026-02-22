"use client";

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { BoardColumn } from "./board-column";
import { BoardCard } from "./board-card";
import { useState, useEffect } from "react";
import { Task, Status } from "@/lib/types";
import { useTaskStore } from "@/store/useTaskStore";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";
import { createPortal } from "react-dom";

export function Board() {
    const { tasks, updateTask } = useTaskStore();
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [overId, setOverId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        const task = tasks.find((t) => t.id === active.id);
        if (task) {
            setActiveTask(task);
            ArkanAudio.playFast('key_tick');
        }
    }

    function handleDragOver(event: any) {
        setOverId(event.over?.id || null);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveTask(null);
        setOverId(null);

        if (!over) {
            ArkanAudio.playFast('thump');
            return;
        }

        const taskId = active.id as string;
        const overId = over.id as string;

        let newStatus: Status | undefined;

        if (['todo', 'in-progress', 'completed'].includes(overId)) {
            newStatus = overId as Status;
        } else {
            const overTask = tasks.find(t => t.id === overId);
            if (overTask) {
                newStatus = overTask.status;
            }
        }

        if (newStatus) {
            const currentTask = tasks.find(t => t.id === taskId);
            if (currentTask && currentTask.status !== newStatus) {
                await updateTask(taskId, { status: newStatus });
                ArkanAudio.playFast('clack');
            }
        }
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full gap-6 overflow-x-auto pb-4 custom-scrollbar">
                <BoardColumn id="todo" title="Protocol_Todo" tasks={tasks.filter((t) => t.status === "todo")} isOver={overId === 'todo'} activeTask={activeTask} />
                <BoardColumn id="in-progress" title="Active_Execution" tasks={tasks.filter((t) => t.status === "in-progress")} isOver={overId === 'in-progress'} activeTask={activeTask} />
                <BoardColumn id="completed" title="Historical_Archive" tasks={tasks.filter((t) => t.status === "completed")} isOver={overId === 'completed'} activeTask={activeTask} />
            </div>

            {mounted && (
                createPortal(
                    <DragOverlay>
                        {activeTask ? <BoardCard task={activeTask} /> : null}
                    </DragOverlay>,
                    document.body
                )
            )}
        </DndContext>
    );
}
