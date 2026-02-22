"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
    Sparkles, FileText, ListChecks, Timer,
    Maximize2, ChevronLeft, Save, Share2, Loader2,
    Activity, ShieldAlert, Cpu
} from "lucide-react";
import { useNoteStore } from "@/store/useNoteStore";
import { useSystemLogStore } from "@/store/useSystemLogStore";
import { useHardwareMetrics } from "@/store/useHardwareMetrics";
import { MarkdownParser } from "@/lib/markdown/MarkdownAST";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";
import { FocusTelemetry } from "./FocusTelemetry";
import { TacticalContextMenu } from "./TacticalContextMenu";
import { useAIStore } from "@/store/useAIStore";
import { useChronosStore } from "@/store/useChronosStore";

type EditorMode = 'EDITOR' | 'TIMER' | 'TASKS';

export function NoteEditor() {
    const { buffer, updateBuffer, syncToBackend, isSyncing } = useNoteStore();
    const { addLog } = useSystemLogStore();
    const { metrics } = useHardwareMetrics();
    const { status: aiStatus, analysisIndex, suggestion, extractTasks, summarizeNote, checkAnomalies, updateMetrics } = useAIStore();
    const {
        timers,
        initializeTimer,
        startTimer,
        pauseTimer,
        resetTimer
    } = useChronosStore();

    const timerId = 'NEURAL_FOCUS';
    const activeTimer = timers[timerId];

    const chronoRemaining = activeTimer?.remainingMs || 0;
    const chronoTotal = activeTimer?.durationMs || 0;
    const chronoStatus = activeTimer?.status || 'IDLE';

    const startChrono = (minutes: number, label: string) => {
        initializeTimer(timerId, minutes, label, 'POMODORO');
        startTimer(timerId);
    };

    const stopChrono = () => resetTimer(timerId);
    const pauseChrono = () => pauseTimer(timerId);
    const resumeChrono = () => startTimer(timerId);
    const [mode, setMode] = useState<EditorMode>('EDITOR');
    const [cursorLine, setCursorLine] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const renderRef = useRef<HTMLDivElement>(null);

    // Sync debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            syncToBackend();
        }, 5000); // 5s sync frequency for production-like debounced sync
        return () => clearTimeout(timer);
    }, [buffer, syncToBackend]);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateBuffer(e.target.value);
        ArkanAudio.playFast('key_tick');

        // Calculate cursor line
        const textBeforeCursor = e.target.value.substring(0, e.target.selectionStart);
        const lines = textBeforeCursor.split("\n");
        setCursorLine(lines.length - 1);

        // Sync scroll & Typewriter centering
        if (renderRef.current && textareaRef.current) {
            const textarea = textareaRef.current;
            const lineHeight = 24;
            const cursorY = cursorLine * lineHeight;
            const viewportHeight = textarea.clientHeight;

            // Arkan Typewriter Logic: Maintain focus at 40% height
            const targetScrollTop = cursorY - (viewportHeight * 0.4);

            // Apply smooth vertical follow
            textarea.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });
            renderRef.current.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });

            // Update AI Metrics on input
            updateMetrics(e.target.value);
        }
    };

    const handleSwitchTab = (newMode: EditorMode) => {
        setMode(newMode);
        addLog(`COMMAND_RECEIVED: MODE_SWITCH [TO: ${newMode}]`, 'user');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            ArkanAudio.playFast('clack');
            addLog("KEY_STROKE: [ENTER_SUBMIT]", "status");

            // Haptic feedback for Enter key
            if (window.navigator?.vibrate) {
                window.navigator.vibrate(2);
            }
        } else {
            // Micro-vibration for typing
            if (window.navigator?.vibrate) {
                window.navigator.vibrate(1);
            }
        }
    };

    const handleAIExtract = () => {
        extractTasks();
    };

    const handleSummarize = () => {
        summarizeNote();
    };

    const handleAnomalies = () => {
        checkAnomalies();
    };

    const handleConvertToProject = () => {
        addLog("SYSTEM_ACTION: [CONVERTING_NODE_TO_PROJECT]", "user");
        ArkanAudio.playFast('confirm');
    };

    const handleEncrypt = () => {
        addLog("SYSTEM_ACTION: [ENCRYPTING_NEURAL_NODE]", "critical");
        ArkanAudio.playFast('lock');
    };

    const lines = buffer.split('\n');

    return (
        <div className="flex flex-col h-full border border-primary/20 rounded-xl bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl relative group">
            {/* Distraction Shield: Background Blur Overlay */}
            <div className={cn(
                "absolute inset-0 pointer-events-none transition-all duration-1000 -z-10",
                mode === 'EDITOR' ? "backdrop-blur-[20px] bg-black/60" : "backdrop-blur-none bg-transparent"
            )}></div>

            {/* Header / Tabs */}
            <div className="flex items-center justify-between border-b border-primary/10 p-4 bg-primary/5 shrink-0 z-20">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#ffff00]"></div>
                        <span className="text-[10px] font-mono text-primary tracking-widest uppercase">Archive_Node_{mode}</span>
                    </div>

                    <nav className="flex items-center gap-1 bg-black/40 p-1 rounded border border-primary/20">
                        {['EDITOR', 'TIMER', 'TASKS'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleSwitchTab(tab as EditorMode)}
                                className={cn(
                                    "px-4 py-1.5 text-[10px] uppercase font-bold tracking-tighter transition-all rounded",
                                    mode === tab
                                        ? "bg-primary text-black shadow-[0_0_10px_#ffff00]"
                                        : "text-primary/40 hover:text-primary hover:bg-primary/5"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-primary/40 mr-4">
                        <span className="uppercase">SYNC:</span>
                        {isSyncing ? (
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        ) : (
                            <span className="text-green-500/60">ONLINE</span>
                        )}
                    </div>
                    <button className="p-2 border border-primary/20 rounded hover:bg-primary/10 transition-colors">
                        <Share2 className="h-4 w-4 text-primary" />
                    </button>
                    <button className="p-2 bg-primary text-black rounded hover:bg-white transition-colors">
                        <Maximize2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Multi-modal Content Area: Using visibility/display to preserve state */}
            <div className="flex-1 relative flex overflow-hidden">
                {/* EDITOR MODE */}
                <div className={cn("flex-1 relative flex", mode !== 'EDITOR' && "hidden")}>
                    {/* Instant-In-Situ Rendering Layer */}
                    <div
                        ref={renderRef}
                        className="absolute inset-0 p-8 pt-10 font-mono pointer-events-none overflow-y-auto custom-scrollbar select-none"
                        aria-hidden="true"
                    >
                        <div className="max-w-4xl mx-auto space-y-1">
                            {lines.map((line, idx) => (
                                <div
                                    key={idx}
                                    dangerouslySetInnerHTML={{
                                        __html: MarkdownParser.renderLine(line, idx === cursorLine)
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Raw Input Layer (Invisible Textarea for interaction) */}
                    <textarea
                        ref={textareaRef}
                        className="flex-1 w-full max-w-4xl mx-auto resize-none bg-transparent p-8 pt-10 focus:outline-none text-transparent caret-transparent leading-relaxed font-mono z-10 selection:bg-primary/20"
                        placeholder="INITIALIZE_NEURAL_PATHWAY..."
                        value={buffer}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        spellCheck={false}
                    />

                    {/* Arkan Pulsed Block Cursor Implementation */}
                    <style jsx>{`
                        textarea {
                            caret-color: transparent;
                        }
                        .arkan-cursor {
                            display: inline-block;
                            width: 8px;
                            height: 16px;
                            background: var(--color-primary);
                            animation: arkan-blink 1s steps(2, start) infinite;
                            vertical-align: middle;
                            margin-left: 2px;
                        }
                        @keyframes arkan-blink {
                            to { visibility: hidden; }
                        }
                    `}</style>
                </div>

                {/* TIMER MODE (Arkan Chronos) */}
                <div className={cn("flex-1 flex flex-col items-center justify-center p-20", mode !== 'TIMER' && "hidden")}>
                    <div className="relative w-80 h-80 flex items-center justify-center">
                        {/* Circular SVG Progress */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                className="stroke-primary/10 fill-none"
                                strokeWidth="4"
                            />
                            <circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                className={cn(
                                    "stroke-primary fill-none transition-all duration-300",
                                    chronoRemaining < 60000 && chronoStatus === 'RUNNING' && "animate-pulse"
                                )}
                                strokeWidth="4"
                                strokeDasharray="283%"
                                strokeDashoffset={`${(1 - chronoRemaining / (chronoTotal || 1)) * 283}%`}
                                style={{
                                    filter: chronoRemaining < 60000 ? 'drop-shadow(0 0 15px #ffff00)' : 'none'
                                }}
                            />
                        </svg>

                        <div className="flex flex-col items-center z-10">
                            <div className={cn(
                                "text-7xl font-black text-primary tracking-tighter transition-all duration-300",
                                chronoRemaining < 60000 ? "neon-yellow-glow scale-110" : ""
                            )}>
                                {Math.floor(chronoRemaining / 60000).toString().padStart(2, '0')}:
                                {Math.floor((chronoRemaining % 60000) / 1000).toString().padStart(2, '0')}
                            </div>
                            <div className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.5em] mt-2">
                                {chronoStatus === 'RUNNING' ? 'Sequence_In_Progress' : 'Temporal_Standby'}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-12">
                        {chronoStatus === 'IDLE' || chronoStatus === 'COMPLETE' ? (
                            <button
                                onClick={() => startChrono(25, 'WORK')}
                                className="px-10 py-3 bg-primary text-black font-bold uppercase tracking-widest rounded shadow-[0_0_20px_#ffff00] hover:scale-105 transition-all"
                            >
                                Start_Chronos
                            </button>
                        ) : chronoStatus === 'PAUSED' ? (
                            <button
                                onClick={resumeChrono}
                                className="px-10 py-3 bg-primary text-black font-bold uppercase tracking-widest rounded shadow-[0_0_20px_#ffff00] hover:scale-105 transition-all"
                            >
                                Resume
                            </button>
                        ) : (
                            <button
                                onClick={pauseChrono}
                                className="px-10 py-3 border border-primary/40 text-primary font-bold uppercase tracking-widest rounded hover:bg-primary/10 transition-all"
                            >
                                Pause
                            </button>
                        )}
                        <button
                            onClick={stopChrono}
                            className="px-10 py-3 border border-red-500/20 text-red-500/60 font-bold uppercase tracking-widest rounded hover:bg-red-500/10 transition-all"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* TASKS MODE (Existing content) ... */}

                {/* AI SYNAPSE SIDEBAR (Tactical Hub) */}
                <aside className="w-80 border-l border-primary/10 bg-black/40 p-6 flex flex-col gap-8 shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary opacity-[0.02] pointer-events-none"></div>

                    {/* Visual Scramble Overlay during analysis */}
                    {aiStatus === 'ANALYZING' && (
                        <div className="absolute inset-0 bg-primary/10 z-50 animate-glitch-scramble pointer-events-none"></div>
                    )}

                    <div className="space-y-6 relative z-10">
                        <h3 className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase opacity-60">AI_Synapse_Tactical</h3>

                        <div className="space-y-4">
                            <button
                                onClick={handleAIExtract}
                                disabled={aiStatus === 'ANALYZING'}
                                className="w-full flex items-center justify-between p-3 border border-primary/20 bg-primary/5 hover:bg-primary/20 transition-all group overflow-hidden relative"
                            >
                                <div className="flex items-center gap-3">
                                    <Sparkles className={cn("h-4 w-4", aiStatus === 'ANALYZING' ? "animate-spin" : "text-primary")} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Extract_Tasks</span>
                                </div>
                                <div className="h-[1px] w-4 bg-primary/40 group-hover:w-8 transition-all"></div>
                            </button>

                            <button
                                onClick={handleSummarize}
                                disabled={aiStatus === 'ANALYZING'}
                                className="w-full flex items-center justify-between p-3 border border-primary/20 bg-primary/5 hover:bg-primary/20 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Summarize_Log</span>
                                </div>
                                <div className="h-[1px] w-4 bg-primary/40 group-hover:w-8 transition-all"></div>
                            </button>

                            <button
                                onClick={handleAnomalies}
                                disabled={aiStatus === 'ANALYZING'}
                                className="w-full flex items-center justify-between p-3 border border-primary/20 bg-primary/5 hover:bg-primary/20 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <ShieldAlert className="h-4 w-4 text-primary" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Anomaly_Check</span>
                                </div>
                                <div className="h-[1px] w-4 bg-primary/40 group-hover:w-8 transition-all"></div>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <h3 className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase opacity-60">Analysis_Index</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[8px] font-mono text-white/40 uppercase">
                                    <span>Technical_Depth</span>
                                    <span>{Math.round(analysisIndex.technicalDepth * 100)}%</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 relative overflow-hidden">
                                    <div
                                        className={cn("absolute top-0 left-0 h-full bg-primary transition-all duration-1000", aiStatus === 'ANALYZING' && "animate-glitch-scramble")}
                                        style={{ width: `${analysisIndex.technicalDepth * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[8px] font-mono text-white/40 uppercase">
                                    <span>Conceptual_Clarity</span>
                                    <span>{Math.round(analysisIndex.clarity * 100)}%</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 relative overflow-hidden">
                                    <div
                                        className={cn("absolute top-0 left-0 h-full bg-primary transition-all duration-1000", aiStatus === 'ANALYZING' && "animate-glitch-scramble")}
                                        style={{ width: `${analysisIndex.clarity * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {suggestion && (
                        <div className="mt-auto p-4 bg-primary/10 border border-primary/30 rounded animate-pulse relative z-10">
                            <h4 className="text-[9px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Activity className="h-3 w-3" />
                                Synapse_Suggestion
                            </h4>
                            <p className="text-[10px] text-white/90 leading-relaxed font-mono italic">"{suggestion}"</p>
                        </div>
                    )}
                </aside>
            </div>

            {/* Session Telemetry Footer */}
            <FocusTelemetry />

            {/* Tactical Context Menu Interceptor */}
            <TacticalContextMenu
                onAIExtract={handleAIExtract}
                onConvertToProject={handleConvertToProject}
                onEncrypt={handleEncrypt}
            />

            {/* Visual Scanline Decoration Overlay */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-primary/20 blur-[1px] opacity-10 animate-pulse pointer-events-none"></div>
        </div>
    );
}
