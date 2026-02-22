import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/lib/types";
import { ArrowRight, FolderKanban } from "lucide-react";
import Link from "next/link";

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    return (
        <Link href={`/projects/${project.id}`} className="block transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:shadow-[0_0_15px_-5px_var(--color-primary)] transition-all duration-300">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold tracking-tight">{project.name}</CardTitle>
                        <FolderKanban className="h-5 w-5 text-muted-foreground" />
                    </div>
                </CardHeader>
                <CardContent className="pb-2">
                    {project.description && (
                        <p className="line-clamp-2 text-sm text-muted-foreground mb-4">
                            {project.description}
                        </p>
                    )}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{Math.round(project.progress)}%</span>
                        </div>
                        <Progress value={project.progress} className="h-1.5" />
                    </div>
                </CardContent>
                <CardFooter className="pt-2">
                    <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                        <span>{project.completedTasks}/{project.totalTasks} Tasks</span>
                        <div className="flex items-center gap-1 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                            <span>Open</span>
                            <ArrowRight className="h-3 w-3" />
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
