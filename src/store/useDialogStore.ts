import { create } from 'zustand';

interface DialogOptions {
    title: string;
    placeholder?: string;
    initialValue?: string;
    confirmLabel?: string;
    hideInput?: boolean;
    onConfirm: (value: string) => void | Promise<void>;
    onCancel?: () => void;
}

interface DialogState {
    isOpen: boolean;
    options: DialogOptions | null;

    // Actions
    openDialog: (options: DialogOptions) => void;
    closeDialog: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
    isOpen: false,
    options: null,

    openDialog: (options) => set({ isOpen: true, options }),
    closeDialog: () => set({ isOpen: false, options: null })
}));
