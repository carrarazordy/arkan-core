'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Search, ArrowLeft, MoreHorizontal, Download, Filter, Inbox } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import { ArkanAudio } from '@/lib/audio/ArkanAudio';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function GlobalArchivePage() {
    const { tasks, fetchTasks } = useTaskStore();
    const router = useRouter();

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Escape to go back
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleBack();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const inboxTasks = tasks.filter(t => !t.projectId || t.projectId === 'null' || t.projectId === 'inbox');

    const handleBack = () => {
        ArkanAudio.playFast('shimmer');
        router.back();
    };

    return (
        <div className="h-full w-full bg-[#0a0a0a] text-primary flex flex-col font-mono relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-10"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(249, 249, 6, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(249, 249, 6, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            ></div>

            {/* Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-primary/20 bg-black/60 backdrop-blur z-10">
                <div className="flex items-center gap-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center justify-center p-2 hover:bg-primary/10 rounded transition-colors group"
                        title="Return to Grid (Esc)"
                    >
                        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-widest uppercase flex items-center gap-3 text-white">
                            <Database className="h-5 w-5 text-primary" />
                            Global_Archive_Browser
                        </h1>
                        <p className="text-[10px] text-primary/60 tracking-widest mt-1">
                            TOTAL_ENTITITES_INDEXED: {inboxTasks.length}
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="relative group w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH_INDEX..."
                            className="w-full bg-black/40 border border-primary/20 rounded py-2 pl-9 pr-4 text-[11px] text-primary placeholder:text-primary/20 focus:border-primary focus:bg-primary/5 transition-all outline-none uppercase tracking-wider"
                        />
                    </div>
                    <button className="flex items-center justify-center p-2 border border-primary/20 bg-primary/5 hover:bg-primary hover:text-black rounded transition-colors">
                        <Filter className="h-4 w-4" />
                    </button>
                    <button className="flex items-center justify-center p-2 border border-primary/20 bg-primary/5 hover:bg-primary hover:text-black rounded transition-colors">
                        <Download className="h-4 w-4" />
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-6xl mx-auto"
                >
                    <div className="border border-primary/20 bg-black/80 rounded overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 p-4 border-b border-primary/20 bg-primary/5 text-[10px] font-bold tracking-widest uppercase opacity-70">
                            <div className="col-span-1">ID</div>
                            <div className="col-span-5">Raw_Directive</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2">Timestamp</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        {/* Table Body */}
                        <div className="flex flex-col">
                            {inboxTasks.length > 0 ? (
                                inboxTasks.map((task) => (
                                    <div key={task.id} className="grid grid-cols-12 gap-4 p-4 border-b border-primary/10 hover:bg-primary/5 transition-colors items-center group">
                                        <div className="col-span-1 text-[10px] opacity-60">
                                            {task.id.slice(-4)}
                                        </div>
                                        <div className="col-span-5 text-xs text-white/90 truncate pr-4">
                                            {task.title}
                                        </div>
                                        <div className="col-span-2">
                                            <span className={cn(
                                                "px-2 py-1 text-[9px] rounded uppercase font-bold tracking-wider",
                                                task.status === 'completed' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                                                    "bg-primary/10 text-primary border border-primary/20"
                                            )}>
                                                {task.status || 'UNASSIGNED'}
                                            </span>
                                        </div>
                                        <div className="col-span-2 text-[10px] opacity-60">
                                            {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'UNKNOWN'}
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-[10px] border border-primary/40 px-2 py-1 hover:bg-primary hover:text-black transition-colors rounded uppercase font-bold">
                                                Route
                                            </button>
                                            <button className="p-1 hover:bg-primary/20 rounded transition-colors text-primary/60 hover:text-primary">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 flex flex-col items-center justify-center text-primary/30">
                                    <Inbox className="h-12 w-12 mb-4 opacity-50" />
                                    <div className="text-sm tracking-widest uppercase font-bold">Archive_Empty</div>
                                    <div className="text-[10px] mt-2">NO UNASSIGNED ENTITIES IN STORAGE</div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
