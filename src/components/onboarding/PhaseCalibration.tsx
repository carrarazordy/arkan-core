"use client";

import { motion } from "framer-motion";
import { LayoutGrid, Brain, Timer, Bolt } from "lucide-react";

export function PhaseCalibration({ onComplete }: { onComplete: () => void }) {
    const markers = [
        {
            id: 'ops',
            label: 'OPERATIONS_HUB',
            icon: LayoutGrid,
            pos: 'top-[35%] left-[25%]',
            desc: 'TASK_MANAGEMENT & KANBAN INTERFACE. DEPLOY PROTOCOLS.'
        },
        {
            id: 'archive',
            label: 'NEURAL_ARCHIVE',
            icon: Brain,
            pos: 'top-[35%] left-[50%] -translate-x-1/2',
            desc: 'INTELLIGENT REPOSITORY FOR NOTES, MEMORIES, AND INSIGHTS.'
        },
        {
            id: 'chronos',
            label: 'CHRONOS_CONTROL',
            icon: Timer,
            pos: 'top-[35%] right-[20%]',
            desc: 'PRECISION TIMING AND FOCUS CYCLES. OPTIMIZE TEMPORAL ALLOCATION.'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black backdrop-blur-md px-6"
        >
            <div className="absolute top-12 left-12 flex items-center gap-4">
                <div className="text-[10px] font-bold text-primary">PHASE_03: MODULE_CALIBRATION</div>
                <div className="flex gap-2">
                    <div className="h-1 w-8 bg-primary"></div>
                    <div className="h-1 w-8 bg-primary"></div>
                    <div className="h-1 w-12 bg-primary shadow-[0_0_10px_#ffff00]"></div>
                </div>
            </div>

            {markers.map((marker, i) => (
                <div key={marker.id} className={`absolute ${marker.pos} flex flex-col items-center gap-4`}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.5 }}
                        className="w-4 h-4 bg-primary rounded-full relative"
                    >
                        <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.5 + 0.3 }}
                        className="w-64 bg-[#1a1a0f] border border-primary p-4 shadow-[0_0_20px_#ffff0022] space-y-2"
                    >
                        <div className="flex items-center gap-2">
                            <marker.icon className="h-3 w-3 text-primary" />
                            <h4 className="text-[10px] font-bold text-primary tracking-widest uppercase">{marker.label}</h4>
                        </div>
                        <p className="text-[9px] text-primary/60 font-mono uppercase tracking-tighter leading-tight">{marker.desc}</p>
                    </motion.div>
                </div>
            ))}

            <div className="mt-[40vh] text-center space-y-8 max-w-xl">
                <div className="space-y-2">
                    <h2 className="text-4xl font-black text-primary tracking-[0.2em] uppercase italic">Module_Alignment</h2>
                    <p className="text-[10px] text-primary/40 font-mono tracking-[0.5em] uppercase">All core systems optimized. Ready for sync.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                >
                    <button
                        onClick={() => {
                            localStorage.setItem('sys_init', 'true');
                            onComplete();
                        }}
                        className="group relative px-16 py-5 bg-primary/10 border border-primary text-primary font-black uppercase tracking-[0.4em] text-sm overflow-hidden transition-all hover:bg-primary hover:text-black"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            <Bolt className="h-5 w-5 group-hover:animate-pulse" />
                            Enter_System
                        </span>
                        <div className="absolute top-0 left-0 w-2 h-[1px] bg-primary"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-[1px] bg-primary"></div>
                    </button>
                </motion.div>
            </div>

            <div className="fixed top-0 right-0 p-12 opacity-5 select-none pointer-events-none">
                <div className="text-[200px] font-black text-primary">ARKAN</div>
            </div>
        </motion.div>
    );
}
