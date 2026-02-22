"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhaseTerminal } from "./PhaseTerminal";
import { PhaseIdentity } from "./PhaseIdentity";
import { PhaseCalibration } from "./PhaseCalibration";
import { ScanlineWipe } from "./ScanlineWipe";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";

export type OnboardingStage = 'INITIALIZATION' | 'IDENTITY' | 'CALIBRATION' | 'COMPLETED';

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
    const [stage, setStage] = useState<OnboardingStage>('INITIALIZATION');
    const [isWiping, setIsWiping] = useState(false);

    useEffect(() => {
        // Start ambient hum - simulate high-tension background
        // In a real scenario, we'd have an ambient loop
        ArkanAudio.playFast('ai_pulse_low');

        return () => {
            // Stop hum on complete
        };
    }, []);

    const transitionTo = (nextStage: OnboardingStage) => {
        setIsWiping(true);
        setTimeout(() => {
            setStage(nextStage);
            if (nextStage === 'COMPLETED') {
                onComplete();
            }
        }, 500); // Wait for scanline peak

        setTimeout(() => {
            setIsWiping(false);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-[#030303] overflow-hidden flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
                {stage === 'INITIALIZATION' && (
                    <PhaseTerminal key="init" onComplete={() => transitionTo('IDENTITY')} />
                )}
                {stage === 'IDENTITY' && (
                    <PhaseIdentity key="identity" onComplete={() => transitionTo('CALIBRATION')} />
                )}
                {stage === 'CALIBRATION' && (
                    <PhaseCalibration key="calibration" onComplete={() => transitionTo('COMPLETED')} />
                )}
            </AnimatePresence>

            <ScanlineWipe active={isWiping} />

            {/* Ambient Background Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
                <div className="absolute inset-0 bg-primary/10 animate-pulse"></div>
            </div>
        </div>
    );
}
