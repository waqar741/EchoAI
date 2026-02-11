/**
 * Sidebar – Left panel for chat history (ChatGPT/LM Studio style)
 * 
 * Features:
 *  • App title at top
 *  • New chat button
 *  • Search conversations
 *  • Session list with context menu (Edit/Delete)
 *  • Chat view toggle button on each session
 *  • Rename dialog for editing session title
 */

import { memo, useState } from "react";
import { TrashIcon } from "../UI/icons";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
}

export interface ChatSession {
    id: string;
    title: string;
    timestamp: Date;
    preview: string;
    messages: ChatMessage[];
}

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    sessions: ChatSession[];
    activeSessionId: string | null;
    showChatView: boolean;
    onSelectSession: (id: string) => void;
    onNewSession: () => void;
    onDeleteSession: (id: string) => void;
    onRenameSession: (id: string, newTitle: string) => void;
    onToggleChatView: (sessionId: string) => void;
}

// Pencil/Edit Icon
const EditIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
);

// Search Icon
const SearchIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

// More/Dots Icon
const MoreIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="12" cy="19" r="1.5" />
    </svg>
);

// Chat Icon
const ChatIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

export const Sidebar = memo(function Sidebar({
    isOpen,
    onToggle,
    sessions,
    activeSessionId,
    showChatView: _showChatView,
    onSelectSession,
    onNewSession,
    onDeleteSession,
    onRenameSession,
    onToggleChatView,
}: SidebarProps) {
    const [contextMenu, setContextMenu] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");

    const filteredSessions = sessions.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleStartEdit = (session: ChatSession) => {
        setEditingId(session.id);
        setEditTitle(session.title);
        setContextMenu(null);
    };

    const handleSaveEdit = () => {
        if (editingId && editTitle.trim()) {
            onRenameSession(editingId, editTitle.trim());
        }
        setEditingId(null);
        setEditTitle("");
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
    };

    return (
        <>
            {/* Click outside to close context menu - rendered first so it's below sidebar */}
            {contextMenu && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => setContextMenu(null)}
                />
            )}

            {/* Backdrop - closes sidebar when clicking outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-35 bg-black/50 md:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar Panel */}
            <aside
                className={`
                    fixed top-0 left-0 z-50
                    h-full w-72 md:w-64
                    bg-surface-50 dark:bg-surface-950
                    border-r border-black/5 dark:border-white/5
                    flex flex-col
                    transform transition-transform duration-300 ease-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Header with title and close button */}
                <div className="flex items-center justify-between gap-2 px-4 py-4">
                    <div className="flex items-center gap-2">
                        <img src="/logo/favicon-96x96.png" alt="EchoAI" className="w-7 h-7" />
                        <span className="text-base font-semibold text-surface-900 dark:text-white">EchoAI</span>
                    </div>
                    {/* Close button - visible on mobile */}
                    <button
                        type="button"
                        onClick={onToggle}
                        className="md:hidden p-2 rounded-lg text-surface-500 hover:text-surface-900 hover:bg-black/5 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                        aria-label="Close sidebar"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* New Chat Button */}
                <div className="px-3 mb-2">
                    <button
                        type="button"
                        onClick={onNewSession}
                        className="
                            w-full flex items-center gap-2 px-3 py-2.5
                            rounded-lg
                            border border-black/10 dark:border-white/10
                            text-surface-700 hover:text-surface-900
                            hover:bg-black/5
                            dark:text-white/80 dark:hover:text-white
                            dark:hover:bg-white/5
                            transition-colors text-sm
                        "
                    >
                        <span className="text-lg leading-none">+</span>
                        <span>New chat</span>
                    </button>
                </div>

                {/* Search */}
                <div className="px-3 mb-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search conversations"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="
                                w-full pl-8 pr-3 py-2
                                bg-transparent
                                text-surface-900 text-sm
                                placeholder:text-surface-400
                                border-b border-black/10
                                focus:outline-none focus:border-black/20
                                dark:text-white/80
                                dark:placeholder:text-white/40
                                dark:border-white/10
                                dark:focus:border-white/20
                            "
                        />
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-surface-400 dark:text-white/40">
                            <SearchIcon size={14} />
                        </div>
                    </div>
                </div>

                {/* Conversations Label */}
                <div className="px-4 py-2">
                    <span className="text-xs text-surface-400 dark:text-white/40 uppercase tracking-wider">Conversations</span>
                </div>

                {/* Session List */}
                <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
                    {filteredSessions.length === 0 ? (
                        <div className="text-center py-8 px-4">
                            <p className="text-xs text-surface-400 dark:text-white/30">
                                {searchQuery ? "No matching conversations" : "No conversations yet"}
                            </p>
                        </div>
                    ) : (
                        filteredSessions.map((session) => (
                            <div
                                key={session.id}
                                className={`
                                    group relative
                                    flex items-center justify-between
                                    px-3 py-2.5 rounded-lg cursor-pointer
                                    transition-colors duration-150
                                    ${activeSessionId === session.id
                                        ? "bg-black/5 dark:bg-white/10"
                                        : "hover:bg-black/5 dark:hover:bg-white/5"
                                    }
                                `}
                                onClick={() => onSelectSession(session.id)}
                            >
                                {/* Session title - editable */}
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {editingId === session.id ? (
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleSaveEdit();
                                                if (e.key === "Escape") handleCancelEdit();
                                            }}
                                            onBlur={handleSaveEdit}
                                            onClick={(e) => e.stopPropagation()}
                                            autoFocus
                                            className="
                                                w-full px-2 py-1 text-sm
                                                bg-white border border-accent/50
                                                rounded text-surface-900
                                                focus:outline-none focus:border-accent
                                                dark:bg-white/10 dark:text-white
                                            "
                                        />
                                    ) : (
                                        <span className="text-sm text-surface-700 dark:text-white/80 truncate">{session.title}</span>
                                    )}
                                </div>

                                {/* Action buttons */}
                                {editingId !== session.id && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* Chat View button */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleChatView(session.id);
                                            }}
                                            className="
                                                p-1.5 rounded
                                                text-surface-400 hover:text-accent hover:bg-black/5
                                                dark:text-white/50 dark:hover:text-accent dark:hover:bg-white/10
                                                transition-all duration-150
                                            "
                                            title="View chat"
                                        >
                                            <ChatIcon size={14} />
                                        </button>

                                        {/* More button */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setContextMenu(contextMenu === session.id ? null : session.id);
                                            }}
                                            className="
                                                p-1.5 rounded
                                                text-surface-400 hover:text-surface-900 hover:bg-black/5
                                                dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10
                                                transition-all duration-150
                                            "
                                        >
                                            <MoreIcon size={14} />
                                        </button>
                                    </div>
                                )}

                                {/* Context Menu - Only Edit and Delete */}
                                {contextMenu === session.id && (
                                    <div
                                        className="
                                            absolute right-0 top-full z-[60] mt-1
                                            w-32 py-1
                                            bg-white dark:bg-surface-900 
                                            border border-black/10 dark:border-white/10
                                            rounded-lg shadow-xl
                                        "
                                    >
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleStartEdit(session);
                                            }}
                                            className="
                                                w-full flex items-center gap-2 px-3 py-2
                                                text-sm text-surface-700 hover:bg-black/5
                                                dark:text-white/80 dark:hover:bg-white/5
                                                transition-colors
                                            "
                                        >
                                            <EditIcon size={14} />
                                            Rename
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setContextMenu(null);
                                                onDeleteSession(session.id);
                                            }}
                                            className="
                                                w-full flex items-center gap-2 px-3 py-2
                                                text-sm text-red-500 hover:bg-black/5
                                                dark:text-red-400 dark:hover:bg-white/5
                                                transition-colors
                                            "
                                        >
                                            <TrashIcon size={14} />
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </aside>
        </>
    );
});
