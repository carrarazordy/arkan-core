"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";
import {
    Zap,
    Folders,
    Download,
    Lock,
    Terminal,
    Cpu
} from "lucide-react";

interface ContextAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    action: () => void;
}

export function TacticalContextMenu({
    onAIExtract,
    onConvertToProject,
    onEncrypt
}: {
    onAIExtract: () => void;
    onConvertToProject: () => void;
    onEncrypt: () => void;
}) {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            setPosition({ x: e.pageX, y: e.pageY });
            setVisible(true);
            ArkanAudio.playFast('clack');
        };

        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setVisible(false);
            }
        };

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('click', handleClick);
        };
    }, []);

    if (!visible) return null;

    const actions: ContextAction[] = [
        {
            id: 'EXTRACT',
            label: '[EXTRACT_TASKS_VIA_AI]',
            icon: <Zap className="h-3 w-3 text-primary" />,
            action: () => { onAIExtract(); setVisible(false); }
        },
        {
            id: 'PROJECT',
            label: '[CONVERT_TO_PROJECT]',
            icon: <Folders className="h-3 w-3 text-primary" />,
            action: () => { onConvertToProject(); setVisible(false); }
        },
        {
            id: 'EXPORT',
            label: '[EXPORT_AS_JSON]',
            icon: <Download className="h-3 w-3 text-primary" />,
            action: () => { console.log('Exporting...'); setVisible(false); }
        },
        {
            id: 'ENCRYPT',
            label: '[ENCRYPT_NODE]',
            icon: <Lock className="h-3 w-3 text-red-500" />,
            action: () => { onEncrypt(); setVisible(false); }
        }
    ];

    return (
        <div
            ref={menuRef}
            className="fixed z-[999] w-64 bg-black/90 border border-primary/40 rounded shadow-[0_0_30px_rgba(255,b,0,0.2)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{ top: position.y, left: position.x }}
        >
            <div className="px-3 py-2 border-b border-primary/20 flex justify-between items-center bg-primary/5">
                <span className="text-[8px] font-bold text-primary tracking-[0.2em] font-jetbrains uppercase">Context_Action</span>
                <span className="text-[8px] text-primary/30 font-mono">v1.2</span>
            </div>

            <div className="py-1">
                {actions.map((action, idx) => (
                    <button
                        key={action.id}
                        onClick={action.action}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 hover:bg-primary text-left group transition-colors",
                            idx === actions.length - 2 && "border-b border-primary/10 mb-1"
                        )}
                    >
                        <div className="group-hover:text-black transition-colors">{action.icon}</div>
                        <span className="text-[10px] font-bold text-primary/80 group-hover:text-black font-jetbrains tracking-tight uppercase">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>

            <div className="p-3 bg-black/60 border-t border-primary/10">
                <div className="flex items-center gap-2 opacity-20">
                    <Terminal className="h-2 w-2 text-primary" />
                    <div className="h-[1px] flex-1 bg-primary/20" />
                    <Cpu className="h-2 w-2 text-primary" />
                </div>
            </div>
        </div>
    );
}
