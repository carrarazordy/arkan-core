import { create } from 'zustand';
import { useTaskStore } from './useTaskStore';
import { useProjectStore } from './useProjectStore';
import { Task, Project } from '@/lib/types';

interface SearchResult {
    id: string;
    type: 'task' | 'project';
    title: string;
    subtitle?: string;
}

interface OmniSearchState {
    query: string;
    results: SearchResult[];
    isOpen: boolean;

    setQuery: (query: string) => void;
    toggleSearch: (open?: boolean) => void;
    performSearch: () => void;
}

export const useOmniSearchStore = create<OmniSearchState>((set, get) => ({
    query: "",
    results: [],
    isOpen: false,

    setQuery: (query) => set({ query }),
    toggleSearch: (open) => set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),

    performSearch: () => {
        const query = get().query.trim().toLowerCase();
        if (!query) {
            set({ results: [] });
            return;
        }

        const tasks = useTaskStore.getState().tasks;
        const projects = useProjectStore.getState().projects;
        let results: SearchResult[] = [];

        // Direct ID Lookup (High-Priority Hash)
        const idMatchTask = tasks.find(t => t.id.toLowerCase().includes(query) || (t as any).technicalId?.toLowerCase() === query);
        const idMatchProject = projects.find(p => p.id.toLowerCase().includes(query) || p.technicalId.toLowerCase() === query);

        if (idMatchTask) results.push({ id: idMatchTask.id, type: 'task', title: idMatchTask.title, subtitle: `ID: ${idMatchTask.id}` });
        if (idMatchProject) results.push({ id: idMatchProject.id, type: 'project', title: idMatchProject.name, subtitle: `ID: ${idMatchProject.technicalId}` });

        // Tokenized Querying
        if (query.startsWith('/t ')) {
            const taskQuery = query.slice(3);
            results = tasks
                .filter(t => t.title.toLowerCase().includes(taskQuery))
                .map(t => ({ id: t.id, type: 'task', title: t.title, subtitle: `STATUS: ${t.status}` }));
        } else if (query.startsWith('/p ')) {
            const projectQuery = query.slice(3);
            results = projects
                .filter(p => p.name.toLowerCase().includes(projectQuery))
                .map(p => ({ id: p.id, type: 'project', title: p.name, subtitle: `CODE: ${p.technicalId}` }));
        } else {
            // General fuzzy search
            const fuzzyTasks = tasks.filter(t => t.title.toLowerCase().includes(query));
            const fuzzyProjects = projects.filter(p => p.name.toLowerCase().includes(query));

            results = [
                ...fuzzyProjects.map(p => ({ id: p.id, type: 'project' as const, title: p.name, subtitle: 'PROJECT' })),
                ...fuzzyTasks.map(t => ({ id: t.id, type: 'task' as const, title: t.title, subtitle: 'TASK' }))
            ].slice(0, 10);
        }

        set({ results });
    }
}));
