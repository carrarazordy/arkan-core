"use client";

import { useState, useRef, useEffect } from "react";
import {
    Folder,
    ChevronRight,
    ChevronDown,
    FileText,
    MoreVertical,
    Plus,
    Trash,
    Edit3,
    FolderPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ArkanAudio } from "@/lib/audio/ArkanAudio";
import { useDialogStore } from "@/store/useDialogStore";

// Types for the File System
export type FileSystemNode = {
    id: string;
    type: 'folder' | 'note';
    name: string;
    children?: FileSystemNode[];
    parentId?: string;
    tags?: string[];
};

interface FileSystemProps {
    data: FileSystemNode[];
    activeNoteId: string | null;
    onSelectNote: (id: string) => void;
    onToggleFolder?: (folderId: string) => void;
    onCreateSubfolder?: (parentId: string) => void;
    onRename?: (id: string, currentName: string) => void;
    onDelete?: (id: string, type: 'folder' | 'note') => void;
}

const ContextMenu = ({
    node,
    onClose,
    onCreateSubfolder,
    onRename,
    onDelete
}: {
    node: FileSystemNode;
    onClose: () => void;
    onCreateSubfolder?: (parentId: string) => void;
    onRename?: (id: string, currentName: string) => void;
    onDelete?: (id: string, type: 'folder' | 'note') => void;
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="absolute right-0 top-6 z-50 w-32 bg-black border border-primary/20 shadow-neon flex flex-col p-1 animate-in fade-in zoom-in-95 duration-100"
        >
            {node.type === 'folder' && (
                <button
                    onClick={(e) => { e.stopPropagation(); onCreateSubfolder?.(node.id); onClose(); }}
                    className="flex items-center gap-2 px-2 py-1.5 text-[9px] text-primary/80 hover:bg-primary/20 hover:text-primary text-left uppercase tracking-wider transition-colors"
                >
                    <FolderPlus className="h-3 w-3" />
                    New_Sub
                </button>
            )}
            <button
                onClick={(e) => { e.stopPropagation(); onRename?.(node.id, node.name); onClose(); }}
                className="flex items-center gap-2 px-2 py-1.5 text-[9px] text-primary/80 hover:bg-primary/20 hover:text-primary text-left uppercase tracking-wider transition-colors"
            >
                <Edit3 className="h-3 w-3" />
                Rename
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(node.id, node.type); onClose(); }}
                className="flex items-center gap-2 px-2 py-1.5 text-[9px] text-red-400 hover:bg-red-500/20 hover:text-red-500 text-left uppercase tracking-wider transition-colors border-t border-primary/10 mt-1 pt-1.5"
            >
                <Trash className="h-3 w-3" />
                Delete
            </button>
        </div>
    );
};

const FileSystemNodeItem = ({
    node,
    level,
    activeNoteId,
    expandedFolders,
    onSelectNote,
    onToggleFolder,
    onCreateSubfolder,
    onRename,
    onDelete
}: {
    node: FileSystemNode;
    level: number;
    activeNoteId: string | null;
    expandedFolders: Set<string>;
    onSelectNote: (id: string) => void;
    onToggleFolder: (id: string) => void;
    onCreateSubfolder?: (parentId: string) => void;
    onRename?: (id: string, currentName: string) => void;
    onDelete?: (id: string, type: 'folder' | 'note') => void;
}) => {
    const isExpanded = expandedFolders.has(node.id);
    const [showMenu, setShowMenu] = useState(false);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (node.type === 'folder') {
            onToggleFolder(node.id);
            ArkanAudio.playFast(isExpanded ? 'clack' : 'shimmer');
        } else {
            onSelectNote(node.id);
            ArkanAudio.playFast('tick_low');
        }
    };

    const handleMenuToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
        ArkanAudio.playFast('ui_hover');
    };

    return (
        <div>
            <div
                onClick={handleToggle}
                className={cn(
                    "relative flex items-center gap-2 py-1.5 px-2 hover:bg-white/5 cursor-pointer rounded-sm transition-all group select-none pr-8",
                    activeNoteId === node.id && node.type === 'note' ? "bg-primary/10 text-primary border-r-2 border-primary" : "text-white/60",
                    node.type === 'folder' && isExpanded ? "text-primary/80" : ""
                )}
                style={{ paddingLeft: `${level * 12 + 12}px` }}
            >
                {node.type === 'folder' && (
                    <span className="opacity-50 group-hover:opacity-100 transition-opacity">
                        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </span>
                )}

                {node.type === 'folder' ? (
                    <Folder className={cn("h-3 w-3", isExpanded ? "text-primary" : "text-white/40")} />
                ) : (
                    <FileText className="h-3 w-3 text-white/40" />
                )}

                <span className={cn(
                    "text-[11px] font-mono tracking-tight uppercase truncate flex-1 transition-all",
                    activeNoteId === node.id && "font-bold text-shadow-neon"
                )}>
                    {node.name}
                </span>

                {node.type === 'note' && activeNoteId === node.id && (
                    <div className="flex items-center gap-2">
                        <span className="text-[7px] text-primary/50 animate-pulse">EDITING</span>
                    </div>
                )}

                {/* Context Menu Trigger */}
                <div className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleMenuToggle}
                        className="p-1 hover:bg-primary/20 hover:text-primary rounded"
                    >
                        <MoreVertical className="h-3 w-3" />
                    </button>
                    {showMenu && (
                        <ContextMenu
                            node={node}
                            onClose={() => setShowMenu(false)}
                            onCreateSubfolder={onCreateSubfolder}
                            onRename={onRename}
                            onDelete={onDelete}
                        />
                    )}
                </div>
            </div>

            {node.type === 'folder' && isExpanded && node.children && (
                <div className="border-l border-white/5 ml-[calc(1rem+3px)]">
                    {node.children.length > 0 ? (
                        node.children.map(child => (
                            <FileSystemNodeItem
                                key={child.id}
                                node={child}
                                level={0}
                                activeNoteId={activeNoteId}
                                expandedFolders={expandedFolders}
                                onSelectNote={onSelectNote}
                                onToggleFolder={onToggleFolder}
                                onCreateSubfolder={onCreateSubfolder}
                                onRename={onRename}
                                onDelete={onDelete}
                            />
                        ))
                    ) : (
                        <div className="pl-6 py-1 text-[9px] text-white/20 italic font-mono flex items-center gap-2">
                            <span>[EMPTY_SECTOR]</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const FileSystem = ({
    data,
    activeNoteId,
    onSelectNote,
    onCreateSubfolder,
    onRename,
    onDelete
}: FileSystemProps) => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root-projects', 'root-archive']));

    const handleToggleFolder = (id: string) => {
        const next = new Set(expandedFolders);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedFolders(next);
    };

    return (
        <div className="flex flex-col select-none pb-10">
            {data.map(node => (
                <FileSystemNodeItem
                    key={node.id}
                    node={node}
                    level={0}
                    activeNoteId={activeNoteId}
                    expandedFolders={expandedFolders}
                    onSelectNote={onSelectNote}
                    onToggleFolder={handleToggleFolder}
                    onCreateSubfolder={onCreateSubfolder}
                    onRename={onRename}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
