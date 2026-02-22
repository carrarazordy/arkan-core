"use client";

import { useLogisticsStore, LogisticsItem } from "@/store/useLogisticsStore";
import { cn } from "@/lib/utils";
import { Check, Trash2, Box } from "lucide-react";

export function LogisticsNode({ item }: { item: LogisticsItem }) {
    const { toggleItemStatus, deManifestItem } = useLogisticsStore();

    const isAcquired = item.status === 'ACQUIRED';
    const isTravel = item.type === 'TRAVEL';

    return (
        <div className={cn(
            "group relative flex items-center gap-4 p-4 border transition-all duration-300 overflow-hidden",
            isAcquired
                ? "bg-primary/5 border-primary/10 opacity-40 shadow-inner"
                : "bg-black/40 border-primary/30 hover:border-primary shadow-lg",
            item.type === 'TRAVEL' && !isAcquired && "border-l-4 border-l-primary"
        )}>
            {/* Index Display */}
            <div className="text-[10px] font-mono text-primary/40 shrink-0 select-none">
                [{item.id.slice(0, 4).toUpperCase()}]
            </div>

            {/* Checkbox / Box Toggle */}
            <button
                onClick={() => toggleItemStatus(item.id)}
                className={cn(
                    "w-5 h-5 border flex items-center justify-center transition-all",
                    isAcquired
                        ? "bg-primary border-primary text-black"
                        : "border-primary/40 hover:border-primary text-transparent"
                )}
            >
                {isTravel ? <Box className="h-3 w-3" /> : <Check className="h-4 w-4" />}
            </button>

            {/* Label with Strikethrough Logic */}
            <div className="flex-1 min-w-0 relative">
                <span className={cn(
                    "text-sm font-jetbrains uppercase tracking-tight block truncate transition-all duration-500",
                    isAcquired ? "text-primary/60" : "text-white"
                )}>
                    {item.name || item.label}
                </span>
                {isAcquired && (
                    <div className="absolute left-0 top-1/2 w-full h-[1px] bg-primary/40 shadow-[0_0_5px_#ffff00] animate-in slide-in-from-left duration-500" />
                )}
            </div>

            {/* Category Node */}
            <div className="hidden md:block px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-[9px] text-primary/60 font-mono uppercase">
                {item.category || item.sectorId}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Call deManifest or a delete function. Store calls it deManifestItem
                        deManifestItem(item.id);
                    }}
                    className="p-1.5 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded transition-colors"
                    title="REMOVE_FROM_MANIFEST"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            {/* Scanning Line Animation if not acquired */}
            {!isAcquired && (
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-gradient-to-r from-transparent via-primary to-transparent scan-animate-horizontal"></div>
            )}
        </div>
    );
}
