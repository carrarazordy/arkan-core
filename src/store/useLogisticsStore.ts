import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ArkanAudio } from '@/lib/audio/ArkanAudio';

export type LogisticStatus = 'PENDING' | 'LOCATING' | 'ACQUIRED';
export type SectorPriority = 'STABLE' | 'HIGH' | 'CRITICAL';

export interface LogisticsItem {
    id: string;
    name: string;
    qty: number;
    status: LogisticStatus;
    sectorId: string;
    // Computed/UI props
    label?: string;
    category?: string;
    type?: 'TRAVEL' | 'SUPPLY';
}

export interface Sector {
    id: string;
    name: string;
    priority: SectorPriority;
}

export interface ManifestItem {
    id: string;
    name: string;
    weightKg: number;
    isDeManifested: boolean;
}

interface LogisticsState {
    sectors: Sector[];
    items: LogisticsItem[];
    manifest: ManifestItem[];

    // Actions
    toggleItemStatus: (id: string) => void;
    deManifestItem: (id: string) => void;
    addItem: (item: Omit<LogisticsItem, 'id' | 'status'>) => void;
    addManifestItem: (name: string, weight: number) => void;
    resetManifest: () => void;
}

export const useLogisticsStore = create<LogisticsState>()(
    persist(
        (set, get) => ({
            sectors: [
                { id: 'sec-01', name: 'GROCERIES_HQ', priority: 'STABLE' },
                { id: 'sec-02', name: 'HARDWARE_DEPOT', priority: 'HIGH' },
                { id: 'sec-03', name: 'PHARMACY_LAB', priority: 'CRITICAL' }
            ],
            items: [
                { id: '4492-AX', name: 'Protein_Synth_Pack', qty: 2, status: 'PENDING', sectorId: 'sec-01', type: 'SUPPLY', category: 'NUTRITION' },
                { id: '9921-BZ', name: 'Neuro_Caffeine_Additives', qty: 1, status: 'PENDING', sectorId: 'sec-01', type: 'SUPPLY', category: 'STIMULANTS' },
                { id: '8823-CC', name: 'CR2032_Cells', qty: 5, status: 'ACQUIRED', sectorId: 'sec-02', type: 'SUPPLY', category: 'POWER' }
            ],
            manifest: [
                { id: 'man-01', name: 'Tactical_Backpack', weightKg: 1.2, isDeManifested: false },
                { id: 'man-02', name: 'Laptop_Terminal', weightKg: 2.5, isDeManifested: false },
                { id: 'man-03', name: 'Hydration_Module', weightKg: 0.8, isDeManifested: false }
            ],

            toggleItemStatus: (id) => {
                set(state => ({
                    items: state.items.map(item =>
                        item.id === id
                            ? { ...item, status: item.status === 'PENDING' ? 'ACQUIRED' : 'PENDING' }
                            : item
                    )
                }));
                ArkanAudio.playFast('confirm');
            },

            deManifestItem: (id) => {
                // Trigger Glitch/Sound
                ArkanAudio.playFast('system_purge');

                // Remove from items list based on ID
                set(state => ({
                    items: state.items.filter(item => item.id !== id)
                }));
            },

            addItem: (newItem) => {
                const id = Math.random().toString(36).substr(2, 9).toUpperCase();
                set(state => ({
                    items: [...state.items, { ...newItem, id, status: 'PENDING' }]
                }));
                ArkanAudio.playFast('clack');
            },

            addManifestItem: (name, weight) => {
                const id = `man-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
                set(state => ({
                    manifest: [...state.manifest, { id, name, weightKg: weight, isDeManifested: false }]
                }));
                ArkanAudio.playFast('clack');
            },

            resetManifest: () => {
                set(state => ({
                    manifest: state.manifest.map(i => ({ ...i, isDeManifested: false }))
                }));
            }
        }),
        {
            name: 'arkan-logistics-storage',
            storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : {
                getItem: () => null,
                setItem: () => { },
                removeItem: () => { }
            }),
        }
    )
);
