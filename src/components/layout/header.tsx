"use client";

import { Search, LogOut } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";
import { useIdentityStore } from "@/store/useIdentityStore";
import { useRouter } from "next/navigation";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
    const { query, setQuery, toggleSearch } = useSearchStore();
    const { terminateSession } = useIdentityStore();
    const router = useRouter();

    const handleLogout = async () => {
        if (confirm("CONFIRM_SYSTEM_EXIT?")) {
            await terminateSession('current');
            router.push('/login');
        }
    };

    return (
        <header className="h-16 border-b border-primary/10 flex items-center justify-between px-8 bg-[#1a1a0f]/30 backdrop-blur-md z-30">
            <div className="flex items-center gap-6">
                <button onClick={onMenuClick} className="lg:hidden text-primary">
                    <span className="sr-only">Menu</span>
                    ☰
                </button>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#ffff00]"></span>
                    <span className="text-xs font-bold tracking-[0.2em] text-primary neon-text">SYSTEM STATUS: OPTIMAL</span>
                </div>
                <div className="hidden md:block h-4 w-[1px] bg-white/10"></div>
                <div className="hidden md:flex gap-4 text-[10px] font-mono text-slate-500">
                    <span>CPU: 14%</span>
                    <span>MEM: 4.2GB</span>
                    <span>NET: 420MB/S</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden sm:flex items-center">
                    <Search className="absolute left-3 text-slate-400 h-4 w-4" />
                    <input
                        className="bg-background border border-primary/20 rounded text-[10px] pl-9 pr-12 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all w-64 text-primary tracking-widest placeholder:text-slate-600"
                        placeholder="CMD+K TO SEARCH"
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onClick={() => toggleSearch(true)}
                    />
                    <span className="absolute right-3 text-[10px] bg-primary/10 text-primary/60 px-1 rounded border border-primary/20">⌘K</span>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded transition-colors group"
                >
                    <div className="w-5 h-5 overflow-hidden rounded-full border border-primary/30 bg-gray-800 flex items-center justify-center">
                        <LogOut className="h-3 w-3 text-primary/60 group-hover:text-primary" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 group-hover:text-primary">ARKAN_USER</span>
                </button>
            </div>
        </header>
    );
}
