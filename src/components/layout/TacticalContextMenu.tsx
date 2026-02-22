"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
    Cpu,
    Link,
    ShieldAlert,
    Share2,
    Trash2,
    Zap,
    Lock,
    Copy,
    ExternalLink
} from "lucide-react";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";

interface ContextMenuItem {
    label: string;
    icon: any;
    action: string;
    critical?: boolean;
}

export default function TacticalContextMenu() {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleContextMenu = useCallback((e: MouseEvent) => {
        // Prevent for input elements to keep default text handling
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        e.preventDefault();
        setPosition({ x: e.clientX, y: e.clientY });
        setIsVisible(true);
        ArkanAudio.playFast('system_engage');
    }, []);

    const handleClick = useCallback(() => {
        if (isVisible) setIsVisible(false);
    }, [isVisible]);

    useEffect(() => {
        window.addEventListener("contextmenu", handleContextMenu);
        window.addEventListener("click", handleClick);
        return () => {
            window.removeEventListener("contextmenu", handleContextMenu);
            window.removeEventListener("click", handleClick);
        };
    }, [handleContextMenu, handleClick]);

    const items: ContextMenuItem[] = [
        { label: "AI_NODE_EXTRACT", icon: Cpu, action: "EXTRACT" },
        { label: "ENCRYPT_SECTOR", icon: Lock, action: "ENCRYPT" },
        { label: "ESTABLISH_UPLINK", icon: Link, action: "UPLINK" },
        { label: "GENERATE_HASH", icon: HashIcon, action: "HASH" },
        { label: "COPY_NODE_ID", icon: Copy, action: "COPY" },
        { label: "DE_MANIFEST", icon: Trash2, action: "DELETE", critical: true },
    ];

    if (!isVisible) return null;

    return (
        <div
            className="fixed z-[3000] w-56 bg-black border border-primary/40 shadow-[0_0_30px_rgba(249,249,6,0.2)] animate-in fade-in zoom-in duration-200"
            style={{ top: position.y, left: position.x }}
        >
            <div className="bg-primary/10 px-3 py-1.5 border-b border-primary/20 flex justify-between items-center">
                <span className="text-[8px] font-mono text-primary font-bold tracking-widest uppercase">Tactical_Actions</span>
                <Zap className="h-2 w-2 text-primary animate-pulse" />
            </div>

            <div className="py-1">
                {items.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            ArkanAudio.playFast('confirm');
                            console.log(`>> ACTION: ${item.action}`);
                            setIsVisible(false);
                        }}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2 hover:bg-primary/20 transition-all group",
                            item.critical ? "hover:bg-red-500/20" : ""
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={cn(
                                "h-3.5 w-3.5",
                                item.critical ? "text-red-500" : "text-primary/60 group-hover:text-primary"
                            )} />
                            <span className={cn(
                                "text-[10px] font-mono uppercase font-black tracking-tighter",
                                item.critical ? "text-red-500" : "text-primary/80 group-hover:text-primary"
                            )}>
                                {item.label}
                            </span>
                        </div>
                        <ChevronRight className="h-2 w-2 opacity-0 group-hover:opacity-40" />
                    </button>
                ))}
            </div>

            <div className="bg-[#050502] px-3 py-1 border-t border-primary/10 flex justify-between items-center text-[7px] text-primary/20 uppercase font-mono">
                <span>SEC_LVL: ALPHA</span>
                <span>Buffer: Ready</span>
            </div>
        </div>
    );
}

function HashIcon({ className }: { className?: string }) {
    return <span className={cn("font-bold text-xs select-none", className)}>#</span>;
}

function ChevronRight({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}
