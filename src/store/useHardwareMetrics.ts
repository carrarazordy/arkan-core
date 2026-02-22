import { create } from 'zustand';

interface HardwareMetrics {
    cpu: number;
    ram: number;
    latency: number;
    networkTx: number;
}

interface HardwareMetricsState {
    metrics: HardwareMetrics;
    updateMetrics: () => void;
}

export const useHardwareMetrics = create<HardwareMetricsState>((set) => ({
    metrics: {
        cpu: 12,
        ram: 4.2,
        latency: 14,
        networkTx: 2.1
    },
    updateMetrics: () => set((state) => {
        // Simple oscillation simulation
        const cpuBase = 10 + Math.random() * 5;
        const ramBase = 4.1 + Math.random() * 0.2;
        const latBase = 12 + Math.random() * 4;
        const netBase = 1.8 + Math.random() * 1.5;

        return {
            metrics: {
                cpu: Math.round(cpuBase),
                ram: parseFloat(ramBase.toFixed(1)),
                latency: Math.round(latBase),
                networkTx: parseFloat(netBase.toFixed(1))
            }
        };
    })
}));
