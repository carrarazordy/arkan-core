"use client";

import { useEffect, useCallback } from "react";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";
import { usePathname } from "next/navigation";

export function AudioInitializer() {
    const pathname = usePathname();

    const handleInteraction = useCallback(() => {
        // Initialize AudioContext on first user interaction
        ArkanAudio.playFast('key_tick'); // Dummy sound to wake up engine
        window.removeEventListener('click', handleInteraction);
    }, []);

    useEffect(() => {
        // Add listeners for interaction
        window.addEventListener('click', handleInteraction);

        // Global hover sounds for interactive elements
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('button, a, [role="button"], input, textarea, .interactive')) {
                ArkanAudio.playHover();
            }
        };

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('button, a, [role="button"], .interactive')) {
                ArkanAudio.playClick();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                ArkanAudio.typing(e);
            }
        };

        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('click', handleInteraction);
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('click', handleClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleInteraction]);

    // Play route change sound
    useEffect(() => {
        if (pathname !== '/login') {
            ArkanAudio.playFast('shimmer');
        }
    }, [pathname]);

    return null;
}
