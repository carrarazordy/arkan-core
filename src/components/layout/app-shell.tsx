"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { HardwareHUD } from "./HardwareHUD";
import { OmniSearch } from "./OmniSearch";
import TacticalContextMenu from "./TacticalContextMenu";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { useTaskStore } from "@/store/useTaskStore";


import { supabase } from "@/lib/supabase";

import { SplashSequence } from "./SplashSequence";
import { OnboardingFlow } from "../onboarding/OnboardingFlow";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";

export function AppShell({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showSplash, setShowSplash] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const theme = useThemeStore((state) => state.theme);
    const { tasks } = useTaskStore();
    const inboxTasks = tasks.filter(t => t.projectId === 'inbox' && t.status !== 'completed');

    useEffect(() => {
        const isInit = localStorage.getItem('sys_init');
        if (isInit !== 'true') {
            setShowOnboarding(true);
        }
    }, []);

    // Auth Guard Logic removed - fully delegated to AuthGuard wrapper
    const [user, setUser] = useState<any>(null);

    // Sync user from Supabase for UI/Avatar state only
    useEffect(() => {
        const syncUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        syncUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);



    // Initial theme application
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    // GLOBAL CHRONOS TICKER & SYSTEM MONITOR
    useEffect(() => {
        const { useChronosStore } = require("@/store/useChronosStore");
        const { useSystemLogStore } = require("@/store/useSystemLogStore");

        // ticking mechanism
        const interval = setInterval(() => {
            useChronosStore.getState().tick();

            // Occasional system health log (every 60s approx)
            if (Math.random() > 0.98) {
                useSystemLogStore.getState().addLog("SYSTEM_HEARTBEAT_ACKNOWLEDGED", "system");
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Command & Sound Engine Initialization
    useEffect(() => {
        const { ArkanCommands } = require("@/lib/commands");

        const cleanup = ArkanCommands.init(router);

        const handleGlobalInteraction = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Expanded selectors for global binding
            if (target.closest('.arkan-button') || target.closest('button') || target.closest('a') || target.closest('input')) {
                ArkanAudio.playClick();
            }
        };

        const handleHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Exclude inputs from hover sounds to avoid noise
            if (target.closest('.arkan-button') || target.closest('button') || target.closest('a')) {
                ArkanAudio.playHover();
            }
        };

        const handleGlobalTyping = (e: KeyboardEvent) => {
            // Don't play if it's a shortcut (with Meta/Ctrl)
            if (e.metaKey || e.ctrlKey) return;
            ArkanAudio.typing(e);
        };

        window.addEventListener('click', handleGlobalInteraction);
        window.addEventListener('mouseover', handleHover);
        window.addEventListener('keydown', handleGlobalTyping);

        return () => {
            if (cleanup) cleanup();
            window.removeEventListener('click', handleGlobalInteraction);
            window.removeEventListener('mouseover', handleHover);
            window.removeEventListener('keydown', handleGlobalTyping);
        };
    }, [router]);

    // Check if we are on the landing page or auth pages
    const isPublicPage = ["/", "/login", "/signup"].includes(pathname);

    // Show loading state while checking auth for private routes


    // STRICT GUARD: If not loading, no user, and private page -> BLOCK RENDER


    if (isPublicPage && pathname === "/") {
        return (
            <div className="min-h-screen bg-background text-foreground">
                {children}
            </div>
        );
    }

    if ((pathname === "/login" || pathname === "/signup")) {
        return <div className="min-h-screen bg-background text-foreground">{children}</div>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-deep-black text-white font-mono gap-[10px] p-[10px]">
            {/* Global Tactical Grid V4 - Explicitly forcing pointer-events-none */}
            <div className="arkan-grid-overlay pointer-events-none" />

            {showOnboarding && <OnboardingFlow onComplete={() => setShowOnboarding(false)} />}

            {showSplash && pathname === '/dashboard' && !showOnboarding && (
                <SplashSequence onComplete={() => setShowSplash(false)} />
            )}

            {/* Sidebar - Desktop (Fixed) */}
            <div className="hidden lg:block w-[60px] shrink-0 border border-stable rounded-[4px] z-50 overflow-hidden">
                <Sidebar className="w-full h-full border-none bg-dark-panel backdrop-blur-xl" />
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden gap-[10px]">
                <div className="flex-1 flex flex-col min-w-0 bg-deep-black border border-stable rounded-[4px] relative overflow-hidden transition-all hover:border-primary">
                    {/* Hide Global Header on modules that have their own dedicated headers */}
                    {!['/tasks', '/kanban', '/shopping', '/timers', '/settings', '/notes', '/search', '/calendar', '/archive'].includes(pathname) && (
                        <Header onMenuClick={() => setIsSidebarOpen(true)} />
                    )}
                    <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a05] relative overflow-hidden">
                        {/* Ambient background effects */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 left-1/4 w-px h-full bg-primary/5"></div>
                            <div className="absolute top-0 left-3/4 w-px h-full bg-primary/5"></div>
                            <div className="absolute top-1/2 left-0 w-full h-px bg-primary/5"></div>
                        </div>

                        <header className="h-16 border-b border-primary/10 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md z-20">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#ffff00]"></div>
                                <span className="text-[10px] font-mono text-primary/60 tracking-[0.3em] uppercase">System_Status: Operational</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/10">
                                    <span className="text-[10px] font-mono text-slate-500 uppercase">Search</span>
                                    <span className="text-[10px] font-mono text-primary">CMD+K</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-primary">AL</span>
                                </div>
                            </div>
                        </header>

                        <div className="flex-1 overflow-hidden relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={pathname}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{
                                        duration: 0.3,
                                        ease: [0.2, 0, 0, 1]
                                    }}
                                    className={cn(
                                        "h-full w-full custom-scrollbar relative z-10 overflow-y-auto",
                                        !['/dashboard', '/notes'].includes(pathname) && "p-8"
                                    )}
                                >
                                    {children}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Persistent Hardware & Log Footer */}
                        <HardwareHUD />

                        {/* Global Overlays */}
                        <OmniSearch />
                        <TacticalContextMenu />
                    </main>
                </div>

                {/* Global Inbox - Right Sidebar (Desktop) */
                    /* Hidden on specific routes that have their own right-side panels */
                    !['/tasks', '/timers'].includes(pathname) && (
                        <aside className="hidden xl:flex w-[280px] flex-col border border-stable bg-dark-panel rounded-[4px] z-40 transition-all hover:border-primary">
                            <div className="p-6 border-b border-primary/10">
                                <h2 className="text-sm font-bold tracking-[0.2em] text-white flex items-center gap-2">
                                    {/* Icon placeholder - replace with Lucide equivalent if needed */}
                                    <span className="text-primary">📥</span>
                                    GLOBAL_INBOX
                                </h2>
                                <p className="text-[10px] text-slate-500 mt-1 uppercase">Pending unassigned subroutines</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {/* Real Inbox Items */}
                                {inboxTasks.length === 0 ? (
                                    <div className="text-[10px] text-slate-500 text-center py-4 italic">NO_PENDING_SUBROUTINES</div>
                                ) : (
                                    inboxTasks.slice(0, 10).map((task) => (
                                        <div
                                            key={task.id}
                                            onClick={() => ArkanAudio.play('ui_confirm_ping')}
                                            onMouseEnter={() => ArkanAudio.play('ui_hover_shimmer')}
                                            className="group bg-[#1a1a0f]/80 border-l-2 border-primary p-3 rounded-r-lg hover:bg-[#1a1a0f] transition-colors cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={cn(
                                                    "text-[9px] font-bold tracking-widest uppercase",
                                                    task.priority === 'critical' ? "text-red-500" :
                                                        task.priority === 'high' ? "text-orange-500" : "text-primary"
                                                )}>
                                                    PRIORITY_{task.priority}
                                                </span>
                                                <span className="text-[9px] text-slate-600 font-mono">
                                                    {new Date(task.updatedAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-white font-medium group-hover:text-primary transition-colors line-clamp-2">{task.title}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-4 bg-background/80 border-t border-primary/10">
                                <button
                                    onClick={() => router.push('/tasks')}
                                    className="w-full border border-white/10 hover:border-primary/40 hover:text-primary text-slate-500 text-[10px] font-bold py-2 rounded transition-all uppercase tracking-widest arkan-button"
                                >
                                    View All Archives
                                </button>
                            </div>
                        </aside>
                    )}
            </div>
        </div>
    );
}
