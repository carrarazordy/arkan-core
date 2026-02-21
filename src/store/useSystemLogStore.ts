import { create } from 'zustand';

interface LogEntry {
    id: string;
    timestamp: string;
    type: 'system' | 'user' | 'network' | 'error' | 'status' | 'critical';
    message: string;
}

interface SystemLogState {
    logs: LogEntry[];
    addLog: (message: string, type?: LogEntry['type']) => void;
    clearLogs: () => void;
}

export const useSystemLogStore = create<SystemLogState>((set) => ({
    logs: [
        { id: '1', timestamp: new Date().toLocaleTimeString(), type: 'system', message: 'SYSTEM_CORE_INITIALIZED' },
        { id: '2', timestamp: new Date().toLocaleTimeString(), type: 'status', message: 'ALL_NODES_NOMINAL' }
    ],
    addLog: (message, type = 'system') => set((state) => ({
        logs: [
            {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toLocaleTimeString(),
                type,
                message: message.toUpperCase()
            },
            ...state.logs
        ].slice(0, 50) // Keep last 50 logs
    })),
    clearLogs: () => set({ logs: [] })
}));
