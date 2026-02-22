import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/lib/types";
import { usePriorityEscalation } from "@/store/usePriorityEscalation";
import { cn } from "@/lib/utils";

export function BoardCard({ task }: { task: Task }) {
    const { escalatedTaskIds } = usePriorityEscalation();
    const isEscalated = escalatedTaskIds.has(task.id);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none group">
            <Card className={cn(
                "cursor-grab active:cursor-grabbing transition-all duration-300 bg-black/40 backdrop-blur-md border",
                isEscalated
                    ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse"
                    : "border-primary/20 hover:border-primary/50 shadow-sm"
            )}>
                <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <span className="text-[8px] font-mono text-primary/40 uppercase">ID: {task.id.slice(-4)}</span>
                        {task.priority === 'high' && <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter">High_Priority</span>}
                    </div>
                    <div className="font-bold text-sm leading-tight text-white group-hover:text-primary tracking-tight transition-colors uppercase">
                        {task.title}
                    </div>
                    {isEscalated && (
                        <div className="text-[8px] font-bold text-red-500 animate-pulse uppercase mt-1">
                            [ E S C A L A T E D ]
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
