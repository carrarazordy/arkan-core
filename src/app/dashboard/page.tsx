"use client";

import { useIdentityStore } from "@/store/useIdentityStore";
import { LogOut } from "lucide-react";

export default function DashboardPlaceholder() {
    const { user, logout } = useIdentityStore();

    return (
        <div className="min-h-screen bg-black text-primary font-mono flex flex-col items-center justify-center p-8">
            <div className="absolute inset-0 pointer-events-none z-0 opacity-10"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(249, 249, 6, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(249, 249, 6, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />
            <div className="z-10 bg-[#0a0a05] border border-primary/20 p-12 rounded-lg text-center shadow-[0_0_30px_rgba(249,249,6,0.1)]">
                <h1 className="text-4xl font-bold uppercase tracking-widest glow-text mb-4">
                    Auth Verified
                </h1>
                <p className="text-sm tracking-widest text-primary/60 mb-8 border-b border-primary/20 pb-4">
                    Welcome to the Arkan Core Dashboard!
                </p>

                <div className="text-left space-y-4 text-xs tracking-wider mb-10">
                    <div className="flex gap-4">
                        <span className="text-primary/40 w-32 uppercase">Current User:</span>
                        <span className="text-white">{user?.email || "Unknown Identity"}</span>
                    </div>
                    <div className="flex gap-4">
                        <span className="text-primary/40 w-32 uppercase">Status:</span>
                        <span className="text-primary animate-pulse">SYSTEM ONLINE</span>
                    </div>
                    <div className="flex gap-4 pt-4 border-t border-primary/10">
                        <span className="text-primary/40 w-32 uppercase">Next Step:</span>
                        <span className="text-white/60">Module "Dashboard" requires full porting.</span>
                    </div>
                </div>

                <button
                    onClick={() => logout()}
                    className="bg-transparent border border-red-500 text-red-500 hover:bg-red-500 hover:text-black hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] px-6 py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    End Session
                </button>
            </div>
        </div>
    );
}
