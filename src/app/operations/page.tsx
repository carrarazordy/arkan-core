"use client";

import { useEffect, useState } from "react";
import {
    Terminal, FolderOpen, ChevronRight,
    Plus, AlertTriangle, Activity, Box, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/store/useTaskStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useSystemLogStore } from "@/store/useSystemLogStore";
import { useHardwareMetrics } from "@/store/useHardwareMetrics";
import { usePriorityEscalation } from "@/store/usePriorityEscalation";
import { useFileIndex } from "@/store/useFileIndex";
import { useLogisticsStore } from "@/store/useLogisticsStore";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";
import { useDialogStore } from "@/store/useDialogStore";
import { Task } from "@/lib/types";
import { LogisticsNode } from "@/components/logistics/LogisticsNode";

export default function OperationsPage() {
    const { tasks, isLoading: tasksLoading, fetchTasks, subscribeToTasks, bloomTaskId } = useTaskStore();
    const { projects, selectedProjectId } = useProjectStore();
    const { addLog } = useSystemLogStore();
    const { metrics } = useHardwareMetrics();
    const { escalatedTaskIds } = usePriorityEscalation();
    const { nodes: fileNodes, rootIds } = useFileIndex();
    const { items: logisticsItems } = useLogisticsStore();
    const [view, setView] = useState<'OPERATIONS' | 'LOGISTICS'>('OPERATIONS');

    const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

    useEffect(() => {
        fetchTasks(selectedProjectId || undefined);
        const unsubscribe = subscribeToTasks(selectedProjectId || undefined);
        return () => unsubscribe();
    }, [fetchTasks, subscribeToTasks, selectedProjectId]);

    const handleTaskClick = (task: Task) => {
        addLog(`ACCESS_GRANTED: TASK_STREAM/${task.id}`, 'user');
        // Logic for expansion could go here, but for now just logging
    };

    const handleHover = (id: string, type: string) => {
        addLog(`PROBE_DATA: ${type.toUpperCase()}_SCAN [ID: ${id}]`, 'status');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] -m-8 relative arkan-container overflow-hidden tactical-grid transition-all duration-500">
            {/* Header Section */}
            <header className="border-b border-primary/30 bg-black/90 backdrop-blur-xl sticky top-0 z-40 px-6 py-4 shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 border border-primary flex items-center justify-center bg-primary/10 shadow-[0_0_15px_rgba(255,255,0,0.3)]">
                            <Terminal className="text-primary h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-widest text-primary uppercase font-jetbrains">
                                PROJECT_OPERATIONS // <span className="text-white">{activeProject?.technicalId || 'ARKAN_CORE'}</span>
                            </h1>
                            <p className="text-[10px] text-primary/60 tracking-tighter uppercase font-mono">Status: System Operational // Node: Tactical_V2</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6 text-xs font-mono">
                        <div className="flex flex-col items-end">
                            <span className="text-primary/50 text-[10px]">UPTIME</span>
                            <span className="text-white tracking-widest">142:32:04</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-primary/50 text-[10px]">LATENCY</span>
                            <span className="text-primary font-bold">{metrics.latency}MS</span>
                        </div>
                    </div>
                </div>
                {/* Global Progress Bar */}
                <div className="w-full h-1 bg-primary/10 relative overflow-hidden rounded-full border border-primary/5">
                    <div
                        className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_10px_#ffff00] transition-all duration-1000"
                        style={{ width: `${activeProject?.progress || 0}%` }}
                    ></div>
                </div>
            </header>

            {/* Main Command Center Layout */}
            <main className="flex-1 flex overflow-hidden p-6 gap-6 z-10 relative">
                {/* 12-Column Grid Guide (Invisible but structure-providing) */}
                <div className="absolute inset-x-6 top-6 bottom-6 grid grid-cols-12 gap-6 pointer-events-none opacity-0">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-full border-x border-primary/[0.02]"></div>
                    ))}
                </div>

                {/* Left Column: File Explorer */}
                <aside className="w-72 flex flex-col gap-4 shrink-0">
                    <div className="flex-1 bg-black/40 border border-primary/20 rounded-lg flex flex-col overflow-hidden">
                        <div className="p-3 border-b border-primary/20 bg-primary/5 flex items-center justify-between">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-primary">File_System</span>
                            <FolderOpen className="h-3 w-3 text-primary" />
                        </div>
                        <div className="flex-1 p-3 overflow-y-auto custom-scrollbar font-mono text-[11px]">
                            {rootIds.map(nodeId => {
                                const node = fileNodes[nodeId];
                                return (
                                    <div key={nodeId} className="space-y-1">
                                        <div className="flex items-center space-x-2 text-primary cursor-pointer hover:bg-primary/10 p-1 rounded transition-colors group">
                                            {node.type === 'folder' ? <ChevronRight className="h-3 w-3" /> : <div className="w-3" />}
                                            <div className="w-3 h-3 border border-primary/60 flex items-center justify-center">
                                                <div className={cn("w-1.5 h-1.5", node.type === 'folder' ? "bg-primary/40" : "bg-primary")}></div>
                                            </div>
                                            <span className="uppercase truncate">{node.name}</span>
                                        </div>
                                        {node.children && node.children.length > 0 && (
                                            <div className="pl-4 border-l border-primary/10 ml-1.5 space-y-1 mt-1">
                                                {node.children.map(childId => (
                                                    <div key={childId} className="flex items-center space-x-2 text-white/40 cursor-pointer hover:text-primary p-1 rounded transition-colors group">
                                                        <div className="w-2 h-[1px] bg-primary/20"></div>
                                                        <span className="uppercase truncate">{fileNodes[childId]?.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {rootIds.length === 0 && (
                                <div className="text-[10px] text-primary/30 text-center py-8 italic uppercase tracking-widest">
                                    NoNode_Detected
                                </div>
                            )}
                        </div>
                        <div className="p-3 bg-primary/5 border-t border-primary/20">
                            <div className="flex items-center justify-between text-[10px] text-primary/60 mb-2 font-mono">
                                <span className="uppercase">STORAGE_USED</span>
                                <span>42.8 GB / 100 GB</span>
                            </div>
                            <div className="h-1 bg-primary/10 rounded-full">
                                <div className="h-full bg-primary/60" style={{ width: '42%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Mini HUD */}
                    <div className="h-48 bg-black/40 border border-primary/20 rounded-lg p-3 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary opacity-[0.02] pointer-events-none"></div>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-primary block mb-3">Linked_Signals</span>
                        <div className="space-y-3 font-mono">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[9px] text-white/50 uppercase">NODE_LATENCY</span>
                                <span className="text-[10px] text-primary">{metrics.latency}ms</span>
                            </div>
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[9px] text-white/50 uppercase">SYNC_STATUS</span>
                                <span className="text-[10px] text-green-400">NOMINAL</span>
                            </div>
                            <div className="w-full h-16 relative overflow-hidden rounded border border-primary/10">
                                <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                                    <Activity className="text-primary/40 h-8 w-8 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Middle Column: Task Stream / Logistics */}
                <section className="flex-1 flex flex-col gap-4 overflow-hidden relative">
                    <div className="flex items-center justify-between shrink-0">
                        <div className="flex bg-black/40 p-1 border border-primary/20 rounded-lg">
                            <button
                                onClick={() => setView('OPERATIONS')}
                                className={cn(
                                    "px-4 py-1 text-[10px] font-bold tracking-widest uppercase transition-all",
                                    view === 'OPERATIONS' ? "bg-primary text-black shadow-[0_0_15px_#ffff00]" : "text-primary/40 hover:text-primary"
                                )}
                            >
                                Operations
                            </button>
                            <button
                                onClick={() => setView('LOGISTICS')}
                                className={cn(
                                    "px-4 py-1 text-[10px] font-bold tracking-widest uppercase transition-all",
                                    view === 'LOGISTICS' ? "bg-primary text-black shadow-[0_0_15px_#ffff00]" : "text-primary/40 hover:text-primary"
                                )}
                            >
                                Logistics
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onMouseEnter={() => ArkanAudio.play('ui_hover_shimmer')}
                                onClick={() => {
                                    ArkanAudio.play('system_execute_clack');
                                    useDialogStore.getState().openDialog({
                                        title: 'INITIALIZE_NEW_OPERATION',
                                        placeholder: 'ENTER_OPERATION_NAME...',
                                        confirmLabel: 'INITIALIZE',
                                        onConfirm: async (value) => {
                                            if (!value) return;
                                            console.log("Initializing Operation:", value);

                                            // Execute creation via TaskStore
                                            try {
                                                await useTaskStore.getState().addTask({
                                                    title: value.toUpperCase(),
                                                    status: 'todo',
                                                    priority: 'medium',
                                                    projectId: selectedProjectId || undefined, // Default to current project or inbox
                                                    description: 'Manual entry via Operations Console'
                                                });

                                                ArkanAudio.play('processing_blip');
                                                addLog(`OP_CREATED: ${value.toUpperCase()}`, 'status');
                                            } catch (error) {
                                                console.error("Task creation failed:", error);
                                                ArkanAudio.play('error');
                                            }
                                        }
                                    });
                                }}
                                className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-primary/10 border border-primary/20 text-primary uppercase font-bold tracking-[0.2em] transition-all duration-300 hover:bg-primary hover:text-black hover:shadow-[0_0_20px_rgba(255,255,0,0.6)] active:scale-95"
                            >
                                <Plus className="h-5 w-5" />
                                <span>New_Entry</span>
                                <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/50 transition-all duration-500 scale-110 opacity-0 group-hover:opacity-100 rounded-sm"></div>
                            </button>
                        </div>
                    </div>

                    {view === 'OPERATIONS' ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
                            {/* Priority Escalation Notice */}
                            {escalatedTaskIds.size > 0 && (
                                <div className="mb-6 bg-red-500/10 border border-red-500/30 p-4 flex items-center gap-4 animate-pulse">
                                    <AlertTriangle className="text-red-500 h-6 w-6" />
                                    <div>
                                        <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest">Priority_Escalation_Protocol_Active</h4>
                                        <p className="text-[10px] text-red-500/70 uppercase">{escalatedTaskIds.size} high-priority nodes require immediate synchronization.</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {tasksLoading ? (
                                    <div className="col-span-full h-64 flex flex-col items-center justify-center border border-primary/10 bg-primary/5">
                                        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                                        <span className="text-[10px] font-bold text-primary animate-pulse tracking-widest uppercase">Syncing_Nodes...</span>
                                    </div>
                                ) : tasks.filter(t => t.isVisible !== false).map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => handleTaskClick(task)}
                                        onMouseEnter={() => handleHover(task.id, 'task')}
                                        className={cn(
                                            "group relative bg-transparent border p-5 transition-all duration-300 cursor-pointer overflow-hidden",
                                            bloomTaskId === task.id && "animate-neon-bloom z-50",
                                            task.priority === 'critical'
                                                ? "animate-critical-pulse border-red-600 shadow-[0_0_15px_rgba(255,0,0,0.3)]"
                                                : escalatedTaskIds.has(task.id)
                                                    ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse"
                                                    : task.priority === 'high'
                                                        ? "border-red-500/20 hover:border-red-500/50"
                                                        : "border-white/5 hover:border-primary/50",
                                            !task.isVisible && "invisible pointer-events-none"
                                        )}
                                    >
                                        {/* Scanning Line Animation for In Progress */}
                                        {task.status === 'in-progress' && (
                                            <div className="absolute inset-x-0 top-0 h-[1px] bg-primary/30 shadow-[0_0_10px_#ffff00] animate-scan-y z-10 pointer-events-none"></div>
                                        )}

                                        <div className="flex items-start justify-between mb-4 relative z-20">
                                            <div className="flex items-center space-x-2">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    task.status === 'completed' ? "bg-green-500 shadow-[0_0_8px_#22c55e]" :
                                                        task.status === 'in-progress' ? "bg-primary animate-pulse shadow-[0_0_8px_#ffff00]" :
                                                            "bg-white/20"
                                                )}></div>
                                                <span className="text-[10px] text-white/40 font-mono">ID: {task.id.substring(0, 8)}</span>
                                            </div>
                                            <h3 className={cn(
                                                "text-lg font-medium leading-tight group-hover:text-primary transition-colors font-jetbrains",
                                                task.priority === 'critical' ? "text-red-500 neon-red-glow" :
                                                    task.priority === 'high' ? "text-red-200" : "text-white/80"
                                            )}>
                                                {task.title}
                                            </h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
                            {/* Logistics Header */}
                            <div className="mb-6 bg-primary/5 border border-primary/20 p-4 relative overflow-hidden">
                                <h4 className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-1">Global_Supply_Chain</h4>
                                <p className="text-[9px] text-primary/40 uppercase tracking-widest font-mono">Active Monitoring // Acquired items relocated to archive</p>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
                                    <Box className="h-12 w-12 text-primary" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {logisticsItems.length === 0 ? (
                                    <div className="h-64 flex flex-col items-center justify-center border border-primary/10 bg-primary/5 rounded-lg opacity-40 italic uppercase text-[10px] tracking-widest text-primary">
                                        No_Mission_Checklists_Found
                                    </div>
                                ) : (
                                    logisticsItems.map(item => (
                                        <LogisticsNode key={item.id} item={item} />
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </section>

                {/* Right Column: Metrics HUD */}
                <aside className="w-80 flex flex-col gap-4 shrink-0">
                    <div className="bg-black/40 border border-primary/20 rounded-lg p-5">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-primary block mb-6">Execution_Metrics</span>
                        <div className="flex justify-around mb-8 relative text-center">
                            <div className="relative w-32 h-32 flex items-center justify-center mx-auto">
                                <svg className="w-full h-full -rotate-90">
                                    <circle className="text-primary/10" cx="64" cy="64" r="50" fill="transparent" stroke="currentColor" strokeWidth="6"></circle>
                                    <circle
                                        className="text-primary shadow-[0_0_15px_#ffff00] transition-all duration-1000"
                                        cx="64" cy="64" r="50" fill="transparent" stroke="currentColor" strokeWidth="6"
                                        strokeDasharray="314"
                                        strokeDashoffset={314 - (314 * (activeProject?.progress || 0)) / 100}
                                    ></circle>
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-2xl font-bold text-white tracking-tighter uppercase">{activeProject?.progress || 0}%</span>
                                    <span className="text-[9px] text-white/40 uppercase font-mono">Completed</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-primary/5 p-4 border border-primary/10 rounded">
                                <div className="flex justify-between text-[10px] text-primary/60 mb-3 uppercase tracking-widest font-mono">
                                    <span>Efficiency_Index</span>
                                    <span className="text-primary font-bold">0.94</span>
                                </div>
                                <div className="flex space-x-1.5 h-6 items-end">
                                    {[80, 60, 95, 40, 65, 75, 55].map((h, i) => (
                                        <div key={i} className="flex-1 bg-primary/60 hover:bg-primary transition-all rounded-t-xs" style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 bg-black/40 border border-primary/20 rounded-lg p-5 flex flex-col overflow-hidden">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-primary block mb-5">Current_Session_Meta</span>
                        <div className="flex-1 space-y-4 font-mono text-[10px]">
                            <div className="flex justify-between border-b border-primary/10 pb-2">
                                <span className="text-white/40 uppercase">Project_ID</span>
                                <span className="text-white">{activeProject?.technicalId || 'ARKAN_CORE'}</span>
                            </div>
                            <div className="flex justify-between border-b border-primary/10 pb-2">
                                <span className="text-white/40 uppercase">Active_Flows</span>
                                <span className="text-white">{tasks.length}</span>
                            </div>
                            <div className="flex justify-between border-b border-primary/10 pb-2">
                                <span className="text-white/40 uppercase">Memory_Util</span>
                                <span className="text-primary font-bold">{metrics.ram}GB</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            {/* Decorative Decorative UI Overlay (Scanlines) */}
            <div className="absolute inset-0 pointer-events-none z-50">
                <div className="absolute top-1/4 left-0 w-full h-[1px] bg-primary/5 shadow-[0_0_15px_rgba(255,b,0,0.1)]"></div>
                <div className="absolute top-3/4 left-0 w-full h-[1px] bg-primary/5 shadow-[0_0_15px_rgba(255,255,0,0.05)] opacity-50"></div>
            </div>
        </div>
    );
}
