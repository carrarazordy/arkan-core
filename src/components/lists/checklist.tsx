"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChecklistItem {
    id: string;
    text: string;
    checked: boolean;
}

interface ChecklistProps {
    items: ChecklistItem[];
    onToggle: (id: string, checked: boolean) => void;
    type?: "shopping" | "travel";
}

export function Checklist({ items, onToggle, type = "shopping" }: ChecklistProps) {
    // Local state removed, controlled by parent via useTaskStore

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className={cn(
                            "group flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50 transition-all duration-300",
                            item.checked && "opacity-50 bg-muted/20"
                        )}
                    >
                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                            <button
                                onClick={() => onToggle(item.id, !item.checked)}
                                className={cn(
                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                                    item.checked
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-muted-foreground hover:border-primary"
                                )}
                            >
                                {item.checked && <Check className="h-3.5 w-3.5" />}
                            </button>
                            <span className={cn("text-sm truncate", item.checked && "line-through text-muted-foreground")}>
                                {item.text}
                            </span>
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed border-border/30 rounded-lg">
                        Your list is empty.
                    </div>
                )}
            </div>
        </div>
    );
}
