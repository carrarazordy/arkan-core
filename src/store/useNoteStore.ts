import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase, COLLECTIONS } from '@/lib/supabase';
import { Note } from '@/lib/types';
import { ArkanAudio } from '@/lib/audio/ArkanAudio';

interface NoteSession {
    startTime: number;
    targetWords: number;
    currentWords: number;
    currentChars: number;
}

interface NoteState {
    notes: Note[];
    isLoading: boolean;
    error: string | null;
    activeNote: Note | null;
    buffer: string;
    session: NoteSession;
    isSyncing: boolean;

    fetchNotes: () => Promise<void>;
    addNote: (note: Omit<Note, 'id'>) => Promise<void>;
    updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    setNote: (note: Note) => void;
    updateBuffer: (content: string) => void;
    syncToBackend: () => Promise<void>;
    updateSession: (updates: Partial<NoteSession>) => void;
    resetSession: () => void;
    subscribeToNotes: () => () => void;
}

export const useNoteStore = create<NoteState>()(
    persist(
        (set, get) => ({
            notes: [],
            isLoading: false,
            error: null,
            activeNote: null,
            buffer: "",
            isSyncing: false,
            session: {
                startTime: Date.now(),
                targetWords: 1500,
                currentWords: 0,
                currentChars: 0
            },

            fetchNotes: async () => {
                set({ isLoading: true, error: null });
                try {
                    const { data, error } = await supabase
                        .from(COLLECTIONS.NOTES)
                        .select('*')
                        .order('updated_at', { ascending: false });

                    if (error) throw error;

                    const mappedNotes: Note[] = (data || []).map((doc: any) => ({
                        id: doc.id,
                        title: doc.title,
                        content: doc.content || "",
                        folderId: doc.folder_id, // Map snake_case to camelCase
                        isFavorite: doc.is_favorite,
                        tags: doc.tags || [],
                        projectId: doc.project_id,
                        updatedAt: new Date(doc.updated_at)
                    }));
                    set({ notes: mappedNotes, isLoading: false });
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                }
            },

            addNote: async (noteData) => {
                set({ isLoading: true });
                try {
                    const { data, error } = await supabase
                        .from(COLLECTIONS.NOTES)
                        .insert({
                            title: noteData.title,
                            content: noteData.content,
                            folder_id: noteData.folderId,
                            is_favorite: noteData.isFavorite ?? false,
                            tags: noteData.tags ?? [],
                            project_id: noteData.projectId
                        })
                        .select()
                        .single();

                    if (error) throw error;

                    const newNote: Note = {
                        id: data.id,
                        title: data.title,
                        content: data.content,
                        folderId: data.folder_id,
                        isFavorite: data.is_favorite,
                        tags: data.tags || [],
                        projectId: data.project_id,
                        updatedAt: new Date(data.updated_at)
                    };

                    set(state => ({
                        notes: [newNote, ...state.notes],
                        activeNote: newNote, // Auto-select new note
                        buffer: newNote.content,
                        isLoading: false
                    }));
                    ArkanAudio.playFast('confirm');
                } catch (err: any) {
                    set({ error: err.message, isLoading: false });
                    ArkanAudio.playFast('thump');
                }
            },

            updateNote: async (id, updates) => {
                // Optimistic UI update
                const oldNotes = get().notes;
                set(state => ({
                    notes: state.notes.map(n => n.id === id ? { ...n, ...updates } : n)
                }));

                try {
                    const payload: any = { ...updates };
                    // Map camelCase to snake_case
                    if (updates.folderId !== undefined) {
                        payload.folder_id = updates.folderId;
                        delete payload.folderId;
                    }
                    if (updates.isFavorite !== undefined) {
                        payload.is_favorite = updates.isFavorite;
                        delete payload.isFavorite;
                    }
                    if (updates.projectId !== undefined) {
                        payload.project_id = updates.projectId;
                        delete payload.projectId;
                    }

                    const { error } = await supabase
                        .from(COLLECTIONS.NOTES)
                        .update(payload)
                        .eq('id', id);

                    if (error) throw error;
                    ArkanAudio.playFast('clack');
                } catch (err: any) {
                    set({ notes: oldNotes, error: err.message });
                    ArkanAudio.playFast('thump');
                }
            },

            deleteNote: async (id) => {
                const oldNotes = get().notes;
                set(state => ({
                    notes: state.notes.filter(n => n.id !== id)
                }));

                try {
                    const { error } = await supabase
                        .from(COLLECTIONS.NOTES)
                        .delete()
                        .eq('id', id);

                    if (error) throw error;
                    ArkanAudio.playFast('alert_chime');
                } catch (err: any) {
                    set({ notes: oldNotes, error: err.message });
                }
            },

            setNote: (note) => {
                set({
                    activeNote: note,
                    buffer: note.content || "",
                    session: { ...get().session, currentWords: (note.content || "").trim().split(/\s+/).filter(Boolean).length }
                });
            },

            updateBuffer: (content) => {
                const words = content.trim().split(/\s+/).filter(Boolean).length;
                const chars = content.length;
                set({
                    buffer: content,
                    session: { ...get().session, currentWords: words, currentChars: chars }
                });
            },

            syncToBackend: async () => {
                const { activeNote, buffer } = get();
                if (!activeNote || get().isSyncing) return;

                set({ isSyncing: true });
                try {
                    const { error } = await supabase
                        .from(COLLECTIONS.NOTES)
                        .update({ content: buffer })
                        .eq('id', activeNote.id);

                    if (error) throw error;

                    set({ isSyncing: false });
                    ArkanAudio.playFast('clack');
                } catch (error) {
                    console.error("Sync failed:", error);
                    set({ isSyncing: false });
                    ArkanAudio.playFast('thump');
                }
            },

            updateSession: (updates) => set((state) => ({
                session: { ...state.session, ...updates }
            })),

            resetSession: () => set({
                session: {
                    startTime: Date.now(),
                    targetWords: 1500,
                    currentWords: 0,
                    currentChars: 0
                }
            }),

            subscribeToNotes: () => {
                const channel = supabase
                    .channel('public:notes')
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: COLLECTIONS.NOTES },
                        (payload: any) => {
                            // Simple strategy: re-fetch notes on any change
                            get().fetchNotes();
                        }
                    )
                    .subscribe();
                return () => {
                    supabase.removeChannel(channel);
                };
            }
        }),
        {
            name: 'arkan-neural-buffer',
            storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : {
                getItem: () => null,
                setItem: () => { },
                removeItem: () => { }
            }),
            partialize: (state) => ({ buffer: state.buffer, activeNote: state.activeNote }),
        }
    )
);
