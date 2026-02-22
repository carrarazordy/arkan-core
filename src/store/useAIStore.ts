import { create } from 'zustand';
import { useNoteStore } from './useNoteStore';
import { useTaskStore } from './useTaskStore';
import { useSystemLogStore } from './useSystemLogStore';
import { ArkanAudio } from '@/lib/audio/ArkanAudio';

interface AnalysisIndex {
    technicalDepth: number;
    clarity: number;
}

interface AIState {
    status: 'IDLE' | 'ANALYZING' | 'SUCCESS';
    analysisIndex: AnalysisIndex;
    suggestion: string | null;

    extractTasks: () => Promise<void>;
    summarizeNote: () => Promise<void>;
    checkAnomalies: () => Promise<void>;
    updateMetrics: (content: string) => void;
}

export const useAIStore = create<AIState>((set, get) => ({
    status: 'IDLE',
    analysisIndex: { technicalDepth: 0.88, clarity: 0.64 },
    suggestion: null,

    extractTasks: async () => {
        const { activeNote, buffer } = useNoteStore.getState();
        if (!activeNote) return;

        set({ status: 'ANALYZING' });
        ArkanAudio.playFast('ai_scan_sweep');
        useSystemLogStore.getState().addLog(`INITIATING_TASK_MINING: ${activeNote.id.substring(0, 8)}`, 'status');

        // Simulation of AI processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock extraction logic
        const mockTasks = [
            { title: "Review technical architecture", priority: "high" },
            { title: "Finalize Appwrite integration", priority: "critical" }
        ];

        for (const task of mockTasks) {
            await useTaskStore.getState().addTask({
                title: task.title,
                priority: task.priority as any,
                status: 'todo',
                projectId: activeNote.projectId || 'ARCHIVE'
            });
        }

        set({ status: 'SUCCESS' });
        ArkanAudio.playFast('ai_data_match');
        useSystemLogStore.getState().addLog(`AI_MINING_COMPLETE: ${mockTasks.length} NODES_EXTRACTED`, 'status');

        setTimeout(() => set({ status: 'IDLE' }), 3000);
    },

    summarizeNote: async () => {
        set({ status: 'ANALYZING' });
        ArkanAudio.playFast('ai_scan_sweep');
        await new Promise(resolve => setTimeout(resolve, 1500));
        set({ status: 'SUCCESS' });
        ArkanAudio.playFast('ai_data_match');
        setTimeout(() => set({ status: 'IDLE' }), 3000);
    },

    checkAnomalies: async () => {
        set({ status: 'ANALYZING' });
        ArkanAudio.playFast('ai_scan_sweep');
        await new Promise(resolve => setTimeout(resolve, 2000));
        set({ status: 'SUCCESS', suggestion: "CONFLICT_DETECTED: Overlapping deadline with 'Project_Omega'" });
        ArkanAudio.playFast('ai_pulse_low');
        setTimeout(() => set({ status: 'IDLE' }), 5000);
    },

    updateMetrics: (content) => {
        // Simple heuristic for depth and clarity
        const words = content.trim().split(/\s+/).length;
        const complexity = Math.min(0.99, words / 500);
        const clarity = Math.max(0.1, 1 - (complexity / 2));

        set({
            analysisIndex: {
                technicalDepth: complexity,
                clarity: clarity
            }
        });
    }
}));
