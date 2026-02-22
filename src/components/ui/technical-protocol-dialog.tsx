"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useDialogStore } from '@/store/useDialogStore';
import { ArkanAudio } from '@/lib/audio/ArkanAudio';
import { cn } from '@/lib/utils';
import { Terminal } from 'lucide-react';

export const TechnicalProtocolDialog = () => {
    const { isOpen, options, closeDialog } = useDialogStore();
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus and Audio Logic
    useEffect(() => {
        if (isOpen) {
            setInputValue(options?.initialValue || '');
            // Small delay to ensure render before focus
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
            ArkanAudio.play('ui_hover_shimmer');
        }
    }, [isOpen, options]);

    if (!isOpen || !options) return null;

    const handleConfirm = async () => {
        if (!inputValue.trim()) return;

        ArkanAudio.play('system_execute_clack');
        // Await potential async operations
        await options.onConfirm(inputValue);
        closeDialog();
    };

    const handleAbort = () => {
        if (options.onCancel) options.onCancel();
        closeDialog();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%]"></div>

            <div className="w-full max-w-md bg-[#050505] border border-primary p-6 shadow-neon relative flex flex-col gap-6 animate-in zoom-in-95 duration-300">
                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary -translate-x-[1px] -translate-y-[1px]"></div>
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary translate-x-[1px] -translate-y-[1px]"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary -translate-x-[1px] translate-y-[1px]"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary translate-x-[1px] translate-y-[1px]"></div>

                {/* Header */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Terminal className="h-4 w-4 text-primary" />
                        <span className="text-[10px] text-primary/60 tracking-widest uppercase font-mono">System Security Layer</span>
                    </div>
                    <h2 className="text-primary text-xs font-bold tracking-tighter leading-tight uppercase font-mono">
                        {options.title}
                    </h2>
                </div>

                {/* Input Field */}
                <div className="relative group">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        placeholder={options.placeholder || "_WAITING_FOR_INPUT"}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConfirm();
                            if (e.key === 'Escape') handleAbort();
                        }}
                        className="w-full bg-black border border-primary/40 text-primary p-3 outline-none transition-all duration-200 focus:border-primary focus:ring-0 focus:shadow-neon-intense placeholder:text-primary/20 text-sm tracking-widest font-mono uppercase"
                        autoComplete="off"
                    />
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-[2px] bg-primary animate-pulse"></div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1 text-[9px] text-primary/30 font-mono">
                        <span>LAT: {Math.floor(Math.random() * 20) + 5}ms</span>
                        <div className="flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping"></div>
                            <span>SECURE_LINK</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleAbort}
                            onMouseEnter={() => ArkanAudio.play('ui_hover_shimmer')}
                            className="px-4 py-2 border border-primary/40 text-primary text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-primary/10 hover:border-primary transition-all duration-200 font-mono flex items-center gap-1"
                        >
                            <span className="text-primary">[</span>
                            ABORT
                            <span className="text-primary">]</span>
                        </button>
                        <button
                            onClick={handleConfirm}
                            onMouseEnter={() => ArkanAudio.play('ui_hover_shimmer')}
                            className="px-6 py-2 bg-primary text-black text-[10px] font-bold tracking-[0.2em] uppercase shadow-neon hover:shadow-neon-intense active:scale-95 transition-all duration-200 font-mono flex items-center gap-1"
                        >
                            <span className="text-black/50">[</span>
                            {options.confirmLabel || "EXECUTE"}
                            <span className="text-black/50">]</span>
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-2 right-4 pointer-events-none opacity-40">
                    <span className="text-[8px] text-primary/50 tracking-widest uppercase font-mono">ARKAN-SOURCE_v4.0</span>
                </div>
            </div>
        </div>
    );
};
