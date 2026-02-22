import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ArkanAudio } from '@/lib/audio/ArkanAudio';

export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETE';

export interface TimerNode {
    id: string;
    label: string;
    durationMs: number;
    endTime: number | null;
    remainingMs: number;
    status: TimerStatus;
    type: 'POMODORO' | 'CUSTOM';
}

export interface MetronomeState {
    active: boolean;
    bpm: number;
    signature: [number, number]; // [beats, noteValue] e.g. [4, 4]
    volume: number;
}

interface ChronosState {
    timers: Record<string, TimerNode>;
    activeTimerId: string | null;
    metronome: MetronomeState;

    // Timer Actions
    initializeTimer: (id: string, minutes: number, label: string, type?: 'POMODORO' | 'CUSTOM') => void;
    startTimer: (id: string) => void;
    pauseTimer: (id: string) => void;
    resetTimer: (id: string) => void;
    tick: () => void;
    setMainDisplay: (id: string) => void;
    adjustMainTimer: (minutes: number) => void;

    // Metronome Actions
    toggleMetronome: () => void;
    setBpm: (bpm: number) => void;
    setSignature: (beats: number, noteValue: number) => void;
    adjustBpm: (delta: number) => void;
}

export const useChronosStore = create<ChronosState>()(
    persist(
        (set, get) => ({
            timers: {},
            activeTimerId: null,
            metronome: {
                active: false,
                bpm: 120,
                signature: [4, 4],
                volume: 0.8
            },

            initializeTimer: (id, minutes, label, type = 'CUSTOM') => {
                const durationMs = minutes * 60 * 1000;
                set(state => ({
                    timers: {
                        ...state.timers,
                        [id]: {
                            id,
                            label,
                            durationMs,
                            endTime: null,
                            remainingMs: durationMs,
                            status: 'IDLE',
                            type
                        }
                    },
                    activeTimerId: state.activeTimerId || id
                }));
            },

            adjustMainTimer: (minutes) => {
                const { activeTimerId, timers } = get();
                if (!activeTimerId || !timers[activeTimerId]) return;

                const durationMs = minutes * 60 * 1000;
                set(state => ({
                    timers: {
                        ...state.timers,
                        [activeTimerId]: {
                            ...state.timers[activeTimerId],
                            durationMs,
                            remainingMs: durationMs,
                            status: 'IDLE',
                            endTime: null
                        }
                    }
                }));
                ArkanAudio.playFast('shimmer');
            },

            startTimer: (id) => {
                const timer = get().timers[id];
                if (!timer) return;

                // Stop others if we only want one running? 
                // For now, allow parallel, but UI usually focuses one.

                const now = Date.now();
                const endTime = now + timer.remainingMs;

                set(state => ({
                    timers: {
                        ...state.timers,
                        [id]: { ...timer, status: 'RUNNING', endTime }
                    }
                }));
                ArkanAudio.playFast('confirm');
            },

            pauseTimer: (id) => {
                const timer = get().timers[id];
                if (!timer || timer.status !== 'RUNNING' || !timer.endTime) return;

                const now = Date.now();
                const remainingMs = Math.max(0, timer.endTime - now);

                set(state => ({
                    timers: {
                        ...state.timers,
                        [id]: { ...timer, status: 'PAUSED', endTime: null, remainingMs }
                    }
                }));
            },

            resetTimer: (id) => {
                const timer = get().timers[id];
                if (!timer) return;
                set(state => ({
                    timers: {
                        ...state.timers,
                        [id]: { ...timer, status: 'IDLE', endTime: null, remainingMs: timer.durationMs }
                    }
                }));
            },

            tick: () => {
                const now = Date.now();
                const { timers } = get();
                let hasUpdates = false;
                const updatedTimers = { ...timers };

                Object.values(timers).forEach(timer => {
                    if (timer.status === 'RUNNING' && timer.endTime) {
                        const remaining = timer.endTime - now;
                        if (remaining <= 0) {
                            updatedTimers[timer.id] = { ...timer, status: 'COMPLETE', remainingMs: 0, endTime: null };
                            ArkanAudio.playFast('alert_sequence_high');
                            hasUpdates = true;
                        } else {
                            updatedTimers[timer.id] = { ...timer, remainingMs: remaining };
                            hasUpdates = true;
                        }
                    }
                });

                if (hasUpdates) set({ timers: updatedTimers });
            },

            setMainDisplay: (id) => set({ activeTimerId: id }),

            // Metronome
            toggleMetronome: () => {
                const isActive = !get().metronome.active;
                set(state => ({ metronome: { ...state.metronome, active: isActive } }));
                if (isActive) {
                    ArkanAudio.startMetronome(get().metronome.bpm, get().metronome.signature[0]);
                } else {
                    ArkanAudio.stopMetronome();
                }
            },

            setBpm: (bpm) => {
                // Clamp betwen 30 and 300
                const safeBpm = Math.min(300, Math.max(30, Math.round(bpm)));
                if (safeBpm !== get().metronome.bpm) {
                    set(state => ({ metronome: { ...state.metronome, bpm: safeBpm } }));
                    if (get().metronome.active) {
                        ArkanAudio.updateMetronomeBpm(safeBpm);
                    }
                }
            },

            adjustBpm: (delta) => {
                const current = get().metronome.bpm;
                get().setBpm(current + delta);
                ArkanAudio.playFast('mechanical_tick');
            },

            setSignature: (beats, noteValue) => {
                set(state => ({ metronome: { ...state.metronome, signature: [beats, noteValue] } }));
                if (get().metronome.active) {
                    ArkanAudio.stopMetronome();
                    ArkanAudio.startMetronome(get().metronome.bpm, beats);
                }
            }
        }),
        {
            name: 'arkan-chronos-storage',
            storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : {
                getItem: () => null,
                setItem: () => { },
                removeItem: () => { }
            }),
            partialize: (state) => ({
                timers: state.timers,
                activeTimerId: state.activeTimerId,
                metronome: { ...state.metronome, active: false } // Always start stopped
            })
        }
    )
);
