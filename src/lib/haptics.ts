"use client";

export const ArkanHaptics = {
    vibrate(pattern: 'light' | 'medium' | 'success' | 'warning') {
        if (typeof navigator === 'undefined' || !navigator.vibrate) return;

        switch (pattern) {
            case 'light':
                navigator.vibrate(10);
                break;
            case 'medium':
                navigator.vibrate(20);
                break;
            case 'success':
                navigator.vibrate([20, 10, 20]);
                break;
            case 'warning':
                navigator.vibrate([50, 20, 50]);
                break;
        }
    }
};
