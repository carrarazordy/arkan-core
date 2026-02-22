import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface TaskItemProps {
    task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
    const isCompleted = task.status === 'completed';

    return (
        <div className="flex items-center gap-3 rounded-lg border border-border/40 p-3 transition-colors hover:bg-muted/50">
            <button className={cn("text-muted-foreground hover:text-primary transition-colors", isCompleted && "text-primary")}>
                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
            </button>
            <div className="flex-1">
                <div className={cn("font-medium", isCompleted && "line-through text-muted-foreground")}>
                    {task.title}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {task.projectId && <span>Project A</span>} {/* Mock Project Name */}
                    {task.priority === 'high' && <span className="text-red-500">High</span>}
                </div>
            </div>
            <div className={cn(
                "px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider",
                task.status === 'in-progress' ? "bg-blue-500/10 text-blue-500" :
                    task.status === 'completed' ? "bg-green-500/10 text-green-500" :
                        "bg-muted text-muted-foreground"
            )}>
                {task.status.replace('-', ' ')}
            </div>
        </div>
    );
}
