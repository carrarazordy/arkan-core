"use client";

import { ArrowLeft, BookOpen, Clock, Activity, Users, Send } from "lucide-react";
import { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/useProjectStore";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";

interface ProjectDrillDownProps {
    project: Project;
}

export function ProjectDrillDown({ project }: ProjectDrillDownProps) {
    const { setSelectedProjectId } = useProjectStore();

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Project Header / Breadcrumb */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-primary/10">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setSelectedProjectId(null)}
                        className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-primary/60 hover:text-primary transition-colors uppercase group"
                    >
                        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                        [ BACK_TO_GRID ]
                    </button>
                    <div className="h-4 w-px bg-white/10"></div>
                    <div className="flex items-center gap-2 text-xs font-bold tracking-[0.3em] text-white/40 uppercase">
                        ARKAN <span className="text-primary/20">//</span> PROJECTS <span className="text-primary/20">//</span>
                        <span className="text-primary group-hover:glow-text transition-all">{project.technicalId}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-[10px] font-mono text-green-500 uppercase tracking-widest">System_Synchronized</span>
                </div>
            </div>

            {/* Tactical Grid (3 Panels) */}
            <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
                {/* LEFT: Operations Log (Tasks) */}
                <div className="col-span-3 border border-primary/20 bg-[#0a0a05]/40 rounded-lg flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/40"></div>
                    <div className="p-4 border-b border-primary/10 flex justify-between items-center bg-primary/5">
                        <h2 className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">Operations_Log</h2>
                        <span className="text-[10px] text-primary/40 italic">⋮</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <span className="text-[8px] font-bold text-red-500/60 uppercase tracking-widest">Priority: Critical</span>
                                <div
                                    className="bg-primary/5 border border-primary/20 p-3 rounded-lg hover:border-primary/40 transition-all cursor-pointer group/task"
                                    onClick={() => ArkanAudio.play('ui_confirm_ping')}
                                    onMouseEnter={() => ArkanAudio.play('ui_hover_shimmer')}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-4 h-4 rounded border border-primary/40 mt-0.5 flex items-center justify-center group-hover/task:border-primary transition-colors">
                                            <div className="w-2 h-2 bg-primary rounded-sm shadow-[0_0_5px_#ffff00]"></div>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-white group-hover/task:text-primary transition-colors">Initialize Neural Sync Protocols</p>
                                            <p className="text-[9px] text-slate-500 font-mono mt-1">Status: DEPLOYED // ID: 882-QX</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-[8px] font-bold text-yellow-500/60 uppercase tracking-widest">Priority: Pending</span>
                                <div
                                    className="bg-white/5 border border-white/5 p-3 rounded-lg hover:border-primary/20 transition-all cursor-pointer"
                                    onClick={() => ArkanAudio.play('ui_confirm_ping')}
                                    onMouseEnter={() => ArkanAudio.play('ui_hover_shimmer')}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-4 h-4 rounded border border-white/20 mt-0.5"></div>
                                        <div>
                                            <p className="text-[11px] font-bold text-white/80">Refactor Core Logic v2.4</p>
                                            <p className="text-[9px] text-slate-500 font-mono mt-1">Assignee: ARKAN_CORE</p>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="bg-white/5 border border-white/5 p-3 rounded-lg hover:border-primary/20 transition-all cursor-pointer"
                                    onClick={() => ArkanAudio.play('ui_confirm_ping')}
                                    onMouseEnter={() => ArkanAudio.play('ui_hover_shimmer')}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-4 h-4 rounded border border-white/20 mt-0.5"></div>
                                        <div>
                                            <p className="text-[11px] font-bold text-white/80">Review Telemetry Latency</p>
                                            <p className="text-[9px] text-slate-500 font-mono mt-1">Threshold: 20ms</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-3 border-t border-primary/10">
                        <button className="w-full py-2 border border-dashed border-primary/30 text-[9px] text-primary/60 font-bold uppercase tracking-widest hover:bg-primary/5 hover:border-primary transition-all">
                            + Add_New_Operation
                        </button>
                    </div>
                </div>

                {/* CENTER: Documentation / Core Node (Notes) */}
                <div className="col-span-6 border border-primary/20 bg-[#0a0a05]/20 rounded-lg flex flex-col relative overflow-hidden">
                    <div className="p-4 border-b border-primary/10 flex justify-between items-center bg-white/5">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary/60" />
                            <h2 className="text-[10px] font-bold tracking-[0.2em] text-white/80 uppercase">Archive_Doc // Core_Specs.md</h2>
                        </div>
                        <div className="flex items-center gap-4 text-[9px] font-mono">
                            <span className="text-slate-500 uppercase">Mode: Live_Markdown</span>
                            <div className="w-[1px] h-3 bg-white/10"></div>
                            <button className="text-primary/60 hover:text-primary active:scale-95 transition-all">EDIT_NODE</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                        {/* Decorative background grid */}
                        <div className="absolute inset-0 pointer-events-none opacity-20"
                            style={{ backgroundImage: 'radial-gradient(circle, #ffff00 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                        <div className="relative z-10 space-y-6">
                            <div className="border-l-2 border-primary pl-6 py-2">
                                <h1 className="text-3xl font-bold text-white tracking-tight uppercase group flex items-center gap-4">
                                    Project {project.name}: {project.technicalId}
                                    <div className="h-[1px] flex-1 bg-primary/10"></div>
                                </h1>
                            </div>

                            <p className="text-slate-400 text-sm leading-relaxed font-light">
                                <span className="bg-primary/10 text-primary px-1 font-bold">{project.technicalId}</span> architecture focuses on decentralized data processing and sub-second decision making within the Arkan environment.
                            </p>

                            <div className="bg-[#1a1a08]/40 border border-primary/10 p-6 rounded-lg space-y-4">
                                <h3 className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase">Key_Objectives:</h3>
                                <ul className="space-y-3">
                                    {[
                                        "Latency reduction in neural sync protocols.",
                                        "Encryption hardening via quantum-resistant algorithms.",
                                        "API integration for external telemetry node clusters."
                                    ].map((obj, i) => (
                                        <li key={i} className="flex gap-4 text-xs text-white/70">
                                            <span className="text-primary font-mono font-bold">{String(i + 1).padStart(2, '0')}.</span>
                                            {obj}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-4 pt-4">
                                <h2 className="text-xl font-bold text-white/90 uppercase tracking-widest">Operational Roadmap</h2>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Current progress suggests a stable deployment within the next 48 hours. Monitoring nodes are active in the EMEA and APAC regions.
                                </p>
                            </div>

                            {/* Technical Diagram Mockup */}
                            <div className="pt-8 opacity-40 hover:opacity-100 transition-opacity">
                                <div className="aspect-video border border-dashed border-primary/40 bg-primary/5 rounded-lg flex flex-col items-center justify-center p-6 gap-2">
                                    <div className="w-full h-full border border-primary/20 flex items-center justify-center relative">
                                        <div className="absolute top-1/2 left-1/4 w-1/2 h-[1px] bg-primary/40 rotate-12"></div>
                                        <div className="absolute top-1/3 left-1/3 w-[1px] h-1/2 bg-primary/40"></div>
                                        <Activity className="h-12 w-12 text-primary/20" />
                                    </div>
                                    <span className="text-[8px] font-mono text-primary/60 uppercase tracking-widest">Schematic: Node_Cluster_Alpha_7</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Telemetry & Collaborators */}
                <div className="col-span-3 flex flex-col gap-6">
                    {/* Telemetry Status */}
                    <div className="border border-primary/20 bg-[#0a0a05]/40 p-6 rounded-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/40"></div>
                        <h2 className="text-[9px] font-bold tracking-[0.3em] text-primary uppercase mb-6">Telemetry_Status</h2>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[8px] text-slate-500 uppercase tracking-widest">Task_Completion</span>
                                    <span className="text-xs font-mono text-white">{project.progress}%</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full shadow-[0_0_8px_#ffff00] transition-all" style={{ width: `${project.progress}%` }}></div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <span className="text-[8px] text-slate-500 uppercase tracking-widest block mb-1">Time_Invested</span>
                                <p className="text-2xl font-bold text-primary tracking-tighter">14.5 HRS</p>
                            </div>

                            {/* Mini completion curve mockup */}
                            <div className="pt-4 h-24 border-t border-primary/10 flex items-end gap-1">
                                {[30, 45, 38, 55, 62, 58, 75, 80].map((h, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-primary/40 rounded-t-sm hover:bg-primary transition-all group/bar"
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-4 text-[8px] text-primary transition-opacity">v.{i}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Collaborator Status */}
                    <div className="flex-1 border border-primary/20 bg-[#0a0a05]/40 p-6 rounded-lg relative overflow-hidden">
                        <h2 className="text-[9px] font-bold tracking-[0.3em] text-primary uppercase mb-6">Collaborator_Status</h2>
                        <div className="space-y-4">
                            {[
                                { name: "Elias.L", code: "EL", color: "text-green-500" },
                                { name: "Sarah.K", code: "SK", color: "text-primary/60" },
                                { name: "Marcus_Net", code: "MN", color: "text-primary" }
                            ].map((user, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-[10px] font-bold text-primary/60">
                                            {user.code}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-white/80">{user.name}</p>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-green-500"></div>
                                                <span className="text-[8px] text-slate-600 uppercase">ONLINE_HUB_7</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-2 border border-white/5 rounded hover:border-primary/40 transition-all text-slate-600 hover:text-primary">
                                        <Send className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Session Footer Logs */}
            <div className="mt-8 py-3 border-t border-primary/10 flex items-center justify-between font-mono text-[8px] tracking-widest text-primary/40 uppercase">
                <div className="flex gap-8">
                    <span>{project.technicalId}_SESSION_LOGS:</span>
                    <div className="flex gap-6 overflow-hidden">
                        <span className="text-primary/60">[14:02:11] SYNC_START: SUCCESS</span>
                        <span className="opacity-40 whitespace-nowrap">[14:05:48] COMPILING_ASSETS_V2.0.4... 100%</span>
                        <span className="opacity-40 whitespace-nowrap">[14:10:22] CACHE_CLEARED_ID_7718</span>
                        <span className="text-primary/80 whitespace-nowrap">[14:15:33] PUSHING_TO_EDGE_NODES... ACTIVE</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        <span>TX: 2.1MB/s</span>
                    </div>
                    <div className="w-[1px] h-3 bg-primary/10"></div>
                    <span>LATENCY: 12ms</span>
                </div>
            </div>
        </div>
    );
}
