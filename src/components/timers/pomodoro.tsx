"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChronosStore } from "@/store/useChronosStore";

export function PomodoroTimer() {
    // Connect to global Chronos store
    const {
        timers,
        activeTimerId,
        initializeTimer,
        startTimer,
        pauseTimer,
        resetTimer,
        setMainDisplay
    } = useChronosStore();

    // We'll use a fixed ID for the main pomodoro logic for now, or check for an active one.
    // Let's define a standard ID for the main focus timer
    const TIMER_ID = 'MAIN_POMODORO';

    // Sync local visual state with store
    const timer = timers[TIMER_ID];

    // Initialize if missing
    useEffect(() => {
        if (!timers[TIMER_ID]) {
            initializeTimer(TIMER_ID, 25, 'FOCUS_SESSION', 'POMODORO');
            setMainDisplay(TIMER_ID);
        }
    }, [timers, initializeTimer, setMainDisplay]);

    const timeLeft = timer ? Math.floor(timer.remainingMs / 1000) : 25 * 60;
    const isActive = timer?.status === 'RUNNING';
    const mode = (timer?.type === 'POMODORO') ? 'work' : 'custom'; // Simplified mapping for now, can expand later

    // Audio ref kept for local specific feedback if needed, but store handles most generic sounds
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio("/sounds/alert.mp3");
    }, []);

    const toggleTimer = () => {
        if (isActive) {
            pauseTimer(TIMER_ID);
        } else {
            startTimer(TIMER_ID);
        }
    };

    const handleReset = () => {
        resetTimer(TIMER_ID);
    };

    const setTimerMode = (newMode: 'work' | 'short-break' | 'long-break') => {
        // Re-initialize with new duration
        const duration = newMode === 'work' ? 25 : newMode === 'short-break' ? 5 : 15;
        initializeTimer(TIMER_ID, duration, newMode.toUpperCase(), 'POMODORO');
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress for visual bar
    const totalDuration = timer ? timer.durationMs / 1000 : 25 * 60;
    const progress = 100 - ((timeLeft / totalDuration) * 100);

    // Visual mode derivation
    // We can infer mode from duration for now since we don't store "mode" string explicitly in TimerNode yet (only type)
    // Or we can just use the label if we matched it in setTimerMode
    const visualMode = timer?.label === 'SHORT-BREAK' ? 'short-break' : timer?.label === 'LONG-BREAK' ? 'long-break' : 'work';

    return (
        <div className="flex flex-col items-center justify-center space-y-8 p-8 rounded-2xl bg-card border border-border shadow-lg relative overflow-hidden">
            {/* Background glow based on mode */}
            <div className={cn(
                "absolute inset-0 opacity-10 blur-3xl transition-colors duration-1000",
                visualMode === 'work' ? "bg-primary" : visualMode === 'short-break' ? "bg-blue-500" : "bg-purple-500"
            )} />

            <div className="relative z-10 flex gap-2 mb-4">
                <Button variant="ghost" onClick={() => setTimerMode('work')} className={cn(visualMode === 'work' && "bg-primary/20 text-primary")}>Focus</Button>
                <Button variant="ghost" onClick={() => setTimerMode('short-break')} className={cn(visualMode === 'short-break' && "bg-blue-500/20 text-blue-500")}>Short Break</Button>
                <Button variant="ghost" onClick={() => setTimerMode('long-break')} className={cn(visualMode === 'long-break' && "bg-purple-500/20 text-purple-500")}>Long Break</Button>
            </div>

            <div className="relative z-10 text-8xl font-mono font-bold tracking-tighter tabular-nums neon-text">
                {formatTime(timeLeft)}
            </div>

            {/* Circular Progress (Visual Aid) - omitted for simplicity, using bar below */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden relative z-10">
                <div
                    className={cn("h-full transition-all duration-1000",
                        visualMode === 'work' ? "bg-primary" : visualMode === 'short-break' ? "bg-blue-500" : "bg-purple-500"
                    )}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="relative z-10 flex gap-4">
                <Button
                    size="lg"
                    onClick={toggleTimer}
                    className={cn(
                        "h-16 w-16 rounded-full p-0 shadow-[0_0_20px_-5px_var(--color-primary)] hover:shadow-[0_0_30px_-5px_var(--color-primary)] transition-all",
                        isActive ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-destructive/50" : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    )}
                >
                    {isActive ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                </Button>
                <Button size="lg" variant="outline" onClick={handleReset} className="h-16 w-16 rounded-full p-0 border-2">
                    <RotateCcw className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
}
