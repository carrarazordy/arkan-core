import { useState, useEffect, useCallback } from 'react';
import { supabase, COLLECTIONS } from '@/lib/supabase';
import { Project, Task, ProjectStatus } from '@/lib/types';
import { ArkanAudio } from '@/lib/audio/ArkanAudio';
import { useThemeStore } from '@/store/useTheme';

export type DashboardView = 'GRID' | 'PROJECT_EXPANDED';

interface DashboardState {
    projects: Project[];
    globalInbox: Task[];
    systemStatus: 'OPTIMAL' | 'SYNCING' | 'CRITICAL_ERROR';
    activeView: DashboardView;
    selectedProjectId: string | null;
    isLoading: boolean;
    error: string | null;
}

export const useDashboardEngine = () => {
    const [state, setState] = useState<DashboardState>({
        projects: [],
        globalInbox: [],
        systemStatus: 'SYNCING',
        activeView: 'GRID',
        selectedProjectId: null,
        isLoading: true,
        error: null
    });

    const [metrics, setMetrics] = useState({
        uptime: 0,
        heartbeatMs: 45, // Pseudo-latency
        sessionStartTime: Date.now()
    });

    // 1. Post-Login Handshake
    const initialize = useCallback(async () => {
        console.log(">> INITIALIZING_COMMAND_CENTER...");
        ArkanAudio.playFast('system_engage');

        try {
            const [projectsRes, inboxRes] = await Promise.all([
                supabase
                    .from(COLLECTIONS.PROJECTS)
                    .select('*')
                    .order('created_at', { ascending: false }),
                supabase
                    .from(COLLECTIONS.TASKS)
                    .select('*')
                    .is('project_id', null)
                    .order('created_at', { ascending: false })
            ]);

            if (projectsRes.error) throw projectsRes.error;
            if (inboxRes.error) throw inboxRes.error;

            // Transform Projects
            const projects: Project[] = (projectsRes.data || []).map((doc: any) => ({
                id: doc.id,
                technicalId: doc.technical_id || 'PROJ-000',
                name: doc.name,
                description: doc.description,
                status: doc.status as ProjectStatus,
                progress: doc.progress,
                totalTasks: doc.total_tasks || 0,
                completedTasks: doc.completed_tasks || 0,
                tags: doc.tags || [],
                color: doc.color_accent,
                createdAt: doc.created_at,
                updatedAt: doc.updated_at
            }));

            // Transform Tasks
            const inbox: Task[] = (inboxRes.data || []).map((doc: any) => ({
                id: doc.id,
                title: doc.title,
                status: doc.status,
                priority: doc.priority,
                projectId: doc.project_id,
                // assigneeId: doc.assigneeId, // Not in schema yet
                createdAt: new Date(doc.created_at),
                updatedAt: new Date(doc.updated_at)
            }));

            setState(prev => ({
                ...prev,
                projects,
                globalInbox: inbox,
                systemStatus: 'OPTIMAL',
                isLoading: false
            }));

        } catch (err: any) {
            console.error(">> HANDSHAKE_FAILED:", err);

            // Auto-logout on 401 ? Supabase handles auth state differently.

            setState(prev => ({
                ...prev,
                systemStatus: 'CRITICAL_ERROR',
                error: err.message,
                isLoading: false
            }));
        }
    }, []);

    // 2. Real-time Subscription
    useEffect(() => {
        // TASKS Subscription (Inbox)
        const tasksChannel = supabase
            .channel('dashboard-tasks')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: COLLECTIONS.TASKS, filter: 'project_id=is.null' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newRow = payload.new as any;
                        const newTask: Task = {
                            id: newRow.id,
                            title: newRow.title,
                            status: newRow.status,
                            priority: newRow.priority,
                            projectId: newRow.project_id,
                            createdAt: new Date(newRow.created_at),
                            updatedAt: new Date(newRow.updated_at)
                        };
                        setState(prev => ({
                            ...prev,
                            globalInbox: [newTask, ...prev.globalInbox]
                        }));
                        ArkanAudio.playFast('confirm');
                    }
                    // Handle UPDATE/DELETE if needed for inbox
                }
            )
            .subscribe();

        // PROJECTS Subscription (Dashboard Grid)
        const projectsChannel = supabase
            .channel('dashboard-projects')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: COLLECTIONS.PROJECTS },
                (payload) => {
                    // Simplified: Refresh or partial update. For now, we can just fetch all or manually patch.
                    // A full refresh is safer for consistency if logic is complex.
                    // But let's try manual patching for speed.
                    if (payload.eventType === 'INSERT') {
                        const newRow = payload.new as any;
                        const project: Project = {
                            id: newRow.id,
                            technicalId: newRow.technicalId || 'PROJ-NEW',
                            name: newRow.name,
                            description: newRow.description,
                            status: newRow.status as ProjectStatus,
                            progress: newRow.progress,
                            totalTasks: newRow.totalTasks || 0,
                            completedTasks: newRow.completedTasks || 0,
                            tags: newRow.tags || [],
                            color: newRow.color_accent,
                            createdAt: newRow.created_at,
                            updatedAt: newRow.updated_at
                        };
                        setState(prev => ({
                            ...prev,
                            projects: [project, ...prev.projects]
                        }));
                        ArkanAudio.playFast('system_engage');
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(tasksChannel);
            supabase.removeChannel(projectsChannel);
        };
    }, []);

    // 3. Drill-down Module Logic
    const expandProject = (projectId: string) => {
        setState(prev => ({
            ...prev,
            activeView: 'PROJECT_EXPANDED',
            selectedProjectId: projectId
        }));
        ArkanAudio.playFast('clack');
        console.log(`>> FOCUS_SHIFT: PROJECT_${projectId}`);
    };

    const returnToGrid = () => {
        setState(prev => ({
            ...prev,
            activeView: 'GRID',
            selectedProjectId: null
        }));
        ArkanAudio.playFast('shimmer');
    };

    // 4. Metrics Logic (Heartbeat & Uptime)
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                uptime: Date.now() - prev.sessionStartTime,
                heartbeatMs: 40 + Math.random() * 20 // Simulate fluctuation
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return {
        state,
        metrics,
        initialize,
        expandProject,
        returnToGrid
    };
};
