"use client";

import { useProjectStore } from "@/store/useProjectStore";
import { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
    project: Project;
    onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
    const statusColors = {
        running: "bg-primary/20 text-primary",
        stalled: "bg-white/10 text-slate-400",
        critical: "bg-red-500/20 text-red-500",
    };

    return (
        <div
            onClick={onClick}
            className="bg-[#23230f]/40 border border-primary/10 hover:border-primary/40 p-6 rounded-xl transition-all group relative overflow-hidden cursor-pointer"
        >
            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                <span className="text-primary text-sm">⋮</span>
            </div>

            <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-mono text-primary/60 tracking-tighter uppercase">ID: {project.technicalId}</span>
                <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded uppercase", statusColors[project.status])}>
                    [{project.status}]
                </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors uppercase tracking-tight">
                {project.name}
            </h3>

            <p className="text-slate-400 text-sm mb-6 line-clamp-2">
                {project.description || "No tactical description available for this operational sequence."}
            </p>

            <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-500 uppercase tracking-widest">COMPLETION</span>
                    <span className="text-primary font-bold">{project.completedTasks}/{project.totalTasks} TASKS</span>
                </div>

                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="bg-primary h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#ffff00]"
                        style={{ width: `${project.progress}%` }}
                    ></div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                    {project.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[9px] text-slate-400 uppercase tracking-tighter font-bold"
                        >
                            {tag}
                        </span>
                    ))}
                    {project.tags.length === 0 && (
                        <span className="text-[9px] text-slate-600 uppercase italic">NO_TAGS_INITIALIZED</span>
                    )}
                </div>
            </div>

            {/* Subtle scanline overlay for the card */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-b from-transparent via-primary/20 to-transparent scan-animate"></div>
        </div>
    );
}
