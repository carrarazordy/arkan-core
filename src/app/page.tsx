"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SplashPage() {
    return (
        <div className="relative min-h-screen bg-black overflow-hidden font-display selection:bg-primary selection:text-black">
            {/* Ambient Grid & Scanline */}
            <div className="fixed inset-0 grid-overlay pointer-events-none opacity-40"></div>
            <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent via-black/20 to-black"></div>

            {/* Scanline Animation Effect */}
            <div className="scanline absolute w-full h-[100px] z-10 opacity-10 pointer-events-none bottom-full animate-[scanline_8s_linear_infinite]" />

            {/* UI Frame */}
            <div className="fixed inset-0 p-8 flex flex-col justify-between pointer-events-none z-50">
                {/* Top HUD */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1 border-l-2 border-primary pl-4">
                        <span className="text-[10px] uppercase tracking-widest text-primary/60 font-mono">System Status</span>
                        <span className="text-xs font-mono text-primary flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            SECURE CONNECTION ESTABLISHED
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] uppercase tracking-widest text-primary/60 font-mono">Node Identification</span>
                        <span className="block text-xs font-mono text-primary">ARKAN_OS v4.0.2-ALPHA</span>
                    </div>
                </div>

                {/* Bottom HUD */}
                <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-2">
                        <div className="w-48 h-1 bg-primary/10 relative overflow-hidden">
                            <div className="absolute inset-y-0 left-0 w-2/3 bg-primary animate-[loading_2s_ease-in-out_infinite]"></div>
                        </div>
                        <span className="text-[10px] uppercase tracking-tighter text-primary/40 font-mono">BUFFERING NEURAL INTERFACE // 68%</span>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-primary/30 max-w-[200px] leading-tight uppercase font-mono">
                            Unauthorized access is strictly prohibited. All interactions are monitored and encrypted via quantum tunneling protocol.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Center */}
            <main className="relative z-20 min-h-screen flex flex-col items-center justify-center p-6">
                {/* Center Logo Section */}
                <div className="flex flex-col items-center mb-16">
                    <div className="relative group">
                        {/* Decorative background shapes */}
                        <div className="absolute -inset-10 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-all duration-700"></div>
                        <h1 className="text-8xl md:text-9xl font-bold tracking-[0.25em] text-primary logo-glow relative uppercase select-none">
                            Arkan
                        </h1>

                        {/* Technical Underline */}
                        <div className="w-full flex justify-between items-center mt-4 opacity-50">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-primary"></div>
                            <div className="px-4 text-[10px] font-mono text-primary tracking-[0.5em] font-bold">CORE ENGINE</div>
                            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-primary"></div>
                        </div>
                    </div>

                    {/* Terminal Feed */}
                    <div className="mt-12 w-full max-w-md font-mono text-xs text-primary/80 space-y-2">
                        <div className="flex gap-4">
                            <span className="text-primary/40 shrink-0">[00:01:24]</span>
                            <span className="uppercase">&gt;&gt; SYSTEM CORE: INITIALIZED</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-primary/40 shrink-0">[00:01:25]</span>
                            <span className="uppercase">&gt;&gt; NEURAL MAPPING: COMPLETE</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-primary/40 shrink-0">[00:01:25]</span>
                            <span className="uppercase">&gt;&gt; ENCRYPTION ACTIVE [AES-256]</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-primary/40 shrink-0">[00:01:26]</span>
                            <span className="uppercase terminal-cursor text-primary font-bold">&gt;&gt; AWAITING OPERATOR INPUT</span>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="relative group mt-8">
                    <div className="absolute -inset-2 bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Link href="/login" className="relative px-12 py-4 bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300 text-lg font-bold tracking-[0.3em] uppercase animate-pulse-border rounded-sm overflow-hidden pointer-events-auto flex items-center gap-4 group-hover:shadow-[0_0_20px_rgba(255,255,0,0.5)]">
                        <span className="relative z-10 flex items-center gap-4">
                            Enter System
                            <ArrowRight className="h-5 w-5" />
                        </span>
                        {/* Hover scanline effect for button */}
                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                    </Link>
                </div>
            </main>

            {/* Decorative Corner Ornaments */}
            <div className="fixed top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-primary/20 m-4 pointer-events-none"></div>
            <div className="fixed top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-primary/20 m-4 pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-primary/20 m-4 pointer-events-none"></div>
            <div className="fixed bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-primary/20 m-4 pointer-events-none"></div>

            {/* Visual Accents */}
            <div className="fixed top-1/2 -left-4 w-8 h-32 bg-primary/5 blur-xl pointer-events-none"></div>
            <div className="fixed top-1/2 -right-4 w-8 h-32 bg-primary/5 blur-xl pointer-events-none"></div>
        </div>
    );
}
