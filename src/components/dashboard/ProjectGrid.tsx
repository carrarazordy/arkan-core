"use client";

import { useEffect } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";
import { ProjectCard } from "./ProjectCard";
import { cn } from "@/lib/utils";

export function ProjectGrid() {
    const { projects, fetchProjects, isLoading, selectedProjectId, setSelectedProjectId } = useProjectStore();

    useEffect(() => {
        if (projects.length === 0) {
            fetchProjects();
        }
    }, [fetchProjects, projects.length]);

    const handleProjectClick = (id: string) => {
        // Trigger sound if available (handled globally in app-shell, but could be specific here)
        setSelectedProjectId(id);
    };

    if (isLoading && projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-primary">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-[10px] font-mono tracking-[0.4em] uppercase">Fetching_Operations_Data...</span>
            </div>
        );
    }

    return (
        <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-all duration-700",
            selectedProjectId ? "opacity-0 translate-y-10 pointer-events-none" : "opacity-100 translate-y-0"
        )}>
            {projects.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => handleProjectClick(project.id)}
                />
            ))}

            {/* Add New Placeholder */}
            <div className="bg-[#121208]/30 border border-dashed border-white/10 hover:border-primary/50 p-6 rounded-xl transition-all flex flex-col items-center justify-center text-slate-600 hover:text-primary cursor-pointer h-full min-h-[250px] group">
                <PlusCircle className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform shadow-[0_0_10px_transparent] group-hover:shadow-primary/20" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Initialize_New_Node</span>
            </div>
        </div>
    );
}
