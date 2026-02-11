/**
 * StatusIndicator – Animated status badge
 * 
 * Premium design with:
 *  • Status-specific colors and icons
 *  • Smooth transitions between states
 *  • Pulse animation for active states
 */

import { memo } from "react";
import { useChatStore } from "../../store/chatStore";
import { LoadingDots } from "./LoadingDots";

const STATUS_CONFIG: Record<string, {
  text: string;
  className: string;
  showDots?: boolean;
}> = {
  ready: { text: "Ready", className: "status-ready" },
  listening: { text: "Listening", className: "status-listening", showDots: true },
  thinking: { text: "Thinking", className: "status-thinking", showDots: true },
  speaking: { text: "Speaking", className: "status-speaking", showDots: true },
  error: { text: "Error", className: "bg-danger/15 text-danger" },
};

export const StatusIndicator = memo(function StatusIndicator() {
  const status = useChatStore((s) => s.status);
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.ready;

  return (
    <div
      aria-live="polite"
      className={`
        status-badge animate-scale-in
        transition-all duration-300
        ${config.className}
      `}
    >
      {/* Pulsing dot for active states */}
      {status !== "ready" && status !== "error" && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      )}

      {/* Static dot for ready state */}
      {status === "ready" && (
        <span className="h-2 w-2 rounded-full bg-current" />
      )}

      <span>{config.text}</span>

      {config.showDots && <LoadingDots />}
    </div>
  );
});
