"use client";

import { motion, AnimatePresence } from "framer-motion";

export function ScanlineWipe({ active }: { active: boolean }) {
    return (
        <AnimatePresence>
            {active && (
                <div className="fixed inset-0 z-[300] pointer-events-none overflow-hidden">
                    {/* The Scanline */}
                    <motion.div
                        initial={{ y: "-100%" }}
                        animate={{ y: "100%" }}
                        exit={{ y: "200%" }}
                        transition={{ duration: 1.2, ease: "linear" }}
                        className="absolute left-0 w-full h-1 bg-primary shadow-[0_0_20px_#f9f906,0_0_40px_#f9f906]"
                    />

                    {/* The Fade Reveal */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.2, times: [0, 0.5, 1] }}
                        className="absolute inset-0 bg-primary/5"
                    />
                </div>
            )}
        </AnimatePresence>
    );
}
