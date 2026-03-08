"use client";

import { useEffect, useState } from "react";
import { useSettingsStore, LocaleCode, ThemeColor, AudioLevels } from "@/store/useSettingsStore";
import { useSystemLogStore } from "@/store/useSystemLogStore";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";
import { Shield, Globe, Database, Activity, Download, FileJson, Terminal as TerminalIcon, Volume2, Keyboard, Palette, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

const SHORTCUTS = [
    { key: "CMD + K", action: "OMNI_SEARCH" },
    { key: "CMD + N", action: "NEW_NOTE_NODE" },
    { key: "CMD + B", action: "TOGGLE_SIDEBAR" },
    { key: "ESC", action: "ABORT_SEQUENCE" },
    { key: "ENTER", action: "EXECUTE_COMMAND" }
];

const COLORS: { hex: ThemeColor; label: string }[] = [
    { hex: '#F9F906', label: 'NEON_YELLOW' },
    { hex: '#FF00FF', label: 'CYBER_PINK' },
    { hex: '#00FF00', label: 'MATRIX_GREEN' },
    { hex: '#00FFFF', label: 'DEEP_CYAN' },
    { hex: '#FF4500', label: 'VOLCANIC_ORANGE' },
    { hex: '#F8F8FF', label: 'GHOST_WHITE' }
];

export default function SettingsPage() {
    const {
        locale, setLocale,
        themeColor, setThemeColor,
        audioLevels, setAudioLevel,
        isUplinkActive, latency, checkConnectivity
    } = useSettingsStore();

    const { logs } = useSystemLogStore();
    const [isTesting, setIsTesting] = useState(false);

    useEffect(() => {
        checkConnectivity();
        const interval = setInterval(checkConnectivity, 30000);
        return () => clearInterval(interval);
    }, [checkConnectivity]);

    useEffect(() => {
        // Enforce theme on mount
        document.documentElement.style.setProperty('--arkan-neon', themeColor);
    }, [themeColor]);

    const handleRunSelfTest = async () => {
        setIsTesting(true);
        ArkanAudio.playFast('shimmer');
        await new Promise(resolve => setTimeout(resolve, 2000));
        await checkConnectivity();
        setIsTesting(false);
        ArkanAudio.playFast('confirm');
    };

    const handleExportManifest = () => {
        ArkanAudio.playFast('shimmer');
        const data = {
            version: '2.0.0',
            exportedAt: new Date().toISOString(),
            locale,
            logs: logs.slice(-50)
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `arkan_manifest_${Date.now()}.json`;
        a.click();
    };

    return (
        <div className="flex-1 p-8 bg-[#0a0a05] space-y-8 overflow-y-auto custom-scrollbar">
            <header className="flex items-center justify-between border-b border-primary/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tighter neon-yellow-glow uppercase">System_Settings</h1>
                    <p className="text-[10px] text-primary/40 font-mono mt-1 tracking-[0.3em]">RECONFIGURING_CORE_OPERATIONS</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase",
                        isUplinkActive ? "border-green-500/20 text-green-500 bg-green-500/5" : "border-red-500/20 text-red-500 bg-red-500/5"
                    )}>
                        <Activity className="h-3 w-3" />
                        UPLINK: {isUplinkActive ? 'CONNECTED' : 'OFFLINE'}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* VISUAL INTERFACE & THEME ENGINE */}
                <section className="bg-primary/5 border border-primary/10 p-6 rounded-xl space-y-6">
                    <h2 className="text-xs font-bold text-primary tracking-[0.3em] uppercase flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Visual_Interface
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        {COLORS.map((col) => (
                            <button
                                key={col.hex}
                                onClick={() => setThemeColor(col.hex)}
                                className={cn(
                                    "h-16 rounded border transition-all relative overflow-hidden group hover:scale-105",
                                    themeColor === col.hex ? "border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" : "border-white/10"
                                )}
                                style={{ backgroundColor: col.hex }}
                            >
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
                                <span className={cn(
                                    "absolute bottom-1 left-2 text-[8px] font-bold uppercase tracking-widest text-white shadow-black drop-shadow-md",
                                    themeColor === col.hex ? "opacity-100" : "opacity-60"
                                )}>
                                    {col.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* AUDIO ENGINE */}
                <section className="bg-primary/5 border border-primary/10 p-6 rounded-xl space-y-6">
                    <h2 className="text-xs font-bold text-primary tracking-[0.3em] uppercase flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        Audio_Engine_Control
                    </h2>
                    <div className="space-y-6">
                        {(Object.keys(audioLevels) as Array<keyof AudioLevels>).map((key) => (
                            <div key={key} className="space-y-2">
                                <div className="flex justify-between text-[10px] font-mono text-primary/60 uppercase">
                                    <span>{key.toUpperCase()}_GAIN</span>
                                    <span>{Math.round(audioLevels[key] * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.05"
                                    value={audioLevels[key]}
                                    onChange={(e) => setAudioLevel(key, parseFloat(e.target.value))}
                                    className="w-full accent-primary h-1 bg-primary/20 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* KEYBOARD COMMAND MAP */}
                <section className="bg-primary/5 border border-primary/10 p-6 rounded-xl space-y-6">
                    <h2 className="text-xs font-bold text-primary tracking-[0.3em] uppercase flex items-center gap-2">
                        <Keyboard className="h-4 w-4" />
                        Keyboard_Command_Map
                    </h2>
                    <div className="space-y-3">
                        {SHORTCUTS.map((s, i) => (
                            <div key={i} className="flex justify-between items-center bg-black/40 p-3 rounded border border-primary/5">
                                <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded border border-primary/20 font-bold font-mono">
                                    {s.key}
                                </span>
                                <span className="text-[10px] text-primary/60 font-mono tracking-widest uppercase">
                                    {s.action}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* LOCALE & UPLINK - Combined for space efficiency logic from user spec */}
                <section className="bg-primary/5 border border-primary/10 p-6 rounded-xl space-y-6">
                    <h2 className="text-xs font-bold text-primary tracking-[0.3em] uppercase flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Core_Configuration
                    </h2>

                    {/* Localization */}
                    <div className="flex gap-4 mb-8">
                        {(['EN_US', 'PT_BR'] as LocaleCode[]).map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setLocale(lang)}
                                className={cn(
                                    "flex-1 p-3 rounded border font-mono text-[10px] uppercase tracking-widest transition-all",
                                    locale === lang
                                        ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(255,255,0,0.3)]"
                                        : "border-primary/20 text-primary/40 hover:border-primary/60"
                                )}
                            >
                                {lang === 'EN_US' ? 'English (US)' : 'Português (BR)'}
                            </button>
                        ))}
                    </div>

                    {/* Uplink Diagnostics */}
                    <div className="space-y-4 pt-4 border-t border-primary/10">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-bold text-primary/60 uppercase flex items-center gap-2">
                                <Wifi className="h-3 w-3" />
                                Appwrite_Uplink
                            </h3>
                            <span className="text-xs font-bold text-primary">{latency}ms</span>
                        </div>
                        <button
                            onClick={handleRunSelfTest}
                            disabled={isTesting}
                            className="w-full p-4 border border-primary/20 rounded hover:bg-primary/10 transition-all text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                        >
                            {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                            Run_System_Self_Test
                        </button>
                        <button
                            onClick={handleExportManifest}
                            className="w-full p-4 bg-primary text-black rounded hover:bg-white transition-all text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                        >
                            <FileJson className="h-4 w-4" />
                            Export_Encrypted_Manifest
                        </button>
                    </div>
                </section>

                {/* Real-time Event Stream */}
                <section className="bg-black/60 border border-primary/10 p-6 rounded-xl space-y-4 lg:col-span-2">
                    <h2 className="text-xs font-bold text-primary tracking-[0.3em] uppercase flex items-center gap-2">
                        <TerminalIcon className="h-4 w-4" />
                        Real_Time_Log_Stream
                    </h2>

                    <div className="h-48 overflow-y-auto custom-scrollbar bg-black/40 p-4 rounded-lg font-mono text-[10px] space-y-1">
                        {logs.slice(-20).map((log, i) => (
                            <div key={i} className="flex gap-4 opacity-80">
                                <span className="text-primary/40">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                <span className={cn(
                                    log.type === 'critical' ? 'text-red-500 font-bold' :
                                        log.type === 'user' ? 'text-blue-400' : 'text-primary/80'
                                )}>
                                    {log.message}
                                </span>
                            </div>
                        ))}
                        {logs.length === 0 && <div className="text-primary/20 italic italic">WAITING_FOR_UPLINK_EVENTS...</div>}
                    </div>
                </section>
            </div>
        </div>
    );
}

function Loader2(props: any) {
    return <Activity {...props} className={cn(props.className, "animate-spin")} />;
}
