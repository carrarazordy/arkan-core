import { createClient } from '@/lib/supabase/client';

export const supabase = createClient();

export const COLLECTIONS = {
    TASKS: 'tasks',
    PROJECTS: 'projects',
    NOTES: 'notes',
    EVENTS: 'events'
};

