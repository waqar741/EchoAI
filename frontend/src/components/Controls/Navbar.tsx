/**
 * Navbar – Minimal top bar with sidebar toggle and settings
 * 
 * Features:
 *  • Sidebar toggle icon on the left
 *  • Settings icon on the right
 *  • Settings modal popup
 */

import { memo, useState } from "react";
import { SettingsIcon, XIcon, MicIcon } from "../UI/icons";
import { useChatStore } from "../../store/chatStore";
import type { AvatarType } from "../../types";

interface NavbarProps {
    isSidebarOpen: boolean;
    onSidebarToggle: () => void;
    onHome: () => void;
    voices: SpeechSynthesisVoice[];
    selectedVoiceName: string;
    rate: number;
    onVoiceChange: (voice: SpeechSynthesisVoice) => void;
    onRateChange: (rate: number) => void;
}

// Avatar options
// Avatar options
const AVATAR_OPTIONS: { id: string; name: string; url: string; type: AvatarType }[] = [
    { id: "robo", name: "Female Robo", url: "/assets/avatars/robo-f.gif", type: "gif" },
    { id: "gradient-ai-robo", name: "Gradient Robo", url: "/assets/avatars/gradient-robo.gif", type: "gif" },
    { id: "dashrath", name: "Dashrath", url: "/assets/dashrath.gif", type: "gif" },
    { id: "humoied", name: "Humoied", url: "/assets/humoied.gif", type: "gif" },
    { id: "women", name: "Women", url: "/assets/women.gif", type: "gif" },
];

// Sidebar Toggle Icon
const SidebarIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
);

export const Navbar = memo(function Navbar({
    isSidebarOpen,
    onSidebarToggle,
    onHome,
    voices,
    selectedVoiceName,
    rate,
    onVoiceChange,
    onRateChange,
}: NavbarProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"voice" | "avatar" | "general">("voice");

    // Global state
    const avatarType = useChatStore((s) => s.avatarType);
    const avatarId = useChatStore((s) => s.avatarId);
    const setAvatarType = useChatStore((s) => s.setAvatarType);
    const setAvatarId = useChatStore((s) => s.setAvatarId);
    const theme = useChatStore((s) => s.theme);
    const setTheme = useChatStore((s) => s.setTheme);


    // ... inside return
    <div>
        <label className="block text-sm font-medium text-white/70 mb-3">
            Theme
        </label>
        <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
                <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`
                                                        flex-1 py-3 px-4 rounded-xl
                                                        text-sm font-medium capitalize
                                                        transition-all duration-200
                                                        ${theme === t
                            ? "bg-surface-950 border-2 border-accent text-white"
                            : "bg-white/5 border border-white/10 text-white/60 hover:text-white"
                        }
                                                    `}
                >
                    {t}
                </button>
            ))}
        </div>
    </div>

    // Helper to identify selected avatar
    // Helper to identify selected avatar
    const currentAvatarId = avatarId;

    const tabs = [
        { id: "voice" as const, label: "Voice" },
        { id: "avatar" as const, label: "Avatar" },
        { id: "general" as const, label: "General" },
    ];

    return (
        <>
            {/* Top Bar - Only toggle and settings */}
            <div className={`
                fixed top-0 right-0 z-45
                flex items-center justify-between
                h-12 px-4
                bg-white/80 dark:bg-surface-950/80 backdrop-blur-md
                border-b border-black/5 dark:border-white/5
                transition-all duration-300
                ${isSidebarOpen ? "md:left-64 left-0" : "left-0"}
            `}>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onSidebarToggle}
                        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                        className="
                            p-2 rounded-lg
                            text-surface-500 hover:text-surface-900 hover:bg-black/5
                            dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5
                            transition-all duration-200
                        "
                    >
                        <SidebarIcon size={20} />
                    </button>
                </div>

                {/* Settings Button */}
                <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                    aria-label="Open settings"
                    className="
                        p-2 rounded-lg
                        text-surface-500 hover:text-surface-900 hover:bg-black/5
                        dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5
                        transition-all duration-200
                    "
                >
                    <SettingsIcon size={20} />
                </button>
            </div>

            {/* Settings Modal */}
            {
                isSettingsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
                            onClick={() => setIsSettingsOpen(false)}
                        />

                        {/* Modal */}
                        <div className="
                        relative z-10
                        w-full max-w-lg
                        max-h-[85vh]
                        bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl
                        rounded-2xl
                        border border-black/10 dark:border-white/10
                        shadow-2xl
                        overflow-hidden
                        animate-scale-in
                    ">
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-black/5 dark:border-white/10">
                                <h2 className="text-xl font-semibold text-surface-900 dark:text-white">Settings</h2>
                                <button
                                    type="button"
                                    onClick={() => setIsSettingsOpen(false)}
                                    aria-label="Close settings"
                                    className="
                                    p-2 rounded-lg
                                    bg-black/5 hover:bg-black/10
                                    text-surface-600 hover:text-surface-900
                                    dark:bg-white/5 dark:hover:bg-white/10
                                    dark:text-white/70 dark:hover:text-white
                                    transition-colors
                                "
                                >
                                    <XIcon size={20} />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-black/5 dark:border-white/10">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                        flex-1 py-3 px-4
                                        text-sm font-medium
                                        transition-all duration-200
                                        ${activeTab === tab.id
                                                ? "text-accent border-b-2 border-accent bg-black/5 dark:bg-white/5"
                                                : "text-surface-500 hover:text-surface-900 hover:bg-black/5 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5"
                                            }
                                    `}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Content - Scrollable */}
                            <div className="p-5 overflow-y-auto max-h-[calc(85vh-140px)]">
                                {/* Voice Tab */}
                                {activeTab === "voice" && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div>
                                            <label className="block text-sm font-medium text-surface-700 dark:text-white/70 mb-3">
                                                Voice
                                            </label>
                                            <select
                                                value={selectedVoiceName}
                                                onChange={(e) => {
                                                    const voice = voices.find((v) => v.name === e.target.value);
                                                    if (voice) onVoiceChange(voice);
                                                }}
                                                className="
                                                w-full px-4 py-3 rounded-xl
                                                bg-surface-50 border border-black/10 text-surface-900
                                                dark:bg-white/5 dark:border-white/10 dark:text-white
                                                text-sm
                                                focus:outline-none focus:ring-2 focus:ring-accent/50
                                                cursor-pointer
                                            "
                                            >
                                                {voices.map((v) => (
                                                    <option key={v.name} value={v.name} className="bg-white text-surface-900 dark:bg-surface-900 dark:text-white">
                                                        {v.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-surface-700 dark:text-white/70 mb-3">
                                                Voice
                                            </label>
                                            <select
                                                value={selectedVoiceName}
                                                onChange={(e) => {
                                                    const voice = voices.find((v) => v.name === e.target.value);
                                                    if (voice) onVoiceChange(voice);
                                                }}
                                                className="
                                                w-full px-4 py-3 rounded-xl
                                                bg-surface-50 border border-black/10 text-surface-900
                                                dark:bg-white/5 dark:border-white/10 dark:text-white
                                                text-sm
                                                focus:outline-none focus:ring-2 focus:ring-accent/50
                                                cursor-pointer
                                            "
                                            >
                                                {voices.map((v) => (
                                                    <option key={v.name} value={v.name} className="bg-white text-surface-900 dark:bg-surface-900 dark:text-white">
                                                        {v.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-surface-700 dark:text-white/70 mb-3">
                                                Speech Speed: {rate.toFixed(1)}x
                                            </label>
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="2"
                                                step="0.1"
                                                value={rate}
                                                onChange={(e) => onRateChange(parseFloat(e.target.value))}
                                                className="
                                                w-full h-2 rounded-full
                                                bg-black/10 dark:bg-white/10 
                                                accent-accent
                                                cursor-pointer
                                            "
                                            />
                                            <div className="flex justify-between text-xs text-surface-400 dark:text-white/50 mt-2">
                                                <span>0.5x</span>
                                                <span>1.0x</span>
                                                <span>2.0x</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Avatar Tab */}
                                {activeTab === "avatar" && (
                                    <div className="space-y-4 animate-fade-in">
                                        <label className="block text-sm font-medium text-surface-700 dark:text-white/70 mb-3">
                                            Choose Avatar
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {AVATAR_OPTIONS.map((avatar) => (
                                                <button
                                                    key={avatar.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setAvatarType(avatar.type);
                                                        setAvatarId(avatar.id);

                                                        // Auto-select voice based on avatar gender
                                                        const isFemale = ["robo", "women"].includes(avatar.id);
                                                        const genderTerm = isFemale ? "Female" : "Male";

                                                        // Find first voice matching the gender term
                                                        // Note: Voice names vary by OS/Browser. This is a best-effort heuristic.
                                                        const matchingVoice = voices.find(v =>
                                                            v.name.includes(genderTerm) ||
                                                            (isFemale ? v.name.includes("Zira") || v.name.includes("Google US English") : v.name.includes("David") || v.name.includes("Mark"))
                                                        );

                                                        if (matchingVoice) {
                                                            onVoiceChange(matchingVoice);
                                                        }
                                                    }}
                                                    className={`
                                                    p-4 rounded-xl
                                                    flex flex-col items-center gap-3
                                                    border-2 transition-all duration-200
                                                    ${currentAvatarId === avatar.id
                                                            ? "border-accent bg-accent/10"
                                                            : "border-black/10 bg-white/50 hover:border-black/20 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
                                                        }
                                                `}
                                                >
                                                    <div className="w-16 h-16 rounded-full bg-surface-200 dark:bg-surface-800 overflow-hidden">
                                                        <img
                                                            src={avatar.url}
                                                            alt={avatar.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <span className="text-sm text-surface-700 dark:text-white/80">{avatar.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-surface-400 dark:text-white/40 mt-4">
                                            More avatars coming soon!
                                        </p>
                                    </div>
                                )}

                                {/* General Tab */}
                                {activeTab === "general" && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div>
                                            <label className="block text-sm font-medium text-surface-700 dark:text-white/70 mb-3">
                                                Theme
                                            </label>
                                            <div className="flex gap-2">
                                                {(["light", "dark", "system"] as const).map((t) => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setTheme(t)}
                                                        className={`
                                                        flex-1 py-3 px-4 rounded-xl
                                                        text-sm font-medium capitalize
                                                        transition-all duration-200
                                                        ${theme === t
                                                                ? "bg-surface-900 border-2 border-accent text-white dark:bg-surface-950"
                                                                : "bg-black/5 border border-black/10 text-surface-600 hover:text-surface-900 dark:bg-white/5 dark:border-white/10 dark:text-white/60 dark:hover:text-white"
                                                            }
                                                    `}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-surface-700 dark:text-white/70 mb-3">
                                                Language
                                            </label>
                                            <select className="
                                            w-full px-4 py-3 rounded-xl
                                            bg-surface-50 border border-black/10 text-surface-900
                                            dark:bg-white/5 dark:border-white/10 dark:text-white
                                            text-sm
                                            focus:outline-none focus:ring-2 focus:ring-accent/50
                                            cursor-pointer
                                        ">
                                                <option value="en" className="bg-white text-surface-900 dark:bg-surface-900 dark:text-white">English</option>
                                                <option value="es" className="bg-white text-surface-900 dark:bg-surface-900 dark:text-white">Spanish (Soon)</option>
                                            </select>
                                        </div>

                                        <div className="pt-4 border-t border-black/5 dark:border-white/10">
                                            <p className="text-xs text-surface-400 dark:text-white/40">
                                                EchoAI v1.0.0<br />
                                                Built with React + TypeScript
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            <style>{`
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-scale-in { animation: scale-in 0.2s ease-out; }
            `}</style>
        </>
    );
});
