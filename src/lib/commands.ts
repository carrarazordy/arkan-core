"use client";

import { ArkanAudio } from "./audio/ArkanAudio";

// Arkan Command Engine - Input Management
export const ArkanCommands = {
    init(router: any) {
        if (typeof window === 'undefined') return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const isCmd = e.metaKey || e.ctrlKey;

            if (isCmd) {
                switch (e.key.toLowerCase()) {
                    case 'k':
                        e.preventDefault();
                        this.execute('INITIALIZE_GLOBAL_SEARCH', router);
                        break;
                    case 'n':
                        e.preventDefault();
                        this.execute('CREATE_NEURAL_ENTRY', router);
                        break;
                    case 't':
                        e.preventDefault();
                        this.execute('NEW_TASK_INITIALIZATION', router);
                        break;
                    case 'p':
                        e.preventDefault();
                        this.execute('OPEN_PROJECT_DASHBOARD', router);
                        break;
                    case ',':
                        e.preventDefault();
                        this.execute('SYSTEM_CONFIG_OPEN', router);
                        break;
                }
            }

            if (e.key === 'Escape') {
                this.execute('ABORT_ACTIVE_MODULE', router);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    },

    execute(commandId: string, router: any) {
        console.log(`>> EXECUTING_COMMAND: ${commandId}`);

        // Audio Feedback
        ArkanAudio.play('ui_confirm_ping');

        // Navigation Logic
        switch (commandId) {
            case 'INITIALIZE_GLOBAL_SEARCH':
                router.push('/search');
                break;
            case 'CREATE_NEURAL_ENTRY':
                router.push('/notes');
                break;
            case 'NEW_TASK_INITIALIZATION':
                router.push('/tasks');
                break;
            case 'OPEN_PROJECT_DASHBOARD':
                router.push('/projects');
                break;
            case 'SYSTEM_CONFIG_OPEN':
                router.push('/settings');
                break;
            case 'ABORT_ACTIVE_MODULE':
                router.push('/');
                break;
        }
    }
};
