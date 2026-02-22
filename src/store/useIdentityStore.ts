import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useSystemLogStore } from './useSystemLogStore';
import { ArkanAudio } from '@/lib/audio/ArkanAudio';

// ... imports remain the same

export interface SessionNode {
    id: string;
    ip: string;
    os: string;
    device: string;
    status: 'ACTIVE_SESSION' | 'REMOTE_NODE';
    lastActive: number;
}

export interface UserProfile {
    id: string; // Changed from $id to id for Supabase
    email: string;
    // prefs: Record<string, any>; // Supabase stores metadata in user_metadata
}

interface IdentityState {
    user: UserProfile | null;
    sessions: SessionNode[];
    securityLevel: 'OMEGA_STRICT' | 'STANDARD' | 'BETA_WEAK';
    isLoading: boolean;
    isAuthenticated: boolean;
    localKey: string | null;

    login: (email: string, password: string) => Promise<void>;
    checkSession: () => Promise<void>;
    logout: () => Promise<void>;
    fetchSessions: () => Promise<void>;
    terminateSession: (sessionId: string) => Promise<void>;
    triggerSecurityHandshake: () => void;
    generateLocalKey: () => void;
    rotateLocalKey: () => void;
    stopLoading: () => void;
}

export const useIdentityStore = create<IdentityState>((set, get) => ({
    user: null,
    sessions: [],
    securityLevel: 'OMEGA_STRICT',
    isLoading: true,
    isAuthenticated: false,
    localKey: typeof window !== 'undefined' ? localStorage.getItem('arkan_neural_key') : null,

    checkSession: async () => {
        // No longer setting global isLoading to true to prevent UI flash, 
        // as middleware handles the critical auth check.
        try {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) throw error;

            set({
                user: {
                    id: user.id,
                    email: user.email!,
                },
                isAuthenticated: true,
                isLoading: false
            });
        } catch (error) {
            // Check if it's just no session vs network error
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            await get().checkSession();
            ArkanAudio.playFast('system_engage');
            useSystemLogStore.getState().addLog("SESSION_ESTABLISHED: USER_LOGIN", 'system');
        } catch (error: any) {
            console.error("Login failed:", error);
            set({ isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        try {
            await supabase.auth.signOut();
            ArkanAudio.playFast('clack');
            set({ user: null, isAuthenticated: false, sessions: [] });
            useSystemLogStore.getState().addLog("SESSION_TERMINATED: USER_LOGOUT", 'system');

            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        } catch (error) {
            console.error("Logout failed:", error);
            set({ user: null, isAuthenticated: false });
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
    },

    fetchSessions: async () => {
        // Supabase Client SDK doesn't expose listSessions like Appwrite Client.
        // This would normally require a server-side admin client or a different strategy.
        // For client-side migration, we'll strip this feature or mock it as "Current Session Only".
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            set({
                sessions: [{
                    id: session.access_token.substring(0, 10), // Mock ID from token
                    ip: '127.0.0.1',
                    os: 'Unknown',
                    device: 'Current Browser',
                    status: 'ACTIVE_SESSION',
                    lastActive: Date.now()
                }]
            });
        }
    },

    terminateSession: async (sessionId: string) => {
        // Not directly supported on client side for other sessions without RLS/Admin.
        // We will just log it for now as a "soft" termination.
        ArkanAudio.playFast('system_purge');
        useSystemLogStore.getState().addLog(`INITIATING_TERMINATION: NODE_${sessionId.substring(0, 8)}`, 'critical');
        // Actual termination logic requires backend function in Supabase
    },

    triggerSecurityHandshake: () => {
        ArkanAudio.playFast('digital_handshake');
    },

    generateLocalKey: () => {
        // Simple generation for demo purposes, in real app use crypto.subtle
        if (get().localKey) return; // Don't overwrite if exists

        const key = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
        localStorage.setItem('arkan_neural_key', key);
        set({ localKey: key });
        useSystemLogStore.getState().addLog("LOCAL_ENCRYPTION_KEY_INITIALIZED_AND_SECURED.", 'system');
    },

    rotateLocalKey: () => {
        ArkanAudio.playFast('lock');
        const key = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
        localStorage.setItem('arkan_neural_key', key);
        set({ localKey: key });
        useSystemLogStore.getState().addLog("MASTER_KEY_ROTATED_SUCCESSFULLY.", 'critical');
    },

    stopLoading: () => set({ isLoading: false })
}));
