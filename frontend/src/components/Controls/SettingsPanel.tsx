/**
 * SettingsPanel – Slide-out drawer with premium controls
 * 
 * Features:
 *  • Glass panel with backdrop blur
 *  • Smooth slide-in/out animation
 *  • Modern select inputs
 *  • Avatar type selector with icons
 */

import { useState, memo } from "react";
import type { AvatarType } from "../../types";
import { useChatStore } from "../../store/chatStore";
import { SettingsIcon, XIcon } from "../UI/icons";

interface SettingsPanelProps {
  voices: SpeechSynthesisVoice[];
  selectedVoiceName: string;
  rate: number;
  onVoiceChange: (v: SpeechSynthesisVoice) => void;
  onRateChange: (r: number) => void;
}

const AVATAR_OPTIONS: { value: AvatarType; label: string; emoji: string }[] = [
  { value: "realistic", label: "Realistic 2D", emoji: "🎨" },
  { value: "cartoon3d", label: "Cartoon 3D", emoji: "🧊" },
  { value: "photo", label: "Photo Avatar", emoji: "📸" },
  { value: "gif", label: "Animated GIF", emoji: "✨" },
];

const SPEED_OPTIONS = [
  { value: 0.5, label: "0.5× Slow" },
  { value: 0.75, label: "0.75×" },
  { value: 1, label: "1× Normal" },
  { value: 1.25, label: "1.25×" },
  { value: 1.5, label: "1.5× Fast" },
];

export const SettingsPanel = memo(function SettingsPanel({
  voices,
  selectedVoiceName,
  rate,
  onVoiceChange,
  onRateChange,
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const avatarType = useChatStore((s) => s.avatarType);
  const setAvatarType = useChatStore((s) => s.setAvatarType);

  return (
    <>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open settings"
        className="
          fixed top-4 right-4 z-40
          flex h-11 w-11 items-center justify-center
          rounded-full glass-card
          text-surface-400 hover:text-surface-100
          hover:shadow-glow transition-all duration-300
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-accent
        "
      >
        <SettingsIcon size={20} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 z-50 h-full w-80
          glass-card rounded-l-3xl shadow-elevated
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-700/50 px-6 py-4">
          <h2 className="text-lg font-semibold gradient-text">Settings</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close settings"
            className="
              flex h-9 w-9 items-center justify-center rounded-full
              text-surface-400 hover:text-surface-100 hover:bg-surface-700/50
              transition-colors
            "
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar Type */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-surface-400 uppercase tracking-wider">
              Avatar Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAvatarType(opt.value)}
                  className={`
                    flex items-center gap-2 px-3 py-2.5 rounded-xl
                    text-sm font-medium transition-all duration-200
                    ${avatarType === opt.value
                      ? "bg-gradient-to-r from-accent/20 to-purple/20 text-accent border border-accent/30"
                      : "bg-surface-800/50 text-surface-300 border border-transparent hover:border-surface-600"
                    }
                  `}
                >
                  <span>{opt.emoji}</span>
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Voice */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-surface-400 uppercase tracking-wider">
              Voice
            </label>
            <select
              value={selectedVoiceName}
              onChange={(e) => {
                const v = voices.find((x) => x.name === e.target.value);
                if (v) onVoiceChange(v);
              }}
              className="
                w-full rounded-xl border border-surface-700
                bg-surface-800/50 px-4 py-3 text-sm text-surface-100
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-accent focus-visible:border-accent
                transition-colors
              "
            >
              {voices.length === 0 && (
                <option value="" disabled>
                  Loading voices…
                </option>
              )}
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speed */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-surface-400 uppercase tracking-wider">
              Speech Speed
            </label>
            <div className="flex flex-wrap gap-2">
              {SPEED_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onRateChange(opt.value)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium
                    transition-all duration-200
                    ${rate === opt.value
                      ? "bg-accent text-surface-950"
                      : "bg-surface-800/50 text-surface-400 hover:text-surface-100"
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-surface-700/50">
          <p className="text-xs text-surface-500 text-center">
            EchoAI v1.0
          </p>
        </div>
      </div>
    </>
  );
});
