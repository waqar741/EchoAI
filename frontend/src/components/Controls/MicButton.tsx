/**
 * MicButton – Primary voice input control
 * 
 * Design:
 *  • White background circle (bg-white/10, hover: bg-white/20)
 *  • Large white mic icon (w-8 h-8)
 *  • Scale up on hover (scale-110)
 *  • Pulse rings when listening
 */

import { memo } from "react";
import { MicIcon } from "../UI/icons";

interface MicButtonProps {
  isListening: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const MicButton = memo(function MicButton({
  isListening,
  onClick,
  disabled,
}: MicButtonProps) {
  return (
    <div className="relative flex items-center justify-center group">
      {/* Pulse rings when listening */}
      {isListening && (
        <>
          <span
            className="absolute h-16 w-16 animate-pulse-ring rounded-full bg-speak/40"
            style={{ animationDelay: "0s" }}
          />
          <span
            className="absolute h-16 w-16 animate-pulse-ring rounded-full bg-speak/25"
            style={{ animationDelay: "0.5s" }}
          />
        </>
      )}

      {/* Main button */}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={isListening ? "Stop listening" : "Start listening"}
        className={`
          relative z-10 flex h-14 w-14 items-center justify-center
          rounded-full
          transition-all duration-300 ease-out
          focus-visible:outline-none focus-visible:ring-4
          focus-visible:ring-white/30 focus-visible:ring-offset-2
          focus-visible:ring-offset-transparent
          disabled:pointer-events-none disabled:opacity-40
          ${isListening
            ? "bg-speak text-white shadow-glow-red scale-110"
            : "bg-surface-200 text-surface-900 hover:bg-surface-300 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 hover:scale-110 active:scale-95"
          }
        `}
        style={{ touchAction: "manipulation" }}
      >
        <MicIcon
          size={32}
          className={`
            transition-transform duration-300
            ${isListening ? "animate-pulse" : ""}
          `}
        />
      </button>
    </div>
  );
});
