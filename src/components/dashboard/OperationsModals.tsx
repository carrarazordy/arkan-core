'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Settings2, Info, CheckCircle, X, Orbit, Zap, AlignLeft, BarChart3, Database } from 'lucide-react';
import { useOperationsStore } from '@/store/useOperationsStore';
import { useProjectStore } from '@/store/useProjectStore';
import { ArkanAudio } from '@/lib/audio/ArkanAudio';
import { cn } from '@/lib/utils';

export function OperationsModals() {
    const { isOpen, step, directive, parsedName, parsedPriority, setStep, setDirective, setParsedData, closeOperations } = useOperationsStore();

    // Internal state for Step 3
    const [finalName, setFinalName] = useState('');
    const [finalPriority, setFinalPriority] = useState('ELEVATED');

    // Entropy logs state
    const [entropyLogs, setEntropyLogs] = useState<string[]>([]);
    const [entropyProgress, setEntropyProgress] = useState(0);

    // Sync parsed data to final state when entering step 3
    useEffect(() => {
        if (step === 'PROTOCOL') {
            setFinalName(parsedName || 'NEW_OPERATION');
            setFinalPriority(parsedPriority || 'ELEVATED');
        }
    }, [step, parsedName, parsedPriority]);

    // Entropy simulation logic
    useEffect(() => {
        if (step === 'ENTROPY') {
            setEntropyLogs(["[SYS] INITIATING NEURAL SHAKE...", "[SYS] PARSING RAW DIRECTIVE..."]);
            setEntropyProgress(10);

            const timers = [
                setTimeout(() => { setEntropyLogs(prev => [...prev, "[AI] FETCHING NEURAL_WEIGHTS..."]); setEntropyProgress(40); ArkanAudio.playFast('clack'); }, 800),
                setTimeout(() => { setEntropyLogs(prev => [...prev, "[AI] SYNTHESIZING PARAMETERS..."]); setEntropyProgress(70); ArkanAudio.playFast('clack'); }, 1800),
                setTimeout(() => { setEntropyLogs(prev => [...prev, "[SYS] DATA ALIGNMENT COMPLETE."]); setEntropyProgress(100); ArkanAudio.playFast('system_engage'); }, 2800),
                setTimeout(() => {
                    // Extract fake parsed data from directive
                    const extractedName = directive.substring(0, 30).trim() || 'UNTITLED_DIRECTIVE';
                    const isUrgent = directive.toLowerCase().includes('urgent') || directive.toLowerCase().includes('critical');
                    setParsedData(extractedName, isUrgent ? 'CRITICAL' : 'ELEVATED');
                    setStep('PROTOCOL');
                }, 3500)
            ];

            return () => timers.forEach(clearTimeout);
        }
    }, [step, directive, setParsedData, setStep]);

    const handleTransmit = () => {
        if (!directive.trim()) {
            ArkanAudio.playFast('error');
            return;
        }
        ArkanAudio.playFast('system_engage');
        setStep('ENTROPY');
    };

    const handleConfirm = async () => {
        if (!finalName.trim()) {
            ArkanAudio.playFast('error');
            return;
        }
        ArkanAudio.play('system_execute_clack');
        await useProjectStore.getState().addProject({
            name: finalName.toUpperCase(),
            description: directive || "Initialized via Active Operations",
            technicalId: finalName.substring(0, 3).toUpperCase() + "-" + Math.floor(Math.random() * 1000),
            status: "running",
            progress: 0,
            tags: [finalPriority],
            completedTasks: 0,
            totalTasks: 0,
            color: finalPriority === 'CRITICAL' ? '#ff3333' : '#f9f906'
        });
        closeOperations();
    };

    const handleClose = () => {
        ArkanAudio.playFast('clack');
        closeOperations();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-[2px] flex items-center justify-center font-mono">
            <AnimatePresence mode="wait">

                {/* STEP 1: INITIALIZE */}
                {step === 'INITIALIZE' && (
                    <motion.div
                        key="step-1"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="w-full max-w-lg border border-primary bg-black/95 shadow-[0_0_20px_rgba(249,249,6,0.3)] relative overflow-hidden"
                    >
                        {/* Scanline Effect */}
                        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                            <div className="w-full h-10 bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-[scan_3s_linear_infinite]" />
                        </div>

                        {/* Corners */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary"></div>

                        <div className="px-6 py-4 border-b border-primary/30 flex items-center justify-between bg-primary/5">
                            <h2 className="text-primary text-sm font-bold tracking-widest flex items-center gap-2">
                                <Settings2 className="h-4 w-4" />
                                MODULE_INITIALIZATION // ENTER_DIRECTIVE:
                            </h2>
                            <button onClick={handleClose} className="text-primary/50 hover:text-primary transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="mb-2 flex justify-between">
                                <label className="text-[10px] text-primary tracking-tighter uppercase">system_request: raw_input</label>
                                <label className="text-[10px] text-primary/40 uppercase">status: pending_directive</label>
                            </div>
                            <div className="relative group">
                                <input
                                    autoFocus
                                    className="w-full bg-black border border-primary/60 text-primary p-4 font-mono text-lg tracking-widest placeholder:text-primary/20 focus:ring-0 focus:border-primary transition-all duration-300"
                                    placeholder="ENTER RAW DIRECTIVE / PAIN POINT..."
                                    type="text"
                                    value={directive}
                                    onChange={(e) => setDirective(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleTransmit()}
                                />
                                <div className="absolute inset-0 pointer-events-none border border-primary opacity-0 group-focus-within:opacity-100 blur-[2px] transition-opacity"></div>
                            </div>

                            <div className="mt-4 flex items-center gap-2 text-[9px] text-primary/60">
                                <Info className="h-3 w-3" />
                                <span>PROVIDE CORE OBJECTIVE FOR NEURAL SYNTHESIS</span>
                            </div>

                            <div className="mt-10 flex gap-4">
                                <button onClick={handleTransmit} className="flex-1 px-4 py-3 bg-primary text-black font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_15px_rgba(249,249,6,0.6)] transition-all flex items-center justify-center gap-2 group">
                                    <Zap className="h-4 w-4 fill-black" />
                                    TRANSMIT_DATA
                                </button>
                                <button onClick={handleClose} className="flex-1 px-4 py-3 border border-primary/40 text-primary/80 font-bold uppercase tracking-widest text-xs hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-2 relative">
                                    <span className="absolute left-2 opacity-50 text-xs">[</span>
                                    ABORT
                                    <span className="absolute right-2 opacity-50 text-xs">]</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: ENTROPY */}
                {step === 'ENTROPY' && (
                    <motion.div
                        key="step-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="w-full max-w-3xl bg-[#0a0a0a] border border-primary shadow-[0_0_15px_rgba(249,249,6,0.1)] relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary opacity-50"></div>
                        <div className="flex justify-between items-start p-6 border-b border-primary/20">
                            <div>
                                <h1 className="text-primary text-xl font-bold tracking-widest flex items-center gap-3">
                                    <Orbit className="h-5 w-5 animate-spin-slow" />
                                    ENTROPY_COLLECTION_SCAN // INPUT_DATA:
                                </h1>
                                <p className="text-[10px] text-primary/60 mt-1">PROTOCOL_ID: ARKAN_X_99 // SYNTHESIZING_DIRECTIVE</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="border border-primary/20 p-3 bg-black">
                                    <span className="text-[9px] text-primary/40 block">LATENCY_SYNC</span>
                                    <span className="text-primary text-sm flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div> 0.042 MS</span>
                                </div>
                                <div className="border border-primary/20 p-3 bg-black">
                                    <span className="text-[9px] text-primary/40 block">ENCRYPTION_LAYER</span>
                                    <span className="text-primary text-sm uppercase">AES-256-GCM</span>
                                </div>
                                <div className="border border-primary/20 p-3 bg-black">
                                    <span className="text-[9px] text-primary/40 block">PROGRESS</span>
                                    <span className="text-primary text-sm uppercase">{entropyProgress}%</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-primary text-xs font-bold tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-primary animate-pulse"></span>
                                        DESCRIPTION_DATA_STREAM:
                                    </label>
                                </div>
                                <div className="w-full bg-black border border-primary/30 p-4 font-mono text-sm min-h-[120px] text-primary/80 overflow-y-auto">
                                    <div className="opacity-50 text-white/50 mb-4">{directive}</div>
                                    <div className="flex flex-col gap-1">
                                        {entropyLogs.map((log, i) => (
                                            <span key={i} className="text-primary animate-in fade-in slide-in-from-bottom-2">&gt; {log}</span>
                                        ))}
                                        {entropyProgress < 100 && (
                                            <span className="text-primary/50 animate-pulse">&gt; _</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: PROTOCOL */}
                {step === 'PROTOCOL' && (
                    <motion.div
                        key="step-3"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-3xl border border-primary shadow-[0_0_15px_rgba(249,249,6,0.2)] bg-black p-1"
                    >
                        <div className="border border-primary/30 p-6 relative overflow-hidden bg-[#0a0a05]">
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, rgba(249, 249, 6, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(249, 249, 6, 0.5) 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>

                            <div className="relative z-10 flex justify-between items-start mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Database className="h-4 w-4 text-primary" />
                                        <h2 className="text-xs font-bold tracking-widest text-primary/70">CORE_OPERATION_REQUEST</h2>
                                    </div>
                                    <h1 className="text-2xl font-bold tracking-tighter text-primary">
                                        INITIALIZE_PROJECT_PROTOCOL <span className="text-primary/40 font-light">//</span> DEFINE_PARAMETERS:
                                    </h1>
                                </div>
                                <button onClick={handleClose} className="hover:bg-primary hover:text-black border border-primary/40 p-1 transition-colors text-primary">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="relative z-10 grid grid-cols-12 gap-8">
                                <div className="col-span-7 flex flex-col gap-6">
                                    <div>
                                        <label className="block text-[10px] mb-2 opacity-60 tracking-widest font-bold text-primary">OPERATION_TITLE</label>
                                        <input
                                            className="w-full bg-primary/5 border border-primary/40 text-primary px-3 py-2 text-sm font-mono focus:border-primary outline-none"
                                            type="text"
                                            value={finalName}
                                            onChange={(e) => setFinalName(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] mb-2 opacity-60 tracking-widest font-bold text-primary">PRIORITY_LEVEL</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['ROUTINE', 'ELEVATED', 'CRITICAL'].map((p) => (
                                                <button
                                                    key={p}
                                                    onClick={() => { setFinalPriority(p); ArkanAudio.playFast('clack'); }}
                                                    className={cn(
                                                        "border text-[11px] py-2 font-bold transition-colors",
                                                        finalPriority === p
                                                            ? (p === 'CRITICAL' ? "bg-red-500 border-red-500 text-black shadow-[0_0_10px_rgba(255,0,0,0.5)]" : "bg-primary border-primary text-black shadow-[0_0_10px_rgba(249,249,6,0.3)]")
                                                            : "border-primary/40 text-primary/60 hover:border-primary hover:text-primary"
                                                    )}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-[10px] opacity-60 tracking-widest font-bold text-primary">MEMORY_QUOTA_RESERVE</label>
                                            <span className="text-xs text-primary">4.2 GB</span>
                                        </div>
                                        <div className="h-2 w-full bg-primary/10 border border-primary/30 relative">
                                            <div className="absolute inset-y-0 left-0 bg-primary w-[65%]"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-5 flex flex-col gap-4 border-l border-primary/20 pl-8">
                                    <div className="p-3 bg-primary/5 border border-primary/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_5px_#f9f906]"></span>
                                            <span className="text-[10px] font-bold text-primary">KERNEL_STATUS_READY</span>
                                        </div>
                                        <p className="text-[10px] leading-relaxed opacity-80 text-primary/70">
                                            INITIALIZING THE MODULE WILL ALLOCATE THREADS TO THE DESIGNATED SECTOR. ENSURE HANDSHAKE PROTOCOLS ARE SYNCED AND DIRECTIVE IS CLEAR.
                                        </p>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-end gap-2 text-primary">
                                        <div className="flex justify-between text-[10px] opacity-60">
                                            <span>UP_TIME:</span>
                                            <span className="animate-pulse">00:05:32</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] opacity-60">
                                            <span>UPLINK:</span>
                                            <span className="text-green-400">NOMINAL</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] opacity-60">
                                            <span>ENTROPY_SCORE:</span>
                                            <span>99%_STABLE</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 flex justify-between items-end mt-10 pt-6 border-t border-primary/20">
                                <div className="text-[9px] font-bold opacity-30 tracking-[0.2em] uppercase text-primary">
                                    Arkan-Source_v0.1 // System_Admin_Access
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={handleClose} className="px-6 py-2 border border-primary/40 text-primary text-[11px] font-bold hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 transition-all uppercase">
                                        Abort_Session
                                    </button>
                                    <button onClick={handleConfirm} className="px-8 py-2 bg-primary text-black text-[11px] font-black hover:shadow-[0_0_20px_rgba(249,249,6,0.5)] transition-all uppercase flex items-center gap-2">
                                        <span>CONFIRM_INITIALIZATION</span>
                                        <CheckCircle className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
