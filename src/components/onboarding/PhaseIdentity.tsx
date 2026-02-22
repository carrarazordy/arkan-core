"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";

import { supabase } from "@/lib/supabase";
import { Loader2, Fingerprint, Key, Eye, EyeOff, ShieldCheck } from "lucide-react";

export function PhaseIdentity({ onComplete }: { onComplete: () => void }) {
    const [email, setEmail] = useState("");
    const [key, setKey] = useState("");
    const [showKey, setShowKey] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSync = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !key) return;

        setIsSyncing(true);
        setError(null);
        ArkanAudio.playFast('digital_handshake');

        try {
            // Arkan logic: In first-run, we create the account
            // Supabase equivalent:
            const { error: signUpError } = await supabase.auth.signUp({
                email: email.trim(), // Use actual email from user
                password: key,
                options: {
                    data: {
                        name: email.split('@')[0] // Use part before @ as name
                    }
                }
            });

            if (signUpError) throw signUpError;

            // If signup successful
            ArkanAudio.playFast('confirm');
            onComplete();

        } catch (err: any) {
            setError(err.message || "SYNC_FAILURE");
            setIsSyncing(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl grid lg:grid-cols-2 gap-12 relative z-10"
        >
            <div className="space-y-8">
                <div className="border border-primary/20 bg-black p-8 rounded-sm neon-glow relative">
                    <div className="absolute top-[-1px] left-[-1px] w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                    <div className="absolute bottom-[-1px] right-[-1px] w-4 h-4 border-b-2 border-r-2 border-primary"></div>

                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-1">
                            <Fingerprint className="h-4 w-4 text-primary" />
                            <h2 className="text-primary text-xs font-bold uppercase tracking-[0.2em]">Neural_Signature_Setup</h2>
                        </div>
                        <p className="text-primary/40 text-[10px] uppercase font-mono tracking-widest">PHASE_02 // SYNC_PROTOCOLS</p>
                    </div>

                    <form onSubmit={handleSync} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Email_Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value.toUpperCase())}
                                    className="w-full bg-black/60 border border-primary/20 focus:border-primary px-4 py-4 text-primary font-mono text-sm outline-none transition-all placeholder:text-primary/10"
                                    placeholder="DESIGNATE_EMAIL"
                                    disabled={isSyncing}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Access_Key</label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                                <input
                                    type={showKey ? "text" : "password"}
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                    className="w-full bg-black/60 border border-primary/20 focus:border-primary px-10 py-4 text-primary font-mono text-sm outline-none transition-all placeholder:text-primary/10"
                                    placeholder="••••••••••••••••"
                                    disabled={isSyncing}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition-colors"
                                >
                                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-primary/5 border border-primary/10 flex gap-4 items-start">
                            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                            <p className="text-[9px] text-primary/60 leading-relaxed font-mono uppercase tracking-tighter">
                                SECURITY_ALERT: Keys are locally hashed before transmission. Arkan core never stores raw plaintext credentials.
                            </p>
                        </div>

                        {error && <p className="text-red-500 text-[10px] font-mono text-center uppercase tracking-widest">{error}</p>}

                        <button
                            disabled={isSyncing || !email || !key}
                            className="w-full py-4 bg-primary text-black font-black uppercase tracking-[0.3em] text-xs hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSyncing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    SYNCING_IDENTITY...
                                </span>
                            ) : "Sync_neural_link"}
                        </button>
                    </form>
                </div>
            </div>

            <div className="space-y-8 flex flex-col justify-center">
                <div className="border-l-2 border-primary/20 pl-6 space-y-2">
                    <h3 className="text-primary text-xs font-bold uppercase tracking-widest">Zero_Knowledge_Protocol</h3>
                    <p className="text-primary/40 text-[11px] leading-relaxed italic uppercase font-light">
                        The ZKP sub-routine allows for identity verification without exposing the actual data. Your 'Access_Key' proves its validity mathematically.
                    </p>
                </div>
                <div className="border-l-2 border-primary/20 pl-6 space-y-2">
                    <h3 className="text-primary text-xs font-bold uppercase tracking-widest">Neural_Encryption</h3>
                    <p className="text-primary/40 text-[11px] leading-relaxed italic uppercase font-light">
                        Military-grade encryption for all database interactions. Every data point is fragmented and distributed across decentralized nodes.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
