import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { BoardCard } from "./board-card";
import { Task, Status } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BoardColumn({
    id,
    title,
    tasks,
    isOver,
    activeTask
}: {
    id: Status;
    title: string;
    tasks: Task[];
    isOver?: boolean;
    activeTask?: Task | null;
}) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div className="flex h-full min-w-[280px] w-80 flex-col rounded-xl bg-muted/30 border border-border/50">
            <div className="p-4 font-semibold flex items-center justify-between border-b border-border/30">
                <span>{title}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{tasks.length}</span>
            </div>
            <div ref={setNodeRef} className="flex flex-1 flex-col gap-3 p-3 overflow-y-auto">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <BoardCard key={task.id} task={task} />
                    ))}

                    {/* Ghost Slot Preview */}
                    {isOver && activeTask && activeTask.status !== id && (
                        <div className="opacity-30 border-2 border-dashed border-primary/50 animate-pulse pointer-events-none">
                            <BoardCard task={activeTask} />
                        </div>
                    )}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="h-24 w-full border-2 border-dashed border-border/30 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                        Empty
                    </div>
                )}
            </div>
        </div>
    );
}
