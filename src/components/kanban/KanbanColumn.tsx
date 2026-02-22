import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Task, Status } from "@/lib/types";
import { KanbanCard } from "./KanbanCard";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
    id: Status; // Status is the column ID
    title: string;
    tasks: Task[];
    color?: string;
    onTaskClick?: (task: Task) => void;
}

export function KanbanColumn({ id, title, tasks, onTaskClick }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div className="flex-1 min-w-[320px] bg-[#1a1a0a]/40 border border-primary/10 rounded-xl flex flex-col neon-border relative overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-primary/10 flex items-center justify-between bg-[#151508]/60 backdrop-blur-md sticky top-0 z-10">
                <h2 className="text-[11px] font-bold tracking-widest text-primary uppercase">
                    [{title}]
                </h2>
                <span className="text-[10px] font-mono text-primary/60 bg-primary/10 px-2 py-0.5 rounded border border-primary/10">
                    {tasks.length.toString().padStart(2, '0')}
                </span>
            </div>

            {/* Droppable Area */}
            <div ref={setNodeRef} className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar h-full">
                <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <KanbanCard key={task.id} task={task} onClick={onTaskClick} />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-lg opacity-20 hover:opacity-40 transition-opacity">
                        <span className="text-[10px] uppercase font-mono tracking-widest">Zone_Empty</span>
                    </div>
                )}
            </div>
        </div>
    );
}
