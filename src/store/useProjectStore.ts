import { create } from 'zustand';
import { supabase, COLLECTIONS } from '@/lib/supabase';
import { Project, ProjectStatus } from '@/lib/types';
import { ArkanAudio } from '@/lib/audio/ArkanAudio';

interface ProjectState {
    projects: Project[];
    selectedProjectId: string | null;
    isLoading: boolean;
    error: string | null;

    fetchProjects: () => Promise<void>;
    addProject: (project: Omit<Project, 'id'>) => Promise<void>;
    updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    setSelectedProjectId: (id: string | null) => void;
    subscribeToProjects: () => () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    selectedProjectId: null,
    isLoading: false,
    error: null,

    fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase
                .from(COLLECTIONS.PROJECTS)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const projects: Project[] = (data || []).map((doc: any) => ({
                id: doc.id,
                technicalId: doc.technicalId || 'PROJ-000', // Default if missing
                name: doc.name,
                description: doc.description,
                status: doc.status as ProjectStatus,
                progress: doc.progress,
                totalTasks: doc.totalTasks || 0,
                completedTasks: doc.completedTasks || 0,
                tags: doc.tags || [],
                color: doc.color_accent, // Mapped from color_accent
            }));

            set({ projects, isLoading: false });
        } catch (error: any) {
            console.error("Fetch Projects Failed:", error);
            set({ error: error.message, isLoading: false });
        }
    },

    addProject: async (project) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase
                .from(COLLECTIONS.PROJECTS)
                .insert({
                    name: project.name,
                    description: project.description,
                    status: project.status,
                    progress: project.progress,
                    color_accent: project.color, // Mapped to color_accent
                    // technicalId, totalTasks, completedTasks should be handled by DB defaults or triggers if possible, 
                    // or passed if collected from UI
                })
                .select()
                .single();

            if (error) throw error;

            const newProject: Project = {
                id: data.id,
                technicalId: data.technicalId || 'PROJ-NEW',
                name: data.name,
                description: data.description,
                status: data.status as ProjectStatus,
                progress: data.progress,
                totalTasks: data.totalTasks || 0,
                completedTasks: data.completedTasks || 0,
                tags: data.tags || [],
                color: data.color_accent,
            };

            set((state) => ({ projects: [newProject, ...state.projects], isLoading: false }));
            ArkanAudio.playFast('clack');
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            ArkanAudio.playFast('thump');
        }
    },

    updateProject: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
            const payload: any = { ...updates };
            if (updates.color) {
                payload.color_accent = updates.color;
                delete payload.color;
            }

            const { error } = await supabase
                .from(COLLECTIONS.PROJECTS)
                .update(payload)
                .eq('id', id);

            if (error) throw error;

            set((state) => ({
                projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
                isLoading: false,
            }));
            ArkanAudio.playFast('clack');
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            ArkanAudio.playFast('thump');
        }
    },

    deleteProject: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase
                .from(COLLECTIONS.PROJECTS)
                .delete()
                .eq('id', id);

            if (error) throw error;

            set((state) => ({
                projects: state.projects.filter((p) => p.id !== id),
                isLoading: false,
            }));
            ArkanAudio.playFast('system_purge');
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            ArkanAudio.playFast('thump');
        }
    },

    setSelectedProjectId: (id) => set({ selectedProjectId: id }),

    subscribeToProjects: () => {
        const channel = supabase
            .channel('public:projects')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: COLLECTIONS.PROJECTS },
                () => {
                    get().fetchProjects();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },
}));
