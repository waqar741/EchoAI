/**
 * App – Voice Avatar Interface
 *
 * Clean layout:
 *  • Centered circular avatar with glow ring
 *  • Audio waveform visualization below avatar
 *  • Mic button
 *  • Single message text with fade-out after 5 seconds
 */

import { useCallback, useEffect, useRef, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "./components/Avatar/Avatar";
import { MicButton } from "./components/Controls/MicButton";
import { Navbar } from "./components/Controls/Navbar";
import { Sidebar, ChatSession } from "./components/Controls/Sidebar";
import { AudioWaveform } from "./components/UI/AudioWaveform";
import { ChatView } from "./components/Chat/ChatView";
import { useVoiceInput } from "./hooks/useVoiceInput";
import { useSpeechSynthesis } from "./hooks/useSpeechSynthesis";
import { useChatAPI } from "./hooks/useChatAPI";
import { useChatStore } from "./store/chatStore";
import { useTheme } from "./hooks/useTheme";
import type { ChatMessage } from "./types";

const MemoAvatar = memo(Avatar);

export default function App() {
    const tts = useSpeechSynthesis();
    const api = useChatAPI();

    // Apply theme
    useTheme();

    const status = useChatStore((s) => s.status);
    const setStatus = useChatStore((s) => s.setStatus);
    const setInterimText = useChatStore((s) => s.setInterimText);
    const addMessage = useChatStore((s) => s.addMessage);
    const interimText = useChatStore((s) => s.interimText);
    const messages = useChatStore((s) => s.messages);

    const processingRef = useRef(false);

    // State for fade-out animation
    const [showText, setShowText] = useState(true);
    const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Chat view state
    const [showChatView, setShowChatView] = useState(false);

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sessions, setSessions] = useState<ChatSession[]>(() => {
        const saved = localStorage.getItem("voice-avatar-sessions");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const sessions = parsed.map((s: any) => ({
                    ...s,
                    timestamp: new Date(s.timestamp),
                    messages: s.messages || []
                }));
                if (sessions.length > 0) return sessions;
            } catch (e) {
                console.error("Error parsing sessions:", e);
            }
        }
        // Always create a default session if none exist
        const defaultSession: ChatSession = {
            id: Date.now().toString(),
            title: "New conversation",
            timestamp: new Date(),
            preview: "",
            messages: []
        };
        return [defaultSession];
    });
    const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
        const saved = localStorage.getItem("voice-avatar-sessions");
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.length > 0) return parsed[0].id;
        }
        return null;
    });

    // Hydrate chat store from active session on mount
    useEffect(() => {
        if (activeSessionId) {
            const session = sessions.find(s => s.id === activeSessionId);
            if (session && session.messages.length > 0) {
                // We need to populate the store with the saved messages
                // useChatStore is created outside, so we can access getState()
                useChatStore.getState().clearMessages();
                // We can't batch these easily with the current store API, but it's fine for init
                // Better approach: directly set messages if store allowed it, but addMessage is ok
                // Actually, let's use a small timeout to ensure store is ready if needed, 
                // though usually synchronous is fine. 
                // To avoid multiple re-renders, we could add a `setMessages` to store, 
                // but `addMessage` works.
                session.messages.forEach(msg => {
                    useChatStore.getState().addMessage(msg.role, msg.content);
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    /* ─── Get last message for display ─── */
    const lastMessage = messages.slice(-1)[0]?.content;

    /* ─── Fade out text after 5 seconds of silence ─── */
    useEffect(() => {
        // Clear existing timer
        if (fadeTimerRef.current) {
            clearTimeout(fadeTimerRef.current);
        }

        // Show text when there's activity
        if (status !== "ready" || interimText || lastMessage) {
            setShowText(true);
        }

        // Start fade timer when in ready state
        if (status === "ready" && !interimText) {
            fadeTimerRef.current = setTimeout(() => {
                setShowText(false);
            }, 5000);
        }

        return () => {
            if (fadeTimerRef.current) {
                clearTimeout(fadeTimerRef.current);
            }
        };
    }, [status, interimText, lastMessage]);

    /* ─── Process & send a finalized transcript to the LLM ─── */
    const processTranscript = useCallback(
        async (text: string) => {
            if (!text || processingRef.current) return;
            processingRef.current = true;

            setInterimText("");
            addMessage("user", text);
            setStatus("thinking");

            const latestMessages = useChatStore.getState().messages;
            const history: ChatMessage[] = latestMessages.slice(-6).map((m) => ({
                role: m.role,
                content: m.content,
            }));

            try {
                const reply = await api.sendMessage(text, history);
                if (!reply) {
                    processingRef.current = false;
                    return;
                }
                addMessage("assistant", reply);
                setStatus("speaking");
                await tts.speak(reply);
                setStatus("ready");
            } catch {
                if (useChatStore.getState().status !== "ready") {
                    setStatus("error");
                    addMessage("assistant", "Sorry, something went wrong. Please try again.");
                    setTimeout(() => setStatus("ready"), 2000);
                }
            } finally {
                processingRef.current = false;
            }
        },
        [api, tts, addMessage, setStatus, setInterimText],
    );

    /* ─── Voice input with auto-silence detection ─── */
    const voice = useVoiceInput({
        silenceMs: 1500,
        onSilenceDetected: processTranscript,
    });

    /* ─── Sync interim transcript into store ─── */
    useEffect(() => {
        setInterimText(voice.isListening ? voice.interimTranscript : "");
    }, [voice.interimTranscript, voice.isListening, setInterimText]);

    /* ─── Single button: Tap to Speak ─── */
    const handleMicToggle = useCallback(() => {
        if (voice.isListening) {
            const text = voice.stopListening();
            setInterimText("");
            if (text) {
                processTranscript(text);
            } else {
                setStatus("ready");
            }
        } else {
            tts.stop();
            api.abort();
            voice.startListening();
            setStatus("listening");
        }
    }, [voice, tts, api, setStatus, setInterimText, processTranscript]);

    /* ─── Cancel (during thinking/speaking) ─── */
    const handleCancel = useCallback(() => {
        api.abort();
        tts.stop();
        voice.stopListening();
        processingRef.current = false;
        setInterimText("");
        setStatus("ready");
    }, [api, tts, voice, setStatus, setInterimText]);

    /* ─── Session management ─── */
    const saveSessionsToStorage = useCallback((newSessions: ChatSession[]) => {
        localStorage.setItem("voice-avatar-sessions", JSON.stringify(newSessions));
    }, []);

    // Save current messages to the active session
    const saveCurrentMessagesToSession = useCallback(() => {
        if (!activeSessionId) return;
        const currentMessages = useChatStore.getState().messages;
        const updatedSessions = sessions.map(s =>
            s.id === activeSessionId
                ? {
                    ...s,
                    messages: currentMessages,
                    preview: currentMessages[currentMessages.length - 1]?.content.slice(0, 50) || "",
                    title: s.title === "New conversation" && currentMessages.length > 0
                        ? currentMessages[0].content.slice(0, 30)
                        : s.title
                }
                : s
        );
        setSessions(updatedSessions);
        saveSessionsToStorage(updatedSessions);
    }, [activeSessionId, sessions, saveSessionsToStorage]);

    // Sync messages to session when messages change
    useEffect(() => {
        if (activeSessionId && messages.length > 0) {
            const timeoutId = setTimeout(() => {
                saveCurrentMessagesToSession();
            }, 500); // Debounce to avoid too frequent saves
            return () => clearTimeout(timeoutId);
        }
    }, [messages, activeSessionId, saveCurrentMessagesToSession]);

    const handleNewSession = useCallback(() => {
        // Get current messages
        const currentMessages = useChatStore.getState().messages;

        // Only allow creating new chat if current session has at least one message
        if (currentMessages.length === 0) {
            // Current chat is empty, don't create a new one
            return;
        }

        // Save current session messages first
        saveCurrentMessagesToSession();

        // Create new session
        const newSession: ChatSession = {
            id: Date.now().toString(),
            title: "New conversation",
            timestamp: new Date(),
            preview: "",
            messages: []
        };
        const updatedSessions = [newSession, ...sessions];
        setSessions(updatedSessions);
        saveSessionsToStorage(updatedSessions);

        // Clear current chat and set new session as active
        useChatStore.getState().clearMessages();
        setActiveSessionId(newSession.id);
    }, [sessions, saveSessionsToStorage, saveCurrentMessagesToSession]);

    const handleSelectSession = useCallback((id: string) => {
        // Save current session first
        saveCurrentMessagesToSession();

        // Find the session and load its messages
        const session = sessions.find(s => s.id === id);
        if (session) {
            useChatStore.getState().clearMessages();
            session.messages.forEach(msg => {
                useChatStore.getState().addMessage(msg.role, msg.content);
            });
        }
        setActiveSessionId(id);
    }, [sessions, saveCurrentMessagesToSession]);

    const handleDeleteSession = useCallback((id: string) => {
        const updatedSessions = sessions.filter(s => s.id !== id);

        // Ensure at least one session exists
        if (updatedSessions.length === 0) {
            const newSession: ChatSession = {
                id: Date.now().toString(),
                title: "New conversation",
                timestamp: new Date(),
                preview: "",
                messages: []
            };
            setSessions([newSession]);
            saveSessionsToStorage([newSession]);
            useChatStore.getState().clearMessages();
            setActiveSessionId(newSession.id);
        } else {
            setSessions(updatedSessions);
            saveSessionsToStorage(updatedSessions);
            if (activeSessionId === id) {
                // Switch to first available session
                const nextSession = updatedSessions[0];
                useChatStore.getState().clearMessages();
                nextSession.messages.forEach(msg => {
                    useChatStore.getState().addMessage(msg.role, msg.content);
                });
                setActiveSessionId(nextSession.id);
            }
        }
    }, [sessions, activeSessionId, saveSessionsToStorage]);

    const handleRenameSession = useCallback((id: string, newTitle: string) => {
        const updatedSessions = sessions.map(s =>
            s.id === id ? { ...s, title: newTitle } : s
        );
        setSessions(updatedSessions);
        saveSessionsToStorage(updatedSessions);
    }, [sessions, saveSessionsToStorage]);

    const handleToggleChatView = useCallback((sessionId: string) => {
        // If clicking same session while chat is open, close it
        if (showChatView && activeSessionId === sessionId) {
            setShowChatView(false);
        } else {
            // Load session messages if switching to different session
            if (activeSessionId !== sessionId) {
                saveCurrentMessagesToSession();
                const session = sessions.find(s => s.id === sessionId);
                if (session) {
                    useChatStore.getState().clearMessages();
                    session.messages.forEach(msg => {
                        useChatStore.getState().addMessage(msg.role, msg.content);
                    });
                }
            }
            setActiveSessionId(sessionId);
            setShowChatView(true);
        }
    }, [showChatView, activeSessionId, sessions, saveCurrentMessagesToSession]);

    /* ─── Keyboard shortcuts ─── */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                e.target instanceof HTMLSelectElement
            )
                return;

            if (e.code === "Escape") {
                e.preventDefault();
                handleCancel();
                return;
            }

            if (e.code === "Space" && status !== "thinking" && status !== "speaking") {
                e.preventDefault();
                handleMicToggle();
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [status, handleMicToggle, handleCancel]);

    /* ─── Get display text ─── */
    const getDisplayText = () => {
        if (status === "listening" && interimText) {
            return interimText;
        }
        if (status === "listening") {
            return "Listening...";
        }
        if (status === "thinking") {
            return "Thinking...";
        }
        if (lastMessage) {
            return lastMessage;
        }
        return "I'm listening, how can I help?";
    };

    const isActive = status !== "ready";

    return (
        <div
            className="relative min-h-screen flex flex-col items-center justify-center px-5"
        >
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                sessions={sessions}
                activeSessionId={activeSessionId}
                showChatView={showChatView}
                onSelectSession={handleSelectSession}
                onNewSession={handleNewSession}
                onDeleteSession={handleDeleteSession}
                onRenameSession={handleRenameSession}
                onToggleChatView={handleToggleChatView}
            />

            {/* Skip link */}
            <a
                href="#mic-button"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-accent focus:px-4 focus:py-2 focus:text-surface-950"
            >
                Skip to mic
            </a>

            {/* Navbar */}
            <Navbar
                isSidebarOpen={isSidebarOpen}
                onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                onHome={() => setShowChatView(false)}
                voices={tts.voices}
                selectedVoiceName={tts.voiceConfig.voice?.name ?? ""}
                rate={tts.voiceConfig.rate}
                onVoiceChange={tts.setVoice}
                onRateChange={tts.setRate}
            />

            {/* Main content - vertically centered */}
            <main className="flex flex-col items-center gap-8">
                {/* Avatar */}
                <MemoAvatar isSpeaking={tts.isSpeaking} />

                {/* Control Dock - Glassmorphism pill - Clickable */}
                <button
                    type="button"
                    id="mic-button"
                    onClick={status === "ready" ? handleMicToggle : handleCancel}
                    aria-label={status === "ready" ? "Start listening" : "Stop"}
                    className="
                        relative flex items-center justify-center
                        w-80 h-32 px-8
                        rounded-3xl
                        bg-surface-50/50 dark:bg-white/5 backdrop-blur-md
                        border border-black/10 dark:border-white/10
                        overflow-hidden
                        cursor-pointer
                        transition-all duration-300
                        hover:bg-black/5 dark:hover:bg-white/10 dark:hover:border-white/20
                        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20
                        group
                    "
                >
                    {/* Hover Stop Overlay - only during active states */}
                    {status !== "ready" && (
                        <div className="
                            absolute inset-0 z-20
                            flex items-center justify-center
                            bg-white/80 dark:bg-black/50 rounded-3xl
                            opacity-0 group-hover:opacity-100
                            transition-opacity duration-200
                        ">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-red-600 dark:text-red-500"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <rect x="6" y="6" width="12" height="12" rx="1" />
                                    </svg>
                                </div>
                                <span className="text-sm text-red-600 dark:text-red-400 font-medium">Tap to Stop</span>
                            </div>
                        </div>
                    )}

                    {/* Status Text - Subtle & Clean */}
                    <div className={`
                absolute bottom-32
                transition-all duration-500 ease-out
                ${tts.isSpeaking
                            ? "opacity-0 translate-y-4"
                            : "opacity-100 translate-y-0"
                        }
            `}>
                        <div className={`
                    px-6 py-2.5 rounded-full
                    backdrop-blur-md
                    bg-white/40 dark:bg-white/5
                    border border-white/20 dark:border-white/10
                    shadow-sm
                    flex items-center gap-2.5
                `}>
                            <div className={`
                        w-2 h-2 rounded-full
                        ${status === "listening" ? "bg-red-500 animate-pulse" :
                                    status === "thinking" ? "bg-blue-400 animate-bounce" :
                                        status === "speaking" ? "bg-purple-500 animate-pulse" :
                                            "bg-emerald-400"
                                }
                    `} />
                            <span className="text-sm font-medium tracking-wide text-surface-800 dark:text-white/90">
                                {status === "listening" ? "Listening..." :
                                    status === "thinking" ? "Thinking..." :
                                        status === "speaking" ? "Speaking..." :
                                            "Ready to chat"
                                }
                            </span>
                        </div>
                    </div>

                    {/* Interim Transcript (Live Speech to Text) */}
                    {interimText && status === "listening" && (
                        <div className="absolute bottom-48 w-full max-w-2xl px-4 text-center animate-fade-in-up">
                            <p className="text-xl font-medium text-surface-900 dark:text-white/90 leading-relaxed drop-shadow-sm">
                                {interimText}
                            </p>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {/* State A: Idle - Large mic button only */}
                        {status === "ready" && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center justify-center"
                            >
                                <MicButton
                                    isListening={false}
                                    onClick={handleMicToggle}
                                    disabled={false}
                                />
                            </motion.div>
                        )}

                        {/* State B: Listening - Waveform + text */}
                        {status === "listening" && (
                            <motion.div
                                key="listening"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center gap-2 group-hover:opacity-30 transition-opacity"
                            >
                                <span className="text-sm text-surface-500 dark:text-white/70 font-medium">
                                    Listening...
                                </span>
                                <div className="h-10 w-72 flex items-center justify-center">
                                    <AudioWaveform isActive={true} color="#ef4444" />
                                </div>
                            </motion.div>
                        )}

                        {/* State C: Thinking */}
                        {status === "thinking" && (
                            <motion.div
                                key="thinking"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center gap-2 group-hover:opacity-30 transition-opacity"
                            >
                                <span className="text-sm text-surface-500 dark:text-white/70 font-medium">
                                    Thinking...
                                </span>
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </motion.div>
                        )}

                        {/* State D: Speaking - Blue waveform */}
                        {status === "speaking" && (
                            <motion.div
                                key="speaking"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col items-center gap-2 group-hover:opacity-30 transition-opacity"
                            >
                                <span className="text-sm text-surface-500 dark:text-white/70 font-medium">
                                    Speaking...
                                </span>
                                <div className="h-10 w-72 flex items-center justify-center">
                                    <AudioWaveform isActive={true} color="#06b6d4" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>

                {/* Subtitle Text - Below control dock */}
                <p
                    className={`
                        max-w-2xl text-center text-xl font-medium text-surface-900 dark:text-white
                        drop-shadow-md
                        transition-opacity duration-1000 ease-out
                        ${showText || isActive ? "opacity-100" : "opacity-0"}
                    `}
                >
                    {getDisplayText()}
                </p>
            </main>

            {/* Chat View Overlay */}
            <ChatView
                messages={messages}
                isVisible={showChatView}
                isSidebarOpen={isSidebarOpen}
                onClose={() => setShowChatView(false)}
            />
        </div>
    );
}
