"use client";

import { useState } from "react";
import {
    ShoppingCart,
    Package,
    CheckSquare,
    MapPin,
    Weight,
    Plane,
    Archive,
    Plus,
    Trash2,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogisticsStore, LogisticsItem } from "@/store/useLogisticsStore";
import { motion, AnimatePresence } from "framer-motion";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";

export default function LogisticsPage() {
    const { sectors, items, manifest, toggleItemStatus, deManifestItem, addItem, addManifestItem, resetManifest } = useLogisticsStore();

    const [newItemName, setNewItemName] = useState("");
    const [newItemSector, setNewItemSector] = useState(sectors[0]?.id || "");

    const activeManifest = manifest.filter(m => !m.isDeManifested);
    const archivedManifest = manifest.filter(m => m.isDeManifested);
    const totalWeight = activeManifest.reduce((acc, curr) => acc + curr.weightKg, 0);
    const progress = (archivedManifest.length / manifest.length) * 100 || 0;

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        addItem({ name: newItemName.toUpperCase(), qty: 1, sectorId: newItemSector });
        setNewItemName("");
    };

    return (
        <div className="flex h-full relative bg-black text-slate-300 font-mono overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-10"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(249, 249, 6, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(249, 249, 6, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            ></div>

            {/* LEFT PANE: LOGISTICS INVENTORY */}
            <section className="flex-1 flex flex-col border-r border-primary/20 bg-[#0a0a05]/80 backdrop-blur-sm z-10 min-w-0">
                <header className="h-16 border-b border-primary/20 flex items-center justify-between px-6 bg-[#0d0d04]">
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-white">Logistics_Inventory</h1>
                    </div>
                    <div className="text-[10px] font-mono text-primary/60 uppercase">
                        SECTORS_ACTIVE: {sectors.length}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    {sectors.map(sector => {
                        const sectorItems = items.filter(i => i.sectorId === sector.id);
                        if (sectorItems.length === 0) return null;

                        return (
                            <div key={sector.id} className="space-y-4">
                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                    <h2 className="text-xs font-bold text-primary tracking-widest uppercase flex items-center gap-2">
                                        [{sector.name}]
                                        {sector.priority === 'CRITICAL' && <span className="text-[9px] text-red-500 animate-pulse">!!</span>}
                                    </h2>
                                    <span className="text-[9px] text-zinc-600 font-mono">ID: {sector.id}</span>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {sectorItems.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleItemStatus(item.id)}
                                            className={cn(
                                                "group flex items-center justify-between p-3 border rounded-sm cursor-pointer transition-all duration-300",
                                                item.status === 'ACQUIRED'
                                                    ? "bg-primary/5 border-primary/10 opacity-40 hover:opacity-60"
                                                    : "bg-[#11110b] border-white/10 hover:border-primary/50 hover:bg-primary/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-4 h-4 border flex items-center justify-center transition-all",
                                                    item.status === 'ACQUIRED' ? "border-primary bg-primary text-black" : "border-zinc-500"
                                                )}>
                                                    {item.status === 'ACQUIRED' && <CheckSquare className="h-3 w-3" />}
                                                </div>
                                                <div>
                                                    <span className={cn(
                                                        "text-xs font-bold uppercase tracking-wide transition-all",
                                                        item.status === 'ACQUIRED' ? "text-primary line-through decoration-primary/50" : "text-white group-hover:text-primary"
                                                    )}>
                                                        {item.name}
                                                    </span>
                                                    <div className="flex gap-2 text-[9px] text-zinc-500 font-mono mt-0.5">
                                                        <span>QTY: {item.qty}</span>
                                                        <span>UID: {item.id}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-[9px] uppercase font-bold tracking-widest text-primary/0 group-hover:text-primary/100 transition-all">
                                                {item.status === 'ACQUIRED' ? 'ACQUIRED' : 'PENDING'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Quick Add Form */}
                    <form onSubmit={handleAddItem} className="mt-8 border-t border-dashed border-white/10 pt-6">
                        <div className="flex gap-2">
                            <input
                                value={newItemName}
                                onChange={e => setNewItemName(e.target.value)}
                                placeholder="ADD_LOGISTIC_NODE..."
                                className="flex-1 bg-[#11110b] border border-white/10 p-2 text-xs text-primary font-mono outline-none focus:border-primary/50 uppercase placeholder:text-zinc-700"
                            />
                            <select
                                value={newItemSector}
                                onChange={e => setNewItemSector(e.target.value)}
                                className="bg-[#11110b] border border-white/10 p-2 text-xs text-primary font-mono outline-none uppercase"
                            >
                                {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <button type="submit" className="bg-primary/10 hover:bg-primary text-primary hover:text-black border border-primary/20 px-4 rounded-sm transition-all">
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* RIGHT PANE: EXPEDITION MANIFEST */}
            <section className="w-[450px] flex flex-col bg-[#050502]/95 backdrop-blur-md z-10 border-l border-primary/10">
                <header className="h-16 border-b border-primary/20 flex flex-col justify-center px-6 bg-[#0a0a05] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-20">
                        <Plane className="h-12 w-12 text-primary rotate-45" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-white flex items-center gap-2">
                                <Package className="h-4 w-4 text-primary" />
                                Expedition_Manifest
                            </h1>
                            <div className="flex gap-4 mt-1 text-[9px] font-mono text-zinc-500 uppercase">
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> TOKYO_NEO_WARD</span>
                                <span className="flex items-center gap-1"><Weight className="h-3 w-3" /> LOAD: {totalWeight.toFixed(1)}KG</span>
                            </div>
                        </div>
                        <button onClick={resetManifest} className="text-zinc-600 hover:text-primary transition-colors">
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>
                </header>

                {/* Progress Bar */}
                <div className="h-1 bg-[#11110b] w-full">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(249,249,6,0.5)]"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="space-y-3">
                        <AnimatePresence>
                            {activeManifest.map(item => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                                    className="bg-[#11110b] border border-white/5 p-4 rounded-sm flex items-center justify-between group hover:border-primary/30 transition-all"
                                >
                                    <div>
                                        <div className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-primary transition-colors">{item.name}</div>
                                        <div className="text-[9px] text-zinc-600 font-mono mt-1">WEIGHT: {item.weightKg}KG // ID: {item.id}</div>
                                    </div>
                                    <button
                                        onClick={() => deManifestItem(item.id)}
                                        className="px-3 py-1 bg-primary/10 hover:bg-primary text-primary hover:text-black border border-primary/20 text-[9px] font-bold uppercase tracking-widest transition-all clip-path-polygon"
                                    >
                                        De_Manifest
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {activeManifest.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 opacity-30 text-primary">
                            <Archive className="h-12 w-12 mb-4" />
                            <span className="text-xs tracking-[0.3em] font-mono">MANIFEST_CLEARED</span>
                        </div>
                    )}
                </div>

                {/* Footer Log */}
                <div className="p-3 bg-[#000] border-t border-primary/20 text-[9px] font-mono text-primary/60 truncate">
                    {`>> SYSTEM_LOG: ${archivedManifest.length} ITEMS ARCHIVED // REMAINING: ${activeManifest.length}`}
                </div>
            </section>
        </div>
    );
}
