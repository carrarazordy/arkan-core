import { create } from 'zustand';
import { supabase, COLLECTIONS } from '@/lib/supabase';
import { Task, Status, Priority } from '@/lib/types';
import { ArkanAudio } from '@/lib/audio/ArkanAudio';

interface TaskState {
    tasks: Task[];
    isLoading: boolean;
    error: string | null;
    bloomTaskId: string | null;

    fetchTasks: (projectId?: string) => Promise<void>;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isVisible'>) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    completeTaskWithDelay: (id: string, delay?: number) => void;
    subscribeToTasks: (projectId?: string) => () => void;
}

const PRIORITY_ORDER: Record<Priority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3
};

const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
        if (a.priority !== b.priority) {
            return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
};

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    isLoading: false,
    error: null,
    bloomTaskId: null,

    fetchTasks: async (projectId) => {
        set({ isLoading: true, error: null });
        try {
            let query = supabase
                .from(COLLECTIONS.TASKS)
                .select('*')
                .order('created_at', { ascending: false });

            if (projectId) {
                query = query.eq('project_id', projectId);
            }

            const { data, error } = await query;

            if (error) throw error;

            const tasks: Task[] = (data || []).map((doc: any) => ({
                id: doc.id,
                title: doc.title,
                description: doc.description,
                status: doc.status as Status,
                priority: doc.priority as Priority,
                projectId: doc.project_id,
                dueDate: doc.due_date ? new Date(doc.due_date) : undefined,
                createdAt: new Date(doc.created_at),
                updatedAt: new Date(doc.updated_at),
                isVisible: doc.is_visible ?? true,
                tags: doc.tags || [],
            }));

            set({ tasks: sortTasks(tasks), isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    addTask: async (task) => {
        set({ isLoading: true });
        try {
            const { data, error } = await supabase
                .from(COLLECTIONS.TASKS)
                .insert({
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    project_id: task.projectId,
                    due_date: task.dueDate?.toISOString(),
                    is_visible: true,
                    tags: task.tags,
                })
                .select()
                .single();

            if (error) throw error;

            const newTask: Task = {
                id: data.id,
                title: data.title,
                description: data.description,
                status: data.status as Status,
                priority: data.priority as Priority,
                projectId: data.project_id,
                dueDate: data.due_date ? new Date(data.due_date) : undefined,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
                isVisible: data.is_visible ?? true,
                tags: data.tags || [],
            };

            ArkanAudio.playFast('clack');
            set((state) => ({
                tasks: sortTasks([newTask, ...state.tasks]),
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            ArkanAudio.playFast('thump');
        }
    },

    updateTask: async (id, updates) => {
        try {
            const payload: any = { ...updates };
            // Map camelCase to snake_case for specific fields
            if (updates.projectId) {
                payload.project_id = updates.projectId;
                delete payload.projectId;
            }
            if (updates.dueDate) {
                payload.due_date = updates.dueDate instanceof Date ? updates.dueDate.toISOString() : updates.dueDate;
                delete payload.dueDate;
            }
            if (updates.isVisible !== undefined) {
                payload.is_visible = updates.isVisible;
                delete payload.isVisible;
            }

            // Allow simplified update call
            const { error } = await supabase
                .from(COLLECTIONS.TASKS)
                .update(payload)
                .eq('id', id);

            if (error) throw error;

            // Update local state optimistically
            set((state) => ({
                tasks: sortTasks(state.tasks.map(t =>
                    t.id === id ? { ...t, ...updates } : t
                ))
            }));

            ArkanAudio.playFast('clack');
        } catch (error: any) {
            set({ error: error.message });
            ArkanAudio.playFast('thump');
        }
    },

    deleteTask: async (id) => {
        try {
            const { error } = await supabase
                .from(COLLECTIONS.TASKS)
                .delete()
                .eq('id', id);

            if (error) throw error;

            set((state) => ({
                tasks: state.tasks.filter(t => t.id !== id)
            }));

            ArkanAudio.playFast('clack');
        } catch (error: any) {
            set({ error: error.message });
            ArkanAudio.playFast('thump');
        }
    },

    completeTaskWithDelay: (id: string, delay: number = 2000) => {
        set({ bloomTaskId: id });
        ArkanAudio.playFast('clack');

        setTimeout(async () => {
            const { updateTask } = get();
            await updateTask(id, { status: 'completed', isVisible: false });
            set({ bloomTaskId: null });
        }, delay);
    },

    subscribeToTasks: (projectId) => {
        const channel = supabase
            .channel('public:tasks')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: COLLECTIONS.TASKS },
                (payload) => {
                    // Logic to handle realtime updates
                    // For simplicity in migration, assume page refresh or manual fetch for now
                    // Detailed realtime mapping requires matching Supabase payload structure to Task
                    get().fetchTasks(projectId);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },
}));
