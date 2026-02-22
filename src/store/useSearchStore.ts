import { create } from 'zustand';
import { ArkanAudio } from '@/lib/audio/ArkanAudio';

export interface SearchResult {
    id: string;
    title: string;
    type: 'TASK' | 'NOTE' | 'PROJECT' | 'EVENT' | 'COMMAND';
    description?: string;
    score: number;
    action?: string;
}

interface SearchState {
    query: string;
    results: SearchResult[];
    isOpen: boolean;
    isSearching: boolean;

    setQuery: (query: string) => void;
    toggleSearch: (open?: boolean) => void;
    executeSearch: (input: string) => void;
    clearResults: () => void;
}

// Pseudo-fuzzy matching (Levenshtein Distance < 2)
const getLevenshteinDistance = (a: string, b: string): number => {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }
    return matrix[a.length][b.length];
};

export const useSearchStore = create<SearchState>((set, get) => ({
    query: '',
    results: [],
    isOpen: false,
    isSearching: false,

    setQuery: (query) => set({ query }),
    toggleSearch: (open) => set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),

    executeSearch: async (rawInput) => {
        const query = rawInput.trim().toLowerCase();
        if (!query) {
            set({ results: [], isSearching: false });
            return;
        }

        set({ isSearching: true });

        // Mock data for search simulation (In a real app, this would be a local cache of titles/IDs)
        const mockNodes: (SearchResult & { archived?: boolean })[] = [
            { id: '1', title: 'OP_SYNC_ALPHA', type: 'EVENT', description: 'CRITICAL_TEMPORAL_SEQUENCE', score: 0 },
            { id: '2', title: 'DAILY_RECON', type: 'EVENT', description: 'ROUTINE_SECURITY_SCAN', score: 0 },
            { id: '3', title: 'Neural Archive: Core Design', type: 'NOTE', description: 'ARCHITECTURAL_MANIFEST', score: 0 },
            { id: '4', title: 'Fix Appwrite Sync Bug', type: 'TASK', description: 'SYSTEM_MAINTENANCE', score: 0 },
            { id: '5', title: 'PROJECT: ARKAN_CORE', type: 'PROJECT', description: 'PRIMARY_SYSTEM_GOAL', score: 0 },
            { id: '6', title: '[ARCHIVED] Legacy Neural Node', type: 'NOTE', description: 'RESTORE_TO_ACTIVE_REQUIRED', score: 0, archived: true },
            { id: '7', title: '[ARCHIVED] Alpha Logistics Record', type: 'TASK', description: 'PAST_OPERATIONAL_DATA', score: 0, archived: true },
            { id: 'CMD_THEME_PINK', title: '> theme pink', type: 'COMMAND', action: 'SET_THEME_PINK', description: 'SWITCH_TO_MAGENTA_ACCENT', score: 0 },
            { id: 'CMD_THEME_CYAN', title: '> theme cyan', type: 'COMMAND', action: 'SET_THEME_CYAN', description: 'SWITCH_TO_CYAN_ACCENT', score: 0 },
            { id: 'CMD_LOGOUT', title: '> logout', type: 'COMMAND', action: 'SYSTEM_SHUTDOWN', description: 'TERMINATE_SESSION', score: 0 },
            { id: 'CMD_SYNC', title: '> sync', type: 'COMMAND', action: 'FORCE_HANDSHAKE', description: 'MANUAL_DB_SYNCHRONIZATION', score: 0 },
            { id: 'CMD_BACKUP', title: '> backup', type: 'COMMAND', action: 'INIT_JSON_EXPORT', description: 'CLOUD_DATA_BACKUP', score: 0 },
        ];

        let scope = ['TASK', 'NOTE', 'PROJECT', 'EVENT', 'COMMAND'];
        let searchQuery = query;

        if (query.startsWith('/')) {
            const parts = query.split(' ');
            const prefix = parts[0];
            searchQuery = parts.slice(1).join(' ');

            if (prefix === '/t') scope = ['TASK'];
            else if (prefix === '/n') scope = ['NOTE'];
            else if (prefix === '/p') scope = ['PROJECT'];
        } else if (query.startsWith('>')) {
            scope = ['COMMAND'];
        }

        // Stage 2 & 3: Fuzzy Matching & Relevance Scoring
        const scoredResults = mockNodes
            .filter(node => scope.includes(node.type))
            .map(node => {
                let score = 0;
                const nodeTitle = node.title.toLowerCase();

                // Exact Match
                if (nodeTitle === searchQuery) score += 100;
                // Includes Match
                else if (nodeTitle.includes(searchQuery)) score += 50;
                // Fuzzy Match (Distance < 2)
                else if (searchQuery.length > 2 && getLevenshteinDistance(searchQuery, nodeTitle.substring(0, searchQuery.length)) < 2) score += 20;

                // Penalty for archived items (Arrives later in list)
                if (node.archived) score -= 30;

                return { ...node, score };
            })
            .filter(node => node.score > -30 || (query.startsWith('>') && node.type === 'COMMAND'))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        set({ results: scoredResults, isSearching: false });
    },

    clearResults: () => set({ results: [], query: '', isOpen: false }),
}));
