/**
 * ChatView – Main chat area showing conversation messages
 * 
 * Features:
 *  • Shows all messages in the conversation
 *  • User messages on right, assistant messages on left
 *  • Auto-scroll to latest message
 *  • Back button to return to voice screen
 *  • Shifts right when sidebar is open
 */

import { memo, useEffect, useRef } from "react";
import { MicIcon } from "../UI/icons";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface ChatViewProps {
    messages: Message[];
    isVisible: boolean;
    isSidebarOpen: boolean;
    onClose: () => void;
}

// Back Arrow Icon
const BackIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

export const ChatView = memo(function ChatView({ messages, isVisible, isSidebarOpen, onClose }: ChatViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);

    if (!isVisible) return null;

    return (
        <div
            className={`
                fixed top-12 right-0 bottom-0 z-35 flex flex-col bg-surface-50 dark:bg-surface-950
                transition-all duration-300
                ${isSidebarOpen ? "md:left-64 left-0" : "left-0"}
            `}
        >
            {/* Compact Header with back button */}
            <div className="flex items-center h-10 px-3 border-b border-black/5 dark:border-white/10 bg-white/80 dark:bg-surface-900/60 backdrop-blur-sm">
                <button
                    type="button"
                    onClick={onClose}
                    className="
                        flex items-center gap-1.5 px-3 py-1.5 rounded-md
                        text-surface-600 hover:text-surface-900 hover:bg-black/5
                        dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10
                        transition-colors text-sm font-medium
                    "
                >
                    <BackIcon size={16} />
                    <span>Back</span>
                </button>
                <span className="flex-1 text-center text-sm font-medium text-surface-500 dark:text-white/70">Chat</span>
                <div className="w-16" /> {/* Spacer */}
            </div>

            {/* Messages container */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto px-4 py-4"
            >
                <div className="max-w-3xl mx-auto space-y-3">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <img src="/logo/favicon-96x96.png" alt="EchoAI" className="w-16 h-16 mb-4" />
                            <p className="text-surface-500 dark:text-white/50 text-base">
                                No messages yet
                            </p>
                            <p className="text-surface-400 dark:text-white/30 text-sm mt-1">
                                Start a conversation with EchoAI
                            </p>
                            <button
                                type="button"
                                onClick={onClose}
                                className="
                                    mt-6 px-6 py-2 rounded-full
                                    bg-accent text-white font-medium text-sm
                                    hover:bg-accent/90
                                    transition-colors
                                "
                            >
                                ← Back to Voice
                            </button>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`
                                        max-w-[80%] px-3 py-2 rounded-xl text-sm shadow-sm
                                        ${message.role === "user"
                                            ? "bg-accent text-white rounded-br-sm"
                                            : "bg-white border border-black/5 text-surface-900 rounded-bl-sm dark:bg-white/10 dark:text-white/90 dark:border-none"
                                        }
                                    `}
                                >
                                    {message.role === "assistant" && (
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <img
                                                src="/logo/favicon-96x96.png"
                                                alt="EchoAI"
                                                className="w-4 h-4 rounded-full object-cover"
                                            />
                                            <span className="text-xs text-surface-400 dark:text-white/40">EchoAI</span>
                                        </div>
                                    )}
                                    <p className="leading-relaxed whitespace-pre-wrap">
                                        {message.content}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Floating Home/Mic Button - Bottom Center */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
                <button
                    type="button"
                    onClick={onClose}
                    className="
                        flex items-center justify-center
                        w-14 h-14 rounded-full
                        bg-surface-900 text-white shadow-lg shadow-black/20
                        hover:scale-105 active:scale-95
                        dark:bg-white dark:text-surface-900
                        transition-all duration-200
                    "
                    title="Return to Voice Mode"
                >
                    <MicIcon size={24} />
                </button>
            </div>
        </div >
    );
});
