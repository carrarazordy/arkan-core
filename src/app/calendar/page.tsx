"use client";

import { useState, useEffect } from "react";
import { useCalendarStore, CalendarEvent } from "@/store/useCalendarStore";
import { cn } from "@/lib/utils";
import {
    Terminal,
    Calendar as CalendarIcon,
    Activity,
    RotateCcw,
    PlusCircle,
    X,
    Save,
    AlertTriangle,
    Clock,
    ChevronLeft,
    ChevronRight,
    MapPin
} from "lucide-react";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";

// Helper for weekly range
const getWeekRange = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    start.setHours(0, 0, 0, 0);

    const week = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        week.push(d);
    }
    return week;
};

export default function CalendarPage() {
    const { events, addEvent, selectedDate, setSelectedDate, markAlertFired } = useCalendarStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeAlert, setActiveAlert] = useState<CalendarEvent | null>(null);
    const [currentWeek, setCurrentWeek] = useState<Date[]>([]); // Init empty

    useEffect(() => {
        // Init week range on client side only to avoid hydration mismatch
        setCurrentWeek(getWeekRange(new Date(selectedDate || Date.now())));
    }, [selectedDate]);

    // Modal Form State
    const [newEventData, setNewEventData] = useState({
        title: "",
        date: new Date().toLocaleDateString('en-CA'),
        time: "09:00",
        notes: "",
        type: 'CORE' as const
    });

    // Background Alert Monitor (Exactly 5 minutes before)
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            events.forEach(event => {
                const timeDiff = event.startTimestamp - now;
                // Threshold: exactly 5 minutes (300,000ms) with a small window for the interval
                if (timeDiff > 0 && timeDiff <= 300000 && !event.alertFired) {
                    setActiveAlert(event);
                    markAlertFired(event.id);
                    ArkanAudio.playFast('alert_sequence_high');
                    ArkanAudio.startHeartbeat();
                    console.log(`>> SYSTEM_PRIORITY_ALERT_TRIGGERED: ${event.title}`);
                }
            });
        }, 5000); // Check every 5 seconds for precision

        return () => clearInterval(interval);
    }, [events, markAlertFired]);

    // Handle week navigation
    const navigateWeek = (direction: 'PREV' | 'NEXT') => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + (direction === 'NEXT' ? 7 : -7));
        const timestamp = newDate.getTime();
        setSelectedDate(timestamp);
        setCurrentWeek(getWeekRange(newDate));
        ArkanAudio.playFast('shimmer');
    };

    const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(e.target.value);
        // Correct for timezone offset to keep the date selection stable
        newDate.setMinutes(newDate.getMinutes() + newDate.getTimezoneOffset());
        const timestamp = newDate.getTime();
        setSelectedDate(timestamp);
        setCurrentWeek(getWeekRange(newDate));
        ArkanAudio.playFast('shimmer');
    };

    const openAddModal = (date?: Date) => {
        if (date) {
            // Adjust for local timezone offset when setting date from selection
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset * 60 * 1000));

            setNewEventData(prev => ({
                ...prev,
                date: localDate.toISOString().split('T')[0]
            }));
        }
        setIsModalOpen(true);
        ArkanAudio.playFast('system_engage');
    };

    const handleCommit = () => {
        const start = new Date(`${newEventData.date}T${newEventData.time}`).getTime();
        addEvent({
            title: newEventData.title || "UNTITLED_SEQUENCE",
            startTimestamp: start,
            endTimestamp: start + 3600000, // 1 hour default
            notes: newEventData.notes,
            type: newEventData.type,
            priority: 'MEDIUM',
            status: 'PENDING'
        });
        setIsModalOpen(false);
        ArkanAudio.playFast('confirm');
    };

    return (
        <div className="flex-1 flex flex-col p-6 space-y-6 overflow-hidden relative">
            {/* Tactical Header */}
            <div className="flex justify-between items-start border-b border-primary/20 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-primary/60">
                        <Terminal className="h-3 w-3" />
                        ARKAN_OS // TEMPORAL_CHRONOLOGY
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter italic">TACTICAL_TIMELINE</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-3 py-1 rounded">
                            <Clock className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-mono text-primary uppercase">UTC_OFFSET: -03:00</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 border border-primary/10 rounded">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-mono text-primary/40 uppercase">LIVE_SYNC: ACTIVE</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigateWeek('PREV')}
                            className="p-2 border border-primary/20 hover:border-primary/60 rounded transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <input
                            type="date"
                            value={new Date(selectedDate).toISOString().split('T')[0]}
                            onChange={handleDateSelect}
                            className="bg-black border border-primary/30 text-primary text-[10px] font-mono px-3 py-2 rounded focus:border-primary outline-none cursor-pointer"
                        />
                        <button
                            onClick={() => navigateWeek('NEXT')}
                            className="p-2 border border-primary/20 hover:border-primary/60 rounded transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                    <button
                        onClick={() => openAddModal()}
                        className="bg-primary text-black px-6 py-2 font-black text-xs tracking-tighter flex items-center gap-2 shadow-[0_0_15px_rgba(249,249,6,0.4)] hover:bg-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 uppercase"
                    >
                        <PlusCircle className="h-4 w-4" />
                        INITIALIZE_EVENT
                    </button>
                </div>
            </div>

            {/* Matrix Timeline View */}
            <div className="flex-1 grid grid-cols-7 gap-4 min-h-0">
                {currentWeek.map((day, idx) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    const dayEvents = events.filter(e => {
                        const eventDate = new Date(e.startTimestamp);
                        return eventDate.toDateString() === day.toDateString();
                    }).sort((a, b) => a.startTimestamp - b.startTimestamp);

                    return (
                        <div key={idx} className={cn(
                            "flex flex-col border border-primary/10 bg-black/40 relative group",
                            isToday && "border-primary/30 ring-1 ring-primary/20"
                        )}>
                            {/* Column Header */}
                            <div className={cn(
                                "p-3 border-b border-primary/10 flex justify-between items-center bg-white/5",
                                isToday && "bg-primary/10"
                            )}>
                                <div className="flex flex-col">
                                    <span className={cn(
                                        "text-[10px] font-black tracking-widest",
                                        isToday ? "text-primary" : "text-primary/40"
                                    )}>
                                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][day.getDay()]}
                                    </span>
                                    <span className="text-xs font-mono opacity-60">
                                        {day.getDate().toString().padStart(2, '0')}_{(day.getMonth() + 1).toString().padStart(2, '0')}
                                    </span>
                                </div>
                                <button
                                    onClick={() => openAddModal(day)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-primary transition-all text-primary/40"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Events List */}
                            <div className="flex-1 p-2 space-y-2 overflow-y-auto scrollbar-hide">
                                {dayEvents.map(event => (
                                    <div
                                        key={event.id}
                                        className={cn(
                                            "p-2 border-l-2 bg-primary/5 border-primary/40 hover:bg-primary/10 transition-colors cursor-pointer relative overflow-hidden group/event",
                                            event.type === 'CORE' && "border-primary",
                                            event.type === 'SYSTEM' && "border-blue-500/50 bg-blue-500/5",
                                            event.type === 'RECON' && "border-purple-500/50 bg-purple-500/5"
                                        )}
                                    >
                                        <div className="text-[9px] font-mono text-primary/60 mb-1 flex justify-between">
                                            <span>{new Date(event.startTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                            <span className="hidden group-hover/event:block opacity-40">#{event.id}</span>
                                        </div>
                                        <div className="text-[10px] font-black leading-tight tracking-tighter uppercase break-words">
                                            {event.title}
                                        </div>

                                        {/* Activity Indicator for ACTIVE events */}
                                        {event.status === 'ACTIVE' && (
                                            <div className="absolute top-1 right-1">
                                                <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {dayEvents.length === 0 && (
                                    <div className="flex-1 flex items-center justify-center opacity-10">
                                        <Activity className="h-4 w-4" />
                                    </div>
                                )}
                            </div>

                            {/* Column Footer Decoration */}
                            <div className="h-1 bg-gradient-to-r from-transparent via-primary/5 to-transparent w-full" />
                        </div>
                    );
                })}
            </div>

            {/* Global Footer Stats */}
            <div className="flex items-center justify-between border-t border-primary/20 pt-4 text-[10px] font-mono tracking-tighter text-primary/40">
                <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                        <span className="opacity-40 uppercase tracking-widest text-[8px]">Processor_Load</span>
                        <span className="text-primary font-bold">24%</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="opacity-40 uppercase tracking-widest text-[8px]">Events_Logged</span>
                        <span className="text-primary font-bold">{events.length}</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <RotateCcw className="h-3 w-3" />
                        <span>SYNC_STATUS: <span className="text-primary uppercase">Appwrite_Uplink [ACTIVE]</span></span>
                    </div>
                </div>
            </div>

            {/* PRIORITY ALERT MODAL (The Glitch Engine) */}
            {activeAlert && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-[1000] p-4 animate-in fade-in zoom-in duration-300">
                    <div className="max-w-md w-full border-4 border-primary bg-black p-1 shadow-[0_0_50px_rgba(249,249,6,0.6)] relative overflow-hidden group">
                        {/* Glitch Overlay Effect */}
                        <div className="absolute inset-0 bg-primary/5 mix-blend-overlay pointer-events-none animate-pulse" />

                        <div className="bg-black p-8 relative border border-primary/20">
                            <div className="absolute top-0 right-0 p-4 text-primary opacity-10">
                                <AlertTriangle className="h-32 w-32 rotate-12" />
                            </div>

                            <div className="flex items-center gap-4 border-b-2 border-primary pb-4 mb-6 relative">
                                <AlertTriangle className="h-8 w-8 text-primary animate-bounce" />
                                <h4 className="text-2xl font-black text-primary tracking-widest uppercase italic">SYSTEM_PRIORITY_ALERT</h4>
                            </div>

                            <div className="space-y-8 relative">
                                <div className="space-y-2">
                                    <div className="text-[10px] font-mono text-primary/60 uppercase tracking-widest">&gt; CRITICAL_SEQUENCE_THRESHOLD_REACHED</div>
                                    <h5 className="text-3xl font-black italic text-primary leading-tight uppercase animate-pulse">
                                        {activeAlert.title}
                                    </h5>
                                    <div className="text-[11px] font-mono text-primary p-2 bg-primary/10 border-l border-primary inline-block">
                                        T-MINUS: <span className="font-bold">05:00</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="h-3 w-full bg-primary/5 border border-primary/20 relative overflow-hidden">
                                        <div className="absolute inset-y-0 left-0 bg-primary shadow-[0_0_20px_#ffff00] animate-[shimmer_2s_infinite]" style={{ width: '66%' }} />
                                    </div>
                                    <div className="flex justify-between text-[9px] font-mono text-primary/40 uppercase">
                                        <span>Initial_Buffer_Load</span>
                                        <span className="animate-pulse">Status: Authoritative</span>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => {
                                            setActiveAlert(null);
                                            ArkanAudio.stopHeartbeat();
                                            ArkanAudio.playFast('confirm');
                                        }}
                                        className="flex-1 py-4 border-2 border-primary text-primary font-black uppercase tracking-widest text-xs hover:bg-primary/10 transition-all"
                                    >
                                        [ ACKNOWLEDGE ]
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveAlert(null);
                                            ArkanAudio.stopHeartbeat();
                                            ArkanAudio.playFast('shimmer');
                                        }}
                                        className="flex-1 py-4 bg-primary text-black font-black uppercase tracking-widest text-xs shadow-[0_0_30px_#ffff00] hover:scale-105 transition-all"
                                    >
                                        [ OPEN_MODULE ]
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-8 pt-4 border-t border-primary/10 text-[8px] font-mono text-primary/30 uppercase tracking-[0.2em]">
                                <span>SEC_LVL_4: ACTIVE_ENCRYPTION</span>
                                <span>REF_ID: #{activeAlert.id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* INITIALIZATION MODAL (Sequence Entry) */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[110] p-4">
                    <div className="w-full max-w-2xl bg-black border-2 border-primary p-1 shadow-[0_0_40px_rgba(249,249,6,0.3)]">
                        <div className="bg-primary/10 border-b border-primary/50 px-6 py-4 flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-primary/60 tracking-[0.2em] font-bold">MODE: SEQUENCE_ENTRY</span>
                                <h2 className="text-primary text-xl font-black tracking-widest uppercase italic">Initializing_New_Temporal_Sequence</h2>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 bg-primary animate-pulse" />
                                <div className="w-2 h-2 bg-primary/40" />
                                <div className="w-2 h-2 bg-primary/20" />
                            </div>
                        </div>

                        <div className="p-8 space-y-8 bg-[#050502]">
                            <div className="space-y-3">
                                <label className="block text-[10px] text-primary/60 font-bold tracking-[0.4em] uppercase">&gt; EVENT_IDENTIFIER</label>
                                <input
                                    className="w-full bg-white/5 border border-primary/20 p-4 text-primary font-mono focus:border-primary/60 focus:ring-0 focus:bg-primary/10 transition-all outline-none placeholder:text-primary/10 text-lg uppercase font-black"
                                    placeholder="ENTER_SEQUENCE_NAME..."
                                    value={newEventData.title}
                                    onChange={e => setNewEventData(prev => ({ ...prev, title: e.target.value }))}
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="block text-[10px] text-primary/60 font-bold tracking-[0.4em] uppercase">&gt; TEMPORAL_MARKER</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            className="w-full bg-white/5 border border-primary/20 p-4 text-primary font-mono focus:border-primary/60 focus:ring-1 focus:ring-primary/20 outline-none appearance-none cursor-pointer text-sm"
                                            value={newEventData.date}
                                            onChange={e => setNewEventData(prev => ({ ...prev, date: e.target.value }))}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none">
                                            <CalendarIcon className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] text-primary/60 font-bold tracking-[0.4em] uppercase">&gt; TIMESTAMP</label>
                                    <div className="relative">
                                        <input
                                            className="w-full bg-white/5 border border-primary/20 p-4 text-primary font-mono focus:border-primary/60 transition-all outline-none text-sm"
                                            type="time"
                                            value={newEventData.time}
                                            onChange={e => setNewEventData(prev => ({ ...prev, time: e.target.value }))}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] text-primary/60 font-bold tracking-[0.4em] uppercase">&gt; SUPPLEMENTAL_DATA</label>
                                <div className="relative">
                                    <textarea
                                        className="w-full bg-white/5 border border-primary/20 p-4 text-primary font-mono focus:border-primary/60 focus:bg-primary/5 transition-all outline-none placeholder:text-primary/10 resize-none text-sm min-h-[120px]"
                                        placeholder="APPEND_NOTES_TO_SEQUENCE..."
                                        value={newEventData.notes}
                                        onChange={e => setNewEventData(prev => ({ ...prev, notes: e.target.value }))}
                                    ></textarea>
                                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                        <span className="text-[10px] text-primary/30 font-mono italic uppercase tracking-wider">B_04 // UTF-8</span>
                                        <div className="w-2 h-5 bg-primary animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-6 pt-6">
                                <button
                                    onClick={handleCommit}
                                    className="flex-1 bg-primary text-black font-black py-5 tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white transition-all uppercase text-sm shadow-[0_0_20px_#ffff00]"
                                >
                                    <Save className="h-4 w-4" />
                                    Commit_to_Timeline
                                </button>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        ArkanAudio.playFast('lock');
                                    }}
                                    className="flex-1 border border-primary/30 text-primary font-black py-5 tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary/10 transition-all uppercase text-sm"
                                >
                                    <X className="h-4 w-4" />
                                    Abort_Sequence
                                </button>
                            </div>
                        </div>

                        <div className="bg-primary/5 border-t border-primary/10 px-6 py-2 flex justify-between items-center text-[9px] text-primary/20 tracking-widest uppercase font-mono">
                            <span className="flex items-center gap-2">
                                <MapPin className="h-2 w-2" />
                                LOCAL_BUFFER: ENCRYPTED
                            </span>
                            <span>DATA_STREAM: AES_256_STABLE</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Background Deco */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden select-none">
                <div className="grid grid-cols-12 gap-0 h-full w-full">
                    {Array.from({ length: 144 }).map((_, i) => (
                        <div key={i} className="border-[0.5px] border-primary/20 h-full w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}
