import { useEffect, useState } from 'react';
import { useTaskStore } from './useTaskStore';
import { Task, Status } from '@/lib/types';

export function usePriorityEscalation() {
    const { tasks } = useTaskStore();
    const [escalatedTaskIds, setEscalatedTaskIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const checkEscalation = () => {
            const now = Date.now();
            const escalated = new Set<string>();

            tasks.forEach(task => {
                const lastUpdate = task.updatedAt ? task.updatedAt.getTime() : (task.createdAt ? task.createdAt.getTime() : 0);
                const timeDiff = now - lastUpdate;

                // 24h = 86400000ms
                if (task.priority === 'high' && timeDiff > 86400000 && task.status !== 'completed') {
                    escalated.add(task.id);
                }

                // (Logic for stalled removed as status is deprecated)
                if (task.status === 'in-progress' && timeDiff > 14400000) {
                    // escalated.add(task.id); // Optional: escalate long running in-progress?
                    // For now just keep high priority check.
                }
            });

            setEscalatedTaskIds(escalated);
        };

        checkEscalation();
        const interval = setInterval(checkEscalation, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [tasks]);

    return { escalatedTaskIds };
}
