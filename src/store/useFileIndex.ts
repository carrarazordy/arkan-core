import { create } from 'zustand';

interface FileNode {
    id: string;
    name: string;
    path: string;
    type: 'file' | 'folder';
    parentId: string | null;
    children?: string[]; // IDs of children
}

interface FileIndexState {
    nodes: Record<string, FileNode>;
    rootIds: string[];
    isLoading: boolean;

    initializeIndex: (files: any[]) => void;
    getPathMap: () => Record<string, string>;
}

export const useFileIndex = create<FileIndexState>((set, get) => ({
    nodes: {},
    rootIds: [],
    isLoading: false,

    initializeIndex: (files) => {
        set({ isLoading: true });
        const nodes: Record<string, FileNode> = {};
        const rootIds: string[] = [];

        files.forEach(file => {
            const parts = file.path.split('/').filter(Boolean);
            let currentPath = '';
            let prevParentId: string | null = null;

            parts.forEach((part: string, index: number) => {
                currentPath += `/${part}`;
                const isLast = index === parts.length - 1;
                const nodeId = btoa(currentPath); // Consistent ID for path

                if (!nodes[nodeId]) {
                    nodes[nodeId] = {
                        id: nodeId,
                        name: part,
                        path: currentPath,
                        type: (isLast && file.type === 'file') ? 'file' : 'folder',
                        parentId: prevParentId,
                        children: []
                    };

                    if (prevParentId) {
                        nodes[prevParentId].children?.push(nodeId);
                    } else {
                        if (!rootIds.includes(nodeId)) rootIds.push(nodeId);
                    }
                }
                prevParentId = nodeId;
            });
        });

        set({ nodes, rootIds, isLoading: false });
    },

    getPathMap: () => {
        const { nodes } = get();
        const map: Record<string, string> = {};
        Object.values(nodes).forEach(node => {
            map[node.path] = node.id;
        });
        return map;
    }
}));
