"use client";

import { useEffect, useState } from "react";
import { useIdentityStore, SessionNode } from "@/store/useIdentityStore";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";
import { Shield, ShieldAlert, Laptop, Smartphone, Globe, XCircle, RotateCcw, Lock, Eye, EyeOff, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SecurityPage() {
    const {
        sessions, securityLevel, isLoading, localKey,
        fetchSessions, terminateSession, triggerSecurityHandshake, generateLocalKey, rotateLocalKey
    } = useIdentityStore();

    const [scanned, setScanned] = useState(false);
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        const init = async () => {
            triggerSecurityHandshake();
            if (!localKey) generateLocalKey();
            await fetchSessions();
            setScanned(true);
        };
        init();
    }, [fetchSessions, triggerSecurityHandshake, generateLocalKey, localKey]);

    const handleTerminate = (id: string) => {
        terminateSession(id);
    };

    const copyKey = () => {
        if (localKey) {
            navigator.clipboard.writeText(localKey);
            ArkanAudio.playFast('confirm');
        }
    };

    return (
        <div className="flex-1 p-8 bg-[#0a0a05] space-y-8 overflow-y-auto custom-scrollbar relative">
            {/* Security Scan Animation Overlay */}
            {!scanned && (
                <div className="absolute inset-0 z-50 pointer-events-none">
                    <div className="h-1 w-full bg-primary/40 shadow-[0_0_20px_#ffff00] animate-scan-horizontal"></div>
                </div>
            )}

            <header className="flex items-center justify-between border-b border-primary/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tighter neon-yellow-glow uppercase">Identity_Core</h1>
                    <p className="text-[10px] text-primary/40 font-mono mt-1 tracking-[0.3em]">SECURE_SESSION_MANAGEMENT [Level: {securityLevel}]</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Threat Monitor */}
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase",
                        sessions.every(s => s.status === 'ACTIVE_SESSION' || s.device)
                            ? "border-green-500/20 text-green-500 bg-green-500/5"
                            : "border-red-500/20 text-red-500 bg-red-500/5 animate-pulse"
                    )}>
                        <Shield className="h-3 w-3" />
                        SYSTEM_STATUS: {sessions.every(s => s.status === 'ACTIVE_SESSION' || s.device) ? 'OPTIMAL' : 'THREAT_DETECTED'}
                    </div>

                    <button
                        onClick={() => fetchSessions()}
                        className="p-2 border border-primary/20 rounded hover:bg-primary/10 transition-all"
                    >
                        <RotateCcw className={cn("h-4 w-4 text-primary", isLoading && "animate-spin")} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
                {/* Active Sessions Stack */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold text-primary tracking-[0.3em] uppercase flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Active_Neural_Connections
                        </h2>
                        <span className="text-[10px] font-mono text-white/40">{sessions.length} NODES_DETECTED</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className={cn(
                                    "p-6 border rounded-xl transition-all group relative overflow-hidden",
                                    session.status === 'ACTIVE_SESSION'
                                        ? "bg-primary/5 border-primary/30"
                                        : "bg-black/40 border-primary/10"
                                )}
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        {session.device.toLowerCase().includes('phone') ? <Smartphone className="h-5 w-5 text-primary" /> : <Laptop className="h-5 w-5 text-primary" />}
                                    </div>
                                    <div className={cn(
                                        "text-[8px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest",
                                        session.status === 'ACTIVE_SESSION' ? "border-green-500/40 text-green-500 bg-green-500/5" : "border-primary/20 text-white/40"
                                    )}>
                                        {session.status}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="font-mono">
                                        <div className="text-[10px] text-white/40 uppercase mb-1">Device_Node</div>
                                        <div className="text-xs font-bold text-white/90 truncate">{session.os} ({session.device})</div>
                                    </div>
                                    <div className="font-mono">
                                        <div className="text-[10px] text-white/40 uppercase mb-1">IP_Address</div>
                                        <div className="text-xs text-primary/80">{session.ip}</div>
                                    </div>
                                    <div className="font-mono">
                                        <div className="text-[10px] text-white/40 uppercase mb-1">Last_Pulse</div>
                                        <div className="text-[10px] text-white/60">{new Date(session.lastActive).toLocaleString()}</div>
                                    </div>
                                </div>

                                {session.status !== 'ACTIVE_SESSION' && (
                                    <button
                                        onClick={() => handleTerminate(session.id)}
                                        className="mt-6 w-full p-2 border border-red-500/20 text-red-500/60 hover:bg-red-500/10 hover:text-red-500 transition-all text-[9px] font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="h-3 w-3" />
                                        Terminate_Node
                                    </button>
                                )}

                                <div className="absolute bottom-0 right-0 p-2 opacity-5 pointer-events-none">
                                    <ShieldAlert className="h-12 w-12 text-primary" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Zero-Knowledge Security Section */}
                <section className="bg-primary/5 border border-primary/10 p-8 rounded-xl flex flex-col items-center text-center space-y-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/40 -z-10" />

                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 neon-yellow-glow">
                        <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white uppercase tracking-widest">Zero_Knowledge_Encryption</h2>
                        <p className="text-[10px] text-white/40 font-mono mt-2 max-w-md mx-auto leading-relaxed">
                            Your primary encryption key is generated locally and stored in your device's secure keychain. Arkan never transmits or stores your master key on any remote server.
                        </p>
                    </div>

                    {/* Key Visualizer */}
                    <div className="flex items-center gap-3 bg-black border border-primary/20 p-4 rounded mb-2 max-w-lg w-full">
                        <code className="flex-1 font-mono text-[10px] text-primary/80 truncate tracking-widest">
                            {showKey ? localKey : '••••••••••••••••••••••••••••••••'}
                        </code>
                        <div className="flex gap-2 border-l border-primary/10 pl-3">
                            <button onClick={() => setShowKey(!showKey)} className="text-primary/40 hover:text-primary transition-colors">
                                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <button onClick={copyKey} className="text-primary/40 hover:text-primary transition-colors">
                                <Copy className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={rotateLocalKey}
                        className="px-8 py-3 bg-primary text-black font-bold uppercase tracking-widest text-xs rounded shadow-[0_0_20px_#ffff00] hover:scale-105 transition-all"
                    >
                        Rotate_Master_Key
                    </button>
                </section>
            </div>

            {/* FOOTER TELEMETRY for Security Page */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-primary/10 text-[9px] font-mono text-primary/40">
                <div className="flex gap-6">
                    <span>ENCRYPTION: AES-GCM-256</span>
                    <span>KEY_STORE: LOCAL_INDEXED_DB</span>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span>DATA_SYNC: NOMINAL</span>
                </div>
            </div>
        </div>
    );
}
