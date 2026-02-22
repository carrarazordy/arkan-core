"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";

const BOOT_LINES = [
    "EXPECTING_SECURE_LINK...",
    "ALLOCATING_NEURAL_STORAGE...",
    "SYNCING_WITH_APPWRITE_NODES...",
    "HANDSHAKE_ESTABLISHED.",
    "SYSTEM_READY."
];

export function PhaseTerminal({ onComplete }: { onComplete: () => void }) {
    const [visibleLines, setVisibleLines] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDone, setIsDone] = useState(false);

    useEffect(() => {
        if (currentIndex < BOOT_LINES.length) {
            const timer = setTimeout(() => {
                setVisibleLines(prev => [...prev, BOOT_LINES[currentIndex]]);
                ArkanAudio.playFast('key_tick');
                setCurrentIndex(currentIndex + 1);
            }, 800);
            return () => clearTimeout(timer);
        } else {
            setIsDone(true);
        }
    }, [currentIndex]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl bg-black border border-primary/20 p-8 rounded-sm shadow-[0_0_30px_#ffff0011] relative z-10"
        >
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary"></div>

            <div className="flex items-center gap-2 mb-8 border-b border-primary/10 pb-4">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase">SYSTEM_INITIALIZATION</span>
            </div>

            <div className="space-y-4 min-h-[160px] font-mono text-sm leading-relaxed">
                {visibleLines.map((line, i) => (
                    <div key={i} className="flex gap-4">
                        <span className="text-primary/40">&gt;&gt;</span>
                        <TypewriterText text={line} />
                    </div>
                ))}
            </div>

            {isDone && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 flex justify-center"
                >
                    <button
                        onClick={onComplete}
                        className="px-8 py-3 bg-primary text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-white transition-all shadow-[0_0_15px_#ffff0033]"
                    >
                        INITIALIZE_COMMAND_CENTER
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
}

function TypewriterText({ text }: { text: string }) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setDisplayedText(text.slice(0, i + 1));
            i++;
            if (i >= text.length) clearInterval(interval);
        }, 20);
        return () => clearInterval(interval);
    }, [text]);

    return <span>{displayedText}</span>;
}
