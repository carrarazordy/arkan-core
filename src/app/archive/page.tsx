"use client";

import { useState, useEffect } from "react";
import { useArchiveStore, ArchiveRecord } from "@/store/useArchiveStore";
import { cn } from "@/lib/utils";
import {
    Archive,
    Terminal,
    Search,
    RotateCcw,
    Database,
    List as ListAlt,
    Navigation as NearMe,
    ShoppingCart
} from "lucide-react";
// Using Lucide since it's the project standard, mapping from Material icons
import { ArkanAudio } from "@/lib/audio/ArkanAudio";

export default function Page() {
    const { records, totalIndexed, restorationEvents, restoreRecord, fetchRecords } = useArchiveStore();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const handleRestore = async (record: ArchiveRecord) => {
        ArkanAudio.playFast('confirm');
        await restoreRecord(record.id);
        ArkanAudio.playFast('alert_chime'); // Using alert_chime as a proxy for restore_ascending_ping
    };

    const filteredRecords = records.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.uid.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-[#050505] overflow-hidden relative font-display">
            {/* Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_bottom,transparent_50%,#FFFF00_51%,transparent_100%)] bg-[length:100%_4px] z-50"></div>

            {/* Dense Matrix Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-5 grid-overlay z-0"></div>

            {/* Sub-Header / Search */}
            <div className="p-4 border-b border-primary/10 flex items-center justify-between bg-black/40 z-10">
                <div className="relative w-96 group">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary/50 transition-colors" />
                    <input
                        className="w-full bg-primary/5 border border-primary/10 pl-10 pr-4 py-2 text-[10px] text-primary/40 font-mono uppercase tracking-widest focus:ring-0 focus:border-primary/20 focus:bg-primary/10 outline-none placeholder:text-primary/10 transition-all"
                        placeholder="QUERY_ARCHIVE_ID..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 border-r border-primary/10 pr-4">
                        <span className="text-[9px] text-primary/20 uppercase tracking-widest font-bold">Filter:</span>
                        <select className="bg-transparent border-none text-[9px] text-primary/40 font-bold uppercase focus:ring-0 cursor-pointer p-0 font-mono">
                            <option className="bg-black">Sort_Chronological</option>
                            <option className="bg-black">Sort_Weight</option>
                        </select>
                    </div>
                    <div className="text-[9px] text-primary/20 font-mono tracking-tighter">
                        SHOWING: {filteredRecords.length}_RECORDS
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden z-10">
                {/* Left Sidebar: Segments */}
                <aside className="w-64 border-r border-primary/10 flex flex-col bg-black/20">
                    <nav className="flex-1 p-4 space-y-1">
                        <div className="text-[10px] font-bold text-primary/20 uppercase mb-6 px-3 tracking-[0.3em]">Data Segments</div>
                        <SegmentItem icon={Database} label="All_Vaults" count={totalIndexed} active />
                        <SegmentItem icon={ListAlt} label="Project_Logs" count={1240} />
                        <SegmentItem icon={NearMe} label="Travel_Nodes" count={84} />
                        <SegmentItem icon={ShoppingCart} label="Procurement" count={2768} />
                    </nav>
                    <div className="p-6 border-t border-primary/5">
                        <div className="bg-primary/5 p-4 border border-primary/10">
                            <p className="text-[9px] text-primary/20 font-bold uppercase mb-3 tracking-widest">Storage_Health</p>
                            <div className="h-1 w-full bg-white/5 overflow-hidden">
                                <div className="h-full bg-primary/20 w-[76%] shadow-[0_0_8px_rgba(255,255,0,0.1)]"></div>
                            </div>
                            <p className="text-[8px] font-mono text-primary/10 mt-2 uppercase tracking-tighter">NVME_ARRAY_01 // 76% LOAD</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area: Stream (Ghostly Aesthetic) */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Table Headers */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-2 bg-primary/5 border-b border-primary/10 text-[9px] font-bold uppercase tracking-[0.25em] text-primary/20">
                        <div className="col-span-1">UID</div>
                        <div className="col-span-5">Data_Payload_Object</div>
                        <div className="col-span-2">Origin_Segment</div>
                        <div className="col-span-3">Sync_Timestamp</div>
                        <div className="col-span-1 text-right">Logic</div>
                    </div>

                    {/* Records List */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        {filteredRecords.map((record) => (
                            <div
                                key={record.id}
                                className="archive-row grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/[0.03] transition-all hover:bg-primary/[0.05] hover:border-l-2 hover:border-primary/50 group"
                            >
                                <div className="col-span-1 font-mono text-[10px] text-primary/20 group-hover:text-primary transition-colors">
                                    {record.uid}
                                </div>
                                <div className="col-span-5 text-sm font-bold text-[#666666] group-hover:text-primary/80 transition-colors uppercase tracking-tight">
                                    {record.title}
                                </div>
                                <div className="col-span-2 flex items-center">
                                    <span className="text-[9px] px-2 py-0.5 border border-primary/10 text-[#444444] group-hover:text-primary/50 group-hover:border-primary/20 uppercase font-black tracking-widest transition-all">
                                        {record.type}
                                    </span>
                                </div>
                                <div className="col-span-3 font-mono text-[10px] text-[#444444] group-hover:text-primary/30 transition-colors">
                                    {record.timestamp}
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    <button
                                        onClick={() => handleRestore(record)}
                                        className="w-8 h-8 flex items-center justify-center border border-primary/5 text-primary/10 hover:border-primary/30 hover:text-primary/50 hover:bg-primary/5 transition-all rounded shadow-sm opacity-50 group-hover:opacity-100"
                                        title="RESTORE_TO_ACTIVE"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {filteredRecords.length === 0 && (
                            <div className="py-20 text-center opacity-10 flex flex-col items-center gap-6">
                                <Archive className="h-16 w-16" />
                                <p className="text-[12px] font-mono uppercase tracking-[0.5em]">No_Archives_Match_Query</p>
                            </div>
                        )}

                        <div className="py-16 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-10">
                                <Archive className="h-10 w-10" />
                                <p className="text-[9px] font-mono uppercase tracking-[0.5em]">End of Historical Buffer</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Metabolism & Heatmap */}
                <aside className="w-80 border-l border-primary/10 flex flex-col bg-black/40 p-6 space-y-8 overflow-y-auto scrollbar-hide">
                    <div>
                        <h3 className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                            <span className="w-1 h-3 bg-primary"></span>
                            Archive_Metabolism
                        </h3>
                        <div className="space-y-3">
                            <div className="bg-primary/5 border border-primary/10 p-4 group hover:border-primary/40 transition-all cursor-crosshair">
                                <p className="text-[9px] text-primary/40 uppercase mb-1 tracking-widest">Total_Logs_Indexed</p>
                                <p className="text-3xl font-black text-primary tracking-tighter group-hover:scale-105 transition-transform origin-left">{totalIndexed.toLocaleString()}</p>
                            </div>
                            <div className="bg-primary/5 border border-primary/10 p-4 group hover:border-primary/40 transition-all cursor-crosshair">
                                <p className="text-[9px] text-primary/40 uppercase mb-1 tracking-widest">Restoration_Events</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-black text-primary tracking-tighter group-hover:scale-105 transition-transform origin-left">{restorationEvents}</p>
                                    <span className="text-[9px] font-mono text-primary/40">/ LIFETIME</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                            <span className="w-1 h-3 bg-primary"></span>
                            Activity_Heatmap
                        </h3>
                        <div className="bg-primary/[0.02] border border-primary/5 p-4 rounded backdrop-blur-sm">
                            <div className="grid grid-cols-7 gap-1.5">
                                {Array.from({ length: 21 }).map((_, i) => {
                                    const intensity = [0.2, 0.05, 0.4, 0.1, 0.6, 0.05, 0.2, 0.05, 0.1, 0.05, 0.3, 0.05, 0.05, 0.15, 0.4, 0.1, 0.1, 0.05, 0.8, 0.1, 0.05][i];
                                    return (
                                        <div
                                            key={i}
                                            className={cn(
                                                "aspect-square border border-primary/5 transition-all hover:scale-110 cursor-pointer",
                                                intensity > 0.5 && "shadow-[0_0_8px_rgba(255,255,0,0.2)]"
                                            )}
                                            style={{ backgroundColor: `rgba(255, 255, 0, ${intensity})` }}
                                        />
                                    );
                                })}
                            </div>
                            <div className="mt-4 flex justify-between items-center text-[8px] font-mono text-primary/30 uppercase tracking-widest">
                                <span>Lesser_Engage</span>
                                <span>Peak_Buffer</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto space-y-4">
                        <button className="w-full bg-primary/5 hover:bg-primary/20 text-primary border border-primary/20 py-3 flex items-center justify-center gap-3 transition-all font-black text-[10px] tracking-widest uppercase">
                            <Terminal className="h-3.5 w-3.5" />
                            Export_Manifest
                        </button>
                        <div className="border-t border-primary/10 pt-4 opacity-30">
                            <p className="text-[8px] font-mono text-primary/40 mb-2 uppercase tracking-widest font-bold">ENGINE_SPEC:</p>
                            <div className="text-[8px] text-primary/60 leading-relaxed font-mono uppercase">
                                APPWRITE_MAPPING: ENABLED<br />
                                RESTORE: ATOMIC_WRITE<br />
                                GHOST_LOGIC: PERSISTENT
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function SegmentItem({ icon: Icon, label, count, active = false }: { icon: any, label: string, count: number, active?: boolean }) {
    return (
        <a
            className={cn(
                "flex items-center gap-3 p-3 rounded transition-all group border",
                active
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-transparent text-[#666666] hover:bg-primary/5 hover:text-primary"
            )}
            href="#"
        >
            <Icon className={cn(
                "h-5 w-5 transition-opacity",
                active ? "opacity-100" : "opacity-50 group-hover:opacity-100"
            )} />
            <span className="font-bold text-[10px] uppercase tracking-[0.15em]">{label}</span>
            <span className={cn(
                "ml-auto text-[10px] font-mono",
                active ? "opacity-60" : "opacity-40"
            )}>{count.toLocaleString()}</span>
        </a>
    );
}
