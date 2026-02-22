import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { ArkanAudio } from '@/lib/audio/ArkanAudio';

export type LocaleCode = 'EN_US' | 'PT_BR';
export type ThemeColor = '#F9F906' | '#FF00FF' | '#00FF00' | '#00FFFF' | '#FF4500' | '#F8F8FF';

export interface AudioLevels {
    master: number;
    keyboard: number;
    interface: number;
    ambient: number;
}

interface SettingsState {
    locale: LocaleCode;
    themeColor: ThemeColor;
    audioLevels: AudioLevels;
    isUplinkActive: boolean;
    latency: number;

    setLocale: (locale: LocaleCode) => Promise<void>;
    setThemeColor: (color: ThemeColor) => void;
    setAudioLevel: (category: keyof AudioLevels, value: number) => void;
    checkConnectivity: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            locale: 'EN_US',
            themeColor: '#F9F906', // Default Neon Yellow
            audioLevels: {
                master: 1.0,
                keyboard: 0.8,
                interface: 0.6,
                ambient: 0.2
            },
            isUplinkActive: true,
            latency: 0,

            setLocale: async (locale) => {
                set({ locale });
                try {
                    // await account.updatePrefs({ language: locale }); // Supabase migration: Prefs todo
                    ArkanAudio.playFast('confirm');
                } catch (error) {
                    console.error("Failed to update locale prefs:", error);
                }
            },

            setThemeColor: (color) => {
                set({ themeColor: color });
                // Apply immediately to CSS variable
                document.documentElement.style.setProperty('--arkan-neon', color);
                document.documentElement.setAttribute('data-theme-color', color);

                ArkanAudio.playFast('confirm');

                // Persist to Appwrite if needed
                // account.updatePrefs({ theme_color: color }).catch(() => { });
            },

            setAudioLevel: (category, value) => {
                set(state => ({
                    audioLevels: { ...state.audioLevels, [category]: value }
                }));
                // Update Audio Engine immediately
                ArkanAudio.playFast(category === 'keyboard' ? 'key_tick' : 'shimmer');
            },

            checkConnectivity: async () => {
                const start = performance.now();
                try {
                    // Check Supabase health or just mock for now since auth handles connection
                    // await supabase.auth.getSession(); 
                    set({
                        isUplinkActive: true,
                        latency: Math.round(performance.now() - start)
                    });
                } catch (error) {
                    set({ isUplinkActive: false, latency: -1 });
                }
            }
        }),
        {
            name: 'arkan-system-settings',
            partialize: (state) => ({
                locale: state.locale,
                themeColor: state.themeColor,
                audioLevels: state.audioLevels
            }),
            storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : {
                getItem: () => null,
                setItem: () => { },
                removeItem: () => { }
            })
        }
    )
);
