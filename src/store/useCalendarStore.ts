import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    startTimestamp: number; // ms
    endTimestamp: number; // ms
    type: 'CORE' | 'SYSTEM' | 'RECON' | 'LOGS';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'ACTIVE' | 'PENDING' | 'COMPLETED';
    alertFired?: boolean;
    notes?: string;
}

interface CalendarState {
    events: CalendarEvent[];
    isLoading: boolean;
    selectedDate: number; // Current day viewed/selected

    setEvents: (events: CalendarEvent[]) => void;
    addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
    deleteEvent: (id: string) => void;
    setSelectedDate: (date: number) => void;
    markAlertFired: (eventId: string) => void;
}

export const useCalendarStore = create<CalendarState>()(
    persist((set) => {
        // Basic mock events with relative timestamps
        // Use fixed timestamp for initial state to prevent hydration mismatch
        const now = 1704067200000; // Fixed date (e.g., Jan 1 2024) or 0. Persist will overwrite.
        const oneHour = 3600000;
        const tomorrow = now + 86400000;

        return {
            events: [],
            isLoading: false,
            selectedDate: typeof window !== 'undefined' ? Date.now() : 0, // Better hydration safety check

            setEvents: (events) => set({ events }),

            addEvent: (event) => set((state) => ({
                events: [...state.events, { ...event, id: Math.random().toString(36).substr(2, 9) }]
            })),

            deleteEvent: (id) => set((state) => ({
                events: state.events.filter(e => e.id !== id)
            })),

            setSelectedDate: (date) => set({ selectedDate: date }),

            markAlertFired: (eventId) => set((state) => ({
                events: state.events.map(e => e.id === eventId ? { ...e, alertFired: true } : e)
            }))
        };
    },
        {
            name: 'arkan-calendar-storage',
            storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : {
                getItem: () => null,
                setItem: () => { },
                removeItem: () => { }
            }),
            partialize: (state) => ({ events: state.events }),
        }
    ));
