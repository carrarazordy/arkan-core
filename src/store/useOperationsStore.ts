import { create } from 'zustand';

export type OperationStep = 'INITIALIZE' | 'ENTROPY' | 'PROTOCOL';

interface OperationsState {
    isOpen: boolean;
    step: OperationStep;
    directive: string;
    parsedName: string;
    parsedPriority: string;
    openOperations: () => void;
    closeOperations: () => void;
    setStep: (step: OperationStep) => void;
    setDirective: (val: string) => void;
    setParsedData: (name: string, priority: string) => void;
}

export const useOperationsStore = create<OperationsState>((set) => ({
    isOpen: false,
    step: 'INITIALIZE',
    directive: '',
    parsedName: '',
    parsedPriority: 'MED_02',

    openOperations: () => set({
        isOpen: true,
        step: 'INITIALIZE',
        directive: '',
        parsedName: '',
        parsedPriority: 'MED_02'
    }),

    closeOperations: () => set({ isOpen: false }),

    setStep: (step) => set({ step }),

    setDirective: (directive) => set({ directive }),

    setParsedData: (parsedName, parsedPriority) => set({ parsedName, parsedPriority })
}));
