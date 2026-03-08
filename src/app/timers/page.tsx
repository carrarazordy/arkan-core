"use client";

import { useEffect, useState, useRef } from "react";
import { useChronosStore } from "@/store/useChronosStore";
import { cn } from "@/lib/utils";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useDialogStore } from "@/store/useDialogStore";

// Icons (using Lucide as substitutes for Material Icons where appropriate for consistency, or standard mapped ones)
import {
    Grid as GridIcon,
    Timer,
    FileText,
    BarChart2,
    Settings,
    Play,
    Pause,
    RotateCcw,
    ChevronUp,
    ChevronDown,
    MousePointer2,
    Volume2
} from "lucide-react";

export default function TimersPage() {
    const {
        timers, activeTimerId, metronome,
        initializeTimer, startTimer, pauseTimer, resetTimer, tick,
        setMainDisplay, adjustMainTimer,
        toggleMetronome, setBpm, adjustBpm, setSignature
    } = useChronosStore();

    const activeTimer = activeTimerId ? timers[activeTimerId] : null;

    // Metronome Pulse Visuals
    const [beatPulse, setBeatPulse] = useState(false);

    // Dial Interaction State
    const dialRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [lastY, setLastY] = useState(0);
    const [isSigOpen, setIsSigOpen] = useState(false);

    // Global Tick Loop & Metronome Listener
    useEffect(() => {
        let frameId: number;
        const loop = () => {
            tick();
            frameId = requestAnimationFrame(loop);
        };
        frameId = requestAnimationFrame(loop);

        // Listen for metronome events from Audio Engine
        const onBeat = (e: any) => {
            setBeatPulse(true);
            setTimeout(() => setBeatPulse(false), 100);
        };
        window.addEventListener('metronome-beat', onBeat);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('metronome-beat', onBeat);
        };
    }, [tick]);

    // Initialize default Timers if empty
    useEffect(() => {
        if (Object.keys(timers).length === 0) {
            initializeTimer('MAIN_POMODORO', 25, 'DEEP_FOCUS_PROTOCOL', 'POMODORO');
            initializeTimer('SHORT_BREAK', 5, 'NEURAL_RECHARGE', 'CUSTOM');
        }
    }, [timers, initializeTimer]);

    // Format helpers
    const formatTime = (ms: number) => {
        const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getProgress = (timer: any) => {
        if (!timer) return 0;
        const progress = 1 - (timer.remainingMs / timer.durationMs);
        return Math.min(Math.max(progress, 0), 1) * 100;
    };

    // Dial Logic
    const handleDialDown = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setLastY(clientY);
    };

    const handleDialMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
        const delta = lastY - clientY; // Up interaction increases BPM

        if (Math.abs(delta) > 5) { // Sensitivity threshold
            adjustBpm(delta > 0 ? 1 : -1);
            setLastY(clientY);
        }
    };

    const handleDialUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDialMove);
            window.addEventListener('mouseup', handleDialUp);
            window.addEventListener('touchmove', handleDialMove);
            window.addEventListener('touchend', handleDialUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleDialMove);
            window.removeEventListener('mouseup', handleDialUp);
            window.removeEventListener('touchmove', handleDialMove);
            window.removeEventListener('touchend', handleDialUp);
        }
    }, [isDragging, lastY]);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] -m-8 bg-black text-white font-mono overflow-hidden relative">
            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-20"
                style={{
                    backgroundImage: `linear-gradient(rgba(249, 249, 6, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 249, 6, 0.03) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}>
            </div>

            {/* HEADER - Kept consistent with app-shell but styled to match user spec somewhat */}
            <header className="h-14 border-b border-primary/20 flex items-center justify-between px-6 bg-black z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-7 h-7 bg-primary flex items-center justify-center">
                        <Timer className="text-black w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-[0.2em] text-primary leading-none uppercase">Arkan OS v2.4</span>
                        <span className="text-[9px] text-primary/50 tracking-tighter uppercase font-medium">Module // Chronos_Integrated_Hub</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-5 text-[9px] tracking-widest text-primary/60 font-mono">
                        <span className="flex items-center gap-1.5 text-primary"><span className="w-1 h-1 rounded-full bg-primary animate-pulse"></span> SYSTEM_STABLE</span>
                        <span>CPU: 08%</span>
                        <span>NET: 09MS</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative z-10">
                {/* SIDEBAR - Tiny one from spec */}
                <aside className="w-16 border-r border-primary/10 flex flex-col items-center py-6 gap-6 bg-black z-40 shrink-0">
                    <button className="p-2.5 text-primary/40 hover:text-primary transition-colors"><GridIcon className="w-5 h-5" /></button>
                    <button className="p-2.5 bg-primary/10 text-primary border border-primary/30 shadow-[0_0_8px_rgba(249,249,6,0.4)]"><Timer className="w-5 h-5" /></button>
                    <button className="p-2.5 text-primary/40 hover:text-primary transition-colors"><FileText className="w-5 h-5" /></button>
                    <button className="p-2.5 text-primary/40 hover:text-primary transition-colors"><BarChart2 className="w-5 h-5" /></button>
                    <div className="mt-auto"><button className="p-2.5 text-primary/40 hover:text-primary transition-colors"><Settings className="w-5 h-5" /></button></div>
                </aside>

                <main className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">

                        {/* MAIN TIMER SECTION */}
                        <section className="flex-1 flex flex-col items-center justify-center p-8 relative border-b lg:border-b-0 lg:border-r border-primary/5">
                            <div className="absolute top-6 left-6 text-[9px] text-primary/40 leading-relaxed font-mono tracking-tighter uppercase hidden sm:block">
                                CHRONOS_PRIMARY<br />
                                MODE: ADJUSTABLE_QUANTUM<br />
                                STATUS: {activeTimer?.status || 'OFFLINE'}
                            </div>

                            <div className={cn("relative flex items-center justify-center", activeTimer?.status === 'RUNNING' && "animate-[pulse-intense_2.5s_infinite_ease-in-out]")}>
                                {/* SVG Ring */}
                                <svg className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] -rotate-90">
                                    <circle className="text-primary/5" cx="50%" cy="50%" fill="transparent" r="45%" stroke="currentColor" strokeWidth="1"></circle>
                                    <circle
                                        className="text-primary drop-shadow-[0_0_20px_rgba(249,249,6,0.7)] transition-all duration-300 ease-linear"
                                        cx="50%" cy="50%" fill="transparent" r="45%" stroke="currentColor"
                                        strokeDasharray="974"
                                        strokeDashoffset={974 - (974 * getProgress(activeTimer)) / 100}
                                        strokeLinecap="square" strokeWidth="6">
                                    </circle>
                                </svg>

                                <div className="absolute flex flex-col items-center justify-center text-center">
                                    <div className="text-[10px] tracking-[0.5em] text-primary/40 mb-1 font-bold uppercase font-mono">
                                        {activeTimer?.label || 'TIMER_VALUE'}
                                    </div>
                                    <button
                                        onClick={() => {
                                            useDialogStore.getState().openDialog({
                                                title: "CHRONOS_ADJUST // ENTER_DURATION",
                                                placeholder: "MINUTES...",
                                                confirmLabel: "SET_TIMER",
                                                initialValue: activeTimer ? String(Math.ceil(activeTimer.durationMs / 60000)) : "25",
                                                onConfirm: (val) => {
                                                    const mins = Number(val);
                                                    if (!isNaN(mins) && mins > 0) adjustMainTimer(mins);
                                                }
                                            });
                                        }}
                                        className="group relative"
                                    >
                                        <div className="text-7xl sm:text-8xl font-black text-primary tracking-tighter tabular-nums font-mono group-hover:text-white transition-colors cursor-pointer leading-none">
                                            {activeTimer ? formatTime(activeTimer.remainingMs) : '00:00'}
                                        </div>
                                        <div className="absolute -bottom-2 left-0 w-full h-px bg-primary/20 scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                                    </button>
                                    <div className="text-[9px] tracking-[0.2em] text-primary/80 mt-6 flex items-center gap-2 uppercase font-mono">
                                        <span className={cn("w-1.5 h-1.5 bg-primary", activeTimer?.status === 'RUNNING' && "animate-ping")}></span>
                                        PROTOCOL_{activeTimer?.status}
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            {activeTimer && (
                                <div className="flex flex-col gap-4 mt-12 w-full max-w-xs z-10">
                                    <button
                                        onClick={() => startTimer(activeTimer.id)}
                                        disabled={activeTimer.status === 'RUNNING'}
                                        className="w-full py-4 bg-primary text-black font-bold uppercase tracking-[0.3em] text-xs hover:bg-white transition-all shadow-[0_0_30px_rgba(249,249,6,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        [ {activeTimer.status === 'PAUSED' ? 'RESUME_SEQUENCE' : 'START_SEQUENCE'} ]
                                    </button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => pauseTimer(activeTimer.id)}
                                            className="py-2.5 border border-primary/30 text-primary font-bold uppercase tracking-[0.1em] text-[9px] hover:bg-primary/5 font-mono"
                                        >
                                            PAUSE
                                        </button>
                                        <button
                                            onClick={() => resetTimer(activeTimer.id)}
                                            className="py-2.5 border border-primary/30 text-primary font-bold uppercase tracking-[0.1em] text-[9px] hover:bg-primary/5 font-mono"
                                        >
                                            RESET
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* METRONOME SECTION */}
                        <section className="w-full lg:w-[380px] flex flex-col p-8 relative bg-primary/[0.02]">
                            <div className="absolute top-6 right-6 text-[9px] text-primary/40 text-right font-mono tracking-tighter uppercase hidden sm:block">
                                GEN: TEMPORAL_RHYTHM<br />
                                OUT: AUDIO_E_PULSE<br />
                                LATENCY: 0.0MS
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="mb-6 text-center">
                                    <h2 className="text-sm font-bold tracking-[0.4em] text-primary uppercase font-mono mb-1">RHYTHM_GEN</h2>
                                    <div className="h-px w-8 bg-primary/30 mx-auto"></div>
                                </div>

                                <div className="relative flex items-center justify-center mb-8">
                                    <div className={cn("w-48 h-48 rounded-full border border-primary/10 p-1.5 transition-all duration-75", beatPulse && "shadow-[0_0_20px_rgba(249,249,6,0.5)] border-primary/60 scale-[1.02]")}>
                                        <div
                                            ref={dialRef}
                                            onMouseDown={handleDialDown}
                                            onTouchStart={handleDialDown}
                                            className="w-full h-full rounded-full border border-dashed border-primary/20 flex items-center justify-center relative cursor-ns-resize group"
                                            style={{ background: 'radial-gradient(circle, rgba(249, 249, 6, 0.05) 0%, transparent 70%)' }}
                                        >
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                                <ChevronUp
                                                    onClick={(e) => { e.stopPropagation(); adjustBpm(1); }}
                                                    className="text-primary w-5 h-5 cursor-pointer hover:scale-125 transition-transform"
                                                />
                                            </div>
                                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                                <ChevronDown
                                                    onClick={(e) => { e.stopPropagation(); adjustBpm(-1); }}
                                                    className="text-primary w-5 h-5 cursor-pointer hover:scale-125 transition-transform"
                                                />
                                            </div>

                                            <div className="text-center select-none pointer-events-none">
                                                <div className="text-5xl font-bold text-primary tabular-nums font-mono leading-none tracking-tighter">{metronome.bpm}</div>
                                                <div className="text-[9px] font-bold text-primary/40 tracking-[0.3em] uppercase font-mono mt-1">BPM</div>
                                            </div>

                                            {/* Dial Indicator */}
                                            <div className="absolute w-0.5 h-10 bg-primary/80 top-2 left-1/2 -translate-x-1/2 origin-bottom shadow-[0_0_8px_#f9f906]"
                                                style={{ transform: `rotate(${(metronome.bpm - 120) * 2}deg)` }}>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full mb-8 relative z-20">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[9px] text-primary/40 font-mono uppercase tracking-widest">TIME_SIG_PROTOCOL</span>
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsSigOpen(!isSigOpen)}
                                            className={cn(
                                                "w-full py-3 px-4 border border-primary/20 bg-primary/5 flex items-center justify-between transition-all hover:border-primary/50 text-xs font-bold font-mono text-primary",
                                                isSigOpen && "border-primary shadow-[0_0_15px_rgba(249,249,6,0.2)] bg-primary/10"
                                            )}
                                        >
                                            <span className="tracking-[0.2em]">{metronome.signature[0]}/{metronome.signature[1]}</span>
                                            <ChevronDown className={cn("w-4 h-4 transition-transform", isSigOpen && "rotate-180")} />
                                        </button>

                                        {isSigOpen && (
                                            <div className="absolute top-full left-0 w-full mt-1 border border-primary/20 bg-black/95 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100 shadow-xl">
                                                {['1/4', '2/4', '3/4', '4/4', '6/8'].map((sig) => (
                                                    <button
                                                        key={sig}
                                                        onClick={() => {
                                                            const [b, n] = sig.split('/').map(Number);
                                                            setSignature(b, n);
                                                            ArkanAudio.play('system_execute_clack');
                                                            setIsSigOpen(false);
                                                        }}
                                                        className="w-full text-left py-3 px-4 text-[10px] font-mono tracking-widest text-primary/60 hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-between group"
                                                    >
                                                        <span>{sig}</span>
                                                        {metronome.signature[0] === Number(sig.split('/')[0]) && metronome.signature[1] === Number(sig.split('/')[1]) && (
                                                            <div className="w-1.5 h-1.5 bg-primary shadow-[0_0_5px_#f9f906]"></div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-10 w-full justify-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-[8px] text-primary/40 font-mono uppercase">Start</span>
                                        <button
                                            onClick={toggleMetronome}
                                            className={cn(
                                                "w-10 h-10 rounded-full border flex items-center justify-center transition-all",
                                                metronome.active ? "bg-primary border-primary text-black shadow-[0_0_15px_#f9f906]" : "border-primary/20 hover:bg-primary/10 text-primary"
                                            )}
                                        >
                                            {metronome.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                                        </button>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-[8px] text-primary/40 font-mono uppercase">Audio</span>
                                        <button className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/10 transition-colors text-primary">
                                            <Volume2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* CUSTOM SEQUENCES GRID */}
                    <section className="h-64 border-t border-primary/10 p-6 bg-black/50 overflow-y-auto">
                        <div className="flex items-center gap-2 mb-6">
                            <GridIcon className="text-primary w-4 h-4" />
                            <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] font-mono">CUSTOM_SEQUENCES</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Render actual timers from store */}
                            {Object.values(timers).map(timer => (
                                <div
                                    key={timer.id}
                                    onClick={() => setMainDisplay(timer.id)}
                                    className="border border-primary/15 p-4 bg-primary/[0.02] flex flex-col justify-between group cursor-pointer hover:bg-primary/[0.04] transition-colors relative"
                                >
                                    {/* Technical corner marker */}
                                    <div className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-primary"></div>

                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-[10px] font-bold text-primary font-mono tracking-widest truncate max-w-[150px]">{timer.label}</div>
                                            <div className="text-[8px] text-primary/40 font-mono tracking-tighter uppercase">{timer.type}_PROTOCOL</div>
                                        </div>
                                        <Play className="text-primary/40 w-4 h-4 group-hover:text-primary" />
                                    </div>
                                    <div className="flex items-end justify-between mt-6">
                                        <div className="w-10 h-10 relative">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle className="text-primary/10" cx="20" cy="20" fill="transparent" r="18" stroke="currentColor" strokeWidth="2"></circle>
                                                <circle
                                                    className="text-primary/60 transition-all duration-1000"
                                                    cx="20" cy="20" fill="transparent" r="18" stroke="currentColor"
                                                    strokeDasharray="113"
                                                    strokeDashoffset={113 - (113 * getProgress(timer)) / 100}
                                                    strokeWidth="2">
                                                </circle>
                                            </svg>
                                            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono text-primary/60">{Math.round(getProgress(timer))}%</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-primary font-mono leading-none tabular-nums">{formatTime(timer.remainingMs)}</div>
                                            <div className="text-[8px] text-primary/30 font-mono uppercase mt-1">Status: {timer.status}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>

                {/* TELEMETRY SIDEBAR (XL screens) */}
                <aside className="w-72 border-l border-primary/10 bg-black p-5 hidden xl:flex flex-col gap-6 overflow-y-auto shrink-0">
                    <div className="p-4 border border-primary/15 bg-primary/5 relative">
                        <div className="absolute top-[-1px] left-[-1px] w-2 h-2 border-t-2 border-l-2 border-primary"></div>
                        <div className="text-[10px] font-bold text-primary/70 uppercase tracking-[0.2em] mb-4 font-mono border-b border-primary/10 pb-2">TELEMETRY_DATA</div>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] text-primary font-mono uppercase">Audio_Gain</span>
                                    <span className="text-[8px] text-primary/40 font-mono">0.85</span>
                                </div>
                                <div className="h-0.5 bg-primary/20 w-full">
                                    <div className="h-full bg-primary w-[85%] shadow-[0_0_5px_#f9f906]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* FOOTER */}
            <footer className="h-8 border-t border-primary/20 bg-primary/5 px-6 flex items-center justify-between z-50 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary shadow-[0_0_6px_#f9f906]"></span>
                        <span className="text-[8px] font-bold text-primary uppercase tracking-[0.2em] font-mono">INTEGRATED_SYNC_NOMINAL</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
