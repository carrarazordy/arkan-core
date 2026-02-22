"use client";

import { useProjectStore } from "@/store/useProjectStore";
import { useTaskStore } from "@/store/useTaskStore";
import { Inbox, ChevronRight, CornerDownRight, Plus, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDialogStore } from "@/store/useDialogStore";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";

export function GlobalInbox() {
    const { projects } = useProjectStore();
    const { tasks } = useTaskStore();

    // Global Inbox Items: Tasks with no project ID or linked to a "Null" project
    const inboxTasks = tasks.filter(t => !t.projectId || t.projectId === 'null' || t.projectId === 'inbox');

    const handleCollectEntropy = () => {
        ArkanAudio.play('system_execute_clack');
        useDialogStore.getState().openDialog({
            title: "ENTROPY_COLLECTION // INPUT_DATA",
            placeholder: "RAW_DATA_STREAM...",
            confirmLabel: "CAPTURE",
            onConfirm: async (title) => {
                if (title) {
                    ArkanAudio.play('system_execute_clack');
                    // Quick Add logic
                    await useTaskStore.getState().addTask({
                        title,
                        description: "Captured from Global Inbox",
                        status: "todo",
                        priority: "medium",
                        projectId: "inbox"
                    });
                }
            }
        });
    };

    return (
        <div className="flex flex-col h-full bg-black/20 border-l border-primary/10 w-80 shrink-0">
            <div className="p-4 border-b border-primary/10 bg-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Inbox className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-primary tracking-widest uppercase">Global_Inbox</span>
                </div>
                <div className="text-[10px] font-mono text-primary/40 bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                    {inboxTasks.length}_ITEMS
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                {inboxTasks.length > 0 ? (
                    inboxTasks.map((task) => (
                        <div key={task.id} className="bg-primary/5 border border-primary/10 p-3 rounded group hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden">
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-[9px] font-mono text-primary/40">ID: {task.id.slice(-4)}</span>
                                <button className="p-1 hover:bg-primary/20 rounded text-primary/40 hover:text-primary transition-colors">
                                    <Plus className="h-3 w-3" />
                                </button>
                            </div>
                            <p className="text-sm text-white/70 group-hover:text-white transition-colors mb-3 leading-tight uppercase font-medium">
                                {task.title}
                            </p>

                            <div className="flex items-center gap-2 mt-4 pt-2 border-t border-primary/5">
                                <span className="text-[8px] font-mono text-primary/40 uppercase">Route_To:</span>
                                <div className="flex-1 flex gap-1 overflow-hidden">
                                    {projects.slice(0, 2).map(p => (
                                        <button
                                            key={p.id}
                                            className="px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded text-[8px] text-primary/60 hover:text-black hover:bg-primary transition-all truncate"
                                        >
                                            {p.technicalId}
                                        </button>
                                    ))}
                                </div>
                                <ChevronRight className="h-3 w-3 text-primary/20 group-hover:text-primary transition-all" />
                            </div>

                            {/* Decorative scanline on hover */}
                            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-primary/0 group-hover:bg-primary/40 transition-all"></div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 opacity-20">
                        <Inbox className="h-8 w-8 mb-2" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-center">Protocol_Clear</span>
                    </div>
                )}
            </div>

            {/* Quick Promotion Logic Hook */}
            <div className="p-4 border-t border-primary/10 bg-primary/5">
                <button
                    onClick={handleCollectEntropy}
                    className="w-full py-2 bg-primary/10 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
                >
                    Collect_Entropy
                </button>
            </div>
        </div>
    );
}
