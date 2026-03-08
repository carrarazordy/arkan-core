"use client";

import { useState, useEffect } from "react";
import {
    Brain,
    Sparkles,
    Search,
    Plus,
    Command,
    Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNoteStore } from "@/store/useNoteStore";
import { useDialogStore } from "@/store/useDialogStore";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";
import { FileSystem, FileSystemNode } from "@/components/notes/FileSystem";
import { NeuralEditor } from "@/components/notes/NeuralEditor";
import { Note } from "@/lib/types";

export default function NotesPage() {
    const { notes, isLoading, fetchNotes, addNote, updateNote } = useNoteStore();
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    // --- Tree Construction Logic ---
    const buildTree = (allItems: Note[]): FileSystemNode[] => {
        // Seprate folders and notes
        const folderNotes = allItems.filter(n => n.tags.includes('FOLDER'));
        const fileNotes = allItems.filter(n => !n.tags.includes('FOLDER'));

        const nodeMap = new Map<string, FileSystemNode>();

        // 1. Create Folder Nodes
        folderNotes.forEach(f => {
            nodeMap.set(f.id, {
                id: f.id,
                name: f.title,
                type: 'folder',
                children: [],
                parentId: f.folderId || 'Projects' // Default parent
            });
        });

        // 2. Map Files to their parents
        fileNotes.forEach(f => {
            const node: FileSystemNode = {
                id: f.id,
                name: f.title,
                type: 'note',
                parentId: f.folderId || 'Projects'
            };
            // If parent is a known folder, add to it
            if (nodeMap.has(node.parentId!)) {
                nodeMap.get(node.parentId!)!.children?.push(node);
            } else {
                // Add to virtual roots later
            }
        });

        // 3. Nest Folders
        const roots: FileSystemNode[] = [];

        // Virtual Roots
        const projectRoot: FileSystemNode = { id: 'Projects', name: 'PROJECT_PROTOCOLS', type: 'folder', children: [] };
        const archiveRoot: FileSystemNode = { id: 'Archive', name: 'ARCHIVE_MEMORY', type: 'folder', children: [] };

        // Process Folders
        folderNotes.forEach(f => {
            const node = nodeMap.get(f.id)!;
            const parentId = f.folderId || 'Projects';

            if (parentId === 'Projects') {
                projectRoot.children?.push(node);
            } else if (parentId === 'Archive') {
                archiveRoot.children?.push(node);
            } else if (nodeMap.has(parentId)) {
                nodeMap.get(parentId)!.children?.push(node);
            } else {
                // Orphaned? Default to Projects
                projectRoot.children?.push(node);
            }
        });

        // Process Files (Direct children of roots)
        fileNotes.forEach(f => {
            const parentId = f.folderId || 'Projects';
            const node: FileSystemNode = { id: f.id, name: f.title, type: 'note' };

            if (parentId === 'Projects') projectRoot.children?.push(node);
            else if (parentId === 'Archive') archiveRoot.children?.push(node);
            // else it was already added to a folder in step 2 if that folder existed
        });

        return [projectRoot, archiveRoot];
    };

    const fileSystemData = buildTree(notes);
    const activeNote = notes.find(n => n.id === selectedNoteId);

    // --- Action Handlers ---

    const handleSelectNote = (id: string) => {
        const note = notes.find(n => n.id === id);
        if (note) {
            setSelectedNoteId(id);
            useNoteStore.getState().setNote(note);
            ArkanAudio.playFast('system_engage');
        }
    };

    const handleCreateNote = async () => {
        useDialogStore.getState().openDialog({
            title: 'INITIALIZE_PROTOCOL // ENTER_TITLE:',
            placeholder: 'NOTE_DESIGNATION...',
            confirmLabel: 'CREATE_NODE',
            onConfirm: async (title) => {
                try {
                    await addNote({
                        title: title.toUpperCase(),
                        content: `# ${title.toUpperCase()}\n\n> INITIALIZING_MEMORY_BLOCK...\n\n`,
                        folderId: 'Projects',
                        tags: [],
                        isFavorite: false
                    });
                    ArkanAudio.play('processing_blip'); // Feedback
                } catch (e) { console.error(e); }
            }
        });
    };

    const handleCreateSubfolder = (parentId: string) => {
        useDialogStore.getState().openDialog({
            title: 'NEW_SECTOR // ENTER_NAME:',
            placeholder: 'SECTOR_DESIGNATION...',
            confirmLabel: 'INITIALIZE_SECTOR',
            onConfirm: async (name) => {
                try {
                    // Create a "Note" that acts as a folder
                    await addNote({
                        title: name.toUpperCase(),
                        content: '',
                        folderId: parentId,
                        tags: ['FOLDER'],
                        isFavorite: false
                    });
                } catch (e) { console.error(e); }
            }
        });
    };

    const handleRename = (id: string, currentName: string) => {
        // Check if it's a root
        if (id === 'Projects' || id === 'Archive') return;

        useDialogStore.getState().openDialog({
            title: 'RENAME_PROTOCOL // EDIT_ID:',
            initialValue: currentName,
            confirmLabel: 'UPDATE_ID',
            onConfirm: async (newName) => {
                try {
                    await updateNote(id, { title: newName.toUpperCase() });
                } catch (e) { console.error(e); }
            }
        });
    };

    const handleDelete = (id: string, type: 'folder' | 'note') => {
        // Check if it's a root
        if (id === 'Projects' || id === 'Archive') return;

        useDialogStore.getState().openDialog({
            title: `DELETE_PROTOCOL // CONFIRM ${type.toUpperCase()}?`,
            placeholder: 'TYPE "CONFIRM" TO EXECUTE...',
            confirmLabel: 'TERMINATE',
            onConfirm: async (val) => {
                if (val.toUpperCase() === 'CONFIRM') {
                    ArkanAudio.play('system_purge');
                    await useNoteStore.getState().deleteNote(id);
                    if (selectedNoteId === id) {
                        setSelectedNoteId(null);
                        useNoteStore.setState({ activeNote: null, buffer: "" });
                    }
                }
            }
        });
    };

    return (
        <div className="flex h-full relative bg-black text-slate-300 font-mono overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(249, 249, 6, .3) 25%, rgba(249, 249, 6, .3) 26%, transparent 27%, transparent 74%, rgba(249, 249, 6, .3) 75%, rgba(249, 249, 6, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(249, 249, 6, .3) 25%, rgba(249, 249, 6, .3) 26%, transparent 27%, transparent 74%, rgba(249, 249, 6, .3) 75%, rgba(249, 249, 6, .3) 76%, transparent 77%, transparent)`,
                    backgroundSize: '50px 50px'
                }}
            ></div>

            {/* PANE 1: FILE SYSTEM (Left) */}
            <aside className="w-64 border-r border-[#23230f] bg-[#0a0a05]/95 backdrop-blur-sm flex flex-col shrink-0 z-10 transition-all">
                <div className="p-4 border-b border-[#23230f] bg-[#0d0d04]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-primary opacity-50">
                            <Terminal className="h-4 w-4" />
                            <span className="text-xs font-bold tracking-widest uppercase">Neural_Archive_v0.9</span>
                        </div>
                        <button
                            onClick={handleCreateNote}
                            className="text-primary/50 hover:text-primary transition-colors p-1"
                            title="NEW_ENTRY"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2 top-1.5 h-3 w-3 text-primary/40" />
                        <input
                            className="w-full bg-[#1a1a0a] border border-[#23230f] rounded-sm py-1 pl-8 pr-2 text-[10px] text-primary placeholder:text-primary/20 outline-none focus:border-primary/50 transition-colors uppercase"
                            placeholder="SEARCH_MEMORY..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    <FileSystem
                        data={fileSystemData}
                        activeNoteId={selectedNoteId}
                        onSelectNote={handleSelectNote}
                        onCreateSubfolder={handleCreateSubfolder}
                        onRename={handleRename}
                        onDelete={handleDelete}
                    />
                </div>

                <div className="p-2 border-t border-[#23230f]">
                    <button
                        onClick={handleCreateNote}
                        className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-[#23230f] text-[10px] text-zinc-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all uppercase tracking-widest"
                    >
                        <Plus className="h-3 w-3" />
                        Init_New_Node
                    </button>
                </div>
            </aside>

            {/* PANE 2: EDITOR (Center) */}
            <main className="flex-1 flex flex-col relative bg-[#050502] z-0">
                {activeNote ? (
                    <NeuralEditor
                        key={activeNote.id} // Force remount on note change for now to reset state cleanly
                        initialContent={activeNote.content || ""}
                        onSave={(content) => updateNote(activeNote.id, { content })}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-20 select-none">
                        <Brain className="h-24 w-24 text-primary animate-pulse" />
                        <span className="mt-4 text-xs font-mono tracking-[0.3em] text-primary uppercase">Waiting for Uplink...</span>
                    </div>
                )}
            </main>

            {/* PANE 3: AI SYNAPSE (Right) */}
            <aside className="w-72 border-l border-[#23230f] bg-[#0a0a05]/95 backdrop-blur-sm flex flex-col shrink-0 z-10 hidden xl:flex">
                <div className="p-6 border-b border-[#23230f]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_5px_currentColor]" />
                        <h2 className="text-xs font-bold tracking-widest text-primary uppercase">AI_Synapse_Core</h2>
                    </div>
                    <div className="h-1 bg-primary/10 w-full rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-2/3 opacity-50 animate-pulse"></div>
                    </div>
                </div>

                <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
                    {/* Metrics Simulation */}
                    <div className="space-y-4">
                        <div className="flex justify-between text-[10px] text-primary/60 uppercase tracking-widest">
                            <span>Technical_Depth</span>
                            <span>84%</span>
                        </div>
                        <div className="h-24 border border-primary/20 bg-primary/5 relative overflow-hidden rounded-sm">
                            {/* Graphic simulation */}
                            <div className="absolute bottom-0 left-0 w-full h-[84%] bg-primary/10 border-t border-primary/30"></div>
                            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_4px,rgba(249,249,6,0.1)_5px)]"></div>
                        </div>

                        <div className="flex justify-between text-[10px] text-primary/60 uppercase tracking-widest">
                            <span>Clarity_Index</span>
                            <span className="text-primary animate-pulse">OPTIMAL</span>
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-sm">
                        <div className="flex items-center gap-2 mb-3 text-primary/80">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Suggestion</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                            &gt; ANALYSIS_COMPLETE<br />
                            &gt; PATTERN DETECTED: Reference to "Chronos Engine".<br />
                            &gt; RECOMMENDATION: Link to [timers/page.tsx] for context continuity.
                        </p>
                        <button
                            onClick={() => ArkanAudio.playFast('confirm')}
                            className="mt-3 w-full py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-black border border-primary/30 text-[9px] font-bold uppercase tracking-widest transition-all"
                        >
                            Execute_Link
                        </button>
                    </div>
                </div>

                <div className="p-4 border-t border-[#23230f] bg-[#050502]">
                    <div className="flex items-center justify-between text-[9px] text-zinc-600 font-mono">
                        <div className="flex items-center gap-2">
                            <Command className="h-3 w-3" />
                            <span>SYNAPSE_IDLE</span>
                        </div>
                        <span>v9.2.1</span>
                    </div>
                </div>
            </aside>
        </div>
    );
}
