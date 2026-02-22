"use client";

import { useNoteStore } from "@/store/useNoteStore";
import { useEffect, useState } from "react";
import { Clock, Hash, Type } from "lucide-react";

export function FocusTelemetry() {
    const { session } = useNoteStore();
    const [elapsedTime, setElapsedTime] = useState("00:00");

    useEffect(() => {
        const interval = setInterval(() => {
            const seconds = Math.floor((Date.now() - session.startTime) / 1000);
            const m = Math.floor(seconds / 60).toString().padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            setElapsedTime(`${m}:${s}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [session.startTime]);

    const progress = Math.min((session.currentWords / session.targetWords) * 100, 100);

    return (
        <div className="flex flex-col gap-2 p-4 bg-black/40 border-t border-primary/20 font-mono text-[10px] tracking-widest relative overflow-hidden group">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-primary/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary shadow-[0_0_8px_#ffff00] transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-4 text-primary/60">
                    <div className="flex items-center gap-1.5">
                        <Hash className="h-3 w-3" />
                        <span>WORDS: <span className="text-white">{session.currentWords}</span> / {session.targetWords}</span>
                    </div>
                    <div className="flex items-center gap-1.5 border-l border-primary/20 pl-4">
                        <Type className="h-3 w-3" />
                        <span>CHARS: <span className="text-white">{session.currentChars}</span></span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-primary/60">
                        <Clock className="h-3 w-3" />
                        <span>SESSION_TIME: <span className="text-white">{elapsedTime}</span></span>
                    </div>
                    <div className="px-2 py-0.5 bg-primary/10 border border-primary/30 text-primary font-bold rounded uppercase animate-pulse">
                        Focus_Active
                    </div>
                </div>
            </div>

            {/* Subtle background scanline effect for telemetry */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-primary/10 blur-[1px] group-hover:bg-primary/30 transition-colors"></div>
        </div>
    );
}
