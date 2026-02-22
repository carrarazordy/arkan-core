import { create } from 'zustand';

export interface ArchiveRecord {
    id: string;
    uid: string;
    title: string;
    type: 'PROJECT' | 'TRAVEL' | 'PROCURE' | 'TASK';
    timestamp: string;
    visibility_status: 'ARCHIVED' | 'ACTIVE';
    de_manifested_at: string;
    description?: string;
}

interface ArchiveState {
    records: ArchiveRecord[];
    isLoading: boolean;
    totalIndexed: number;
    restorationEvents: number;

    fetchRecords: () => void;
    restoreRecord: (id: string) => Promise<void>;
}

export const useArchiveStore = create<ArchiveState>((set, get) => ({
    records: [
        { id: '1', uid: '#TK-902', title: 'Neural Uplink Calibration - Sector 7', type: 'PROJECT', timestamp: '2023-11-24 14:02:11:004', visibility_status: 'ARCHIVED', de_manifested_at: '2023-11-24T14:02:11Z' },
        { id: '2', uid: '#TR-002', title: 'Neon-Seoul Logistics Transfer (V-Node)', type: 'TRAVEL', timestamp: '2023-11-23 09:15:45:882', visibility_status: 'ARCHIVED', de_manifested_at: '2023-11-23T09:15:45Z' },
        { id: '3', uid: '#PR-441', title: 'Acquire: High-Output Bio-Batteries (x12)', type: 'PROCURE', timestamp: '2023-11-22 22:45:00:110', visibility_status: 'ARCHIVED', de_manifested_at: '2023-11-22T22:45:00Z' },
        { id: '4', uid: '#TK-899', title: 'Sub-Level Firewall Reinforcement Layer 2', type: 'PROJECT', timestamp: '2023-11-22 18:12:05:419', visibility_status: 'ARCHIVED', de_manifested_at: '2023-11-22T18:12:05Z' },
        { id: '5', uid: '#TK-898', title: 'System Defrag - Node Arkan-Delta', type: 'PROJECT', timestamp: '2023-11-22 15:44:32:000', visibility_status: 'ARCHIVED', de_manifested_at: '2023-11-22T15:44:32Z' },
        { id: '6', uid: '#TR-001', title: 'Infiltration Route: Lower Slums Gateway', type: 'TRAVEL', timestamp: '2023-11-21 23:59:59:999', visibility_status: 'ARCHIVED', de_manifested_at: '2023-11-21T23:59:59Z' },
    ],
    isLoading: false,
    totalIndexed: 4092,
    restorationEvents: 142,

    fetchRecords: () => {
        set({ isLoading: true });
        // Simulating Appwrite query: Query.equal('visibility_status', 'ARCHIVED')
        setTimeout(() => set({ isLoading: false }), 500);
    },

    restoreRecord: async (id) => {
        console.log(`>> INITIATING_RE_MANIFESTATION: NODE_${id}`);

        // Simulating Appwrite updateDocument
        set((state) => ({
            records: state.records.filter(r => r.id !== id),
            restorationEvents: state.restorationEvents + 1
        }));
    }
}));
