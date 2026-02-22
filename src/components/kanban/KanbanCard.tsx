import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";

interface KanbanCardProps {
    task: Task;
    onClick?: (task: Task) => void;
}

export function KanbanCard({ task, onClick }: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-[#121208] border border-primary/60 p-3 rounded-lg opacity-50 h-[100px] relative z-50 ring-2 ring-primary"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => {
                ArkanAudio.play('ui_confirm_ping');
                onClick?.(task);
            }}
            onMouseEnter={() => ArkanAudio.play('ui_hover_shimmer')}
            className="bg-[#121208] border border-white/5 hover:border-primary/40 p-3 rounded-lg transition-all group cursor-grab active:cursor-grabbing relative relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-mono text-primary/40 uppercase">
                    ID: {task.id.slice(-4)}
                </span>
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase",
                            task.priority === "critical"
                                ? "bg-red-900/40 text-red-500 border border-red-500/20"
                                : task.priority === "high"
                                    ? "bg-orange-900/40 text-orange-500"
                                    : "bg-primary/20 text-primary"
                        )}
                    >
                        {task.priority}
                    </span>
                    <GripVertical className="h-3 w-3 text-white/10 group-hover:text-primary/40 transition-colors" />
                </div>

            </div>

            <h4 className="text-xs font-bold text-slate-200 group-hover:text-primary mb-3 leading-tight line-clamp-2">
                {task.title}
            </h4>

            <div className="space-y-1.5 mt-auto">
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full w-[0%] transition-all duration-500",
                            task.status === "completed" ? "w-full bg-primary" : "w-[45%] bg-primary/40"
                        )}
                    ></div>
                </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
    );
}
