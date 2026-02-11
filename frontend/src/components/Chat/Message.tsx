/**
 * Message – Premium chat bubble
 * 
 * Features:
 *  • User: Gradient accent with right-aligned tail
 *  • Assistant: Glass effect with left-aligned tail
 *  • Smooth entrance animation
 *  • Timestamps
 */

import { memo } from "react";
import type { ConversationEntry } from "../../types";

interface MessageProps {
  entry: ConversationEntry;
}

export const Message = memo(function Message({ entry }: MessageProps) {
  const isUser = entry.role === "user";
  const time = new Date(entry.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div
      className={`
        flex animate-slide-up
        ${isUser ? "justify-end" : "justify-start"}
      `}
    >
      <div className={`max-w-[85%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`
            px-4 py-3 text-sm leading-relaxed
            break-words shadow-card
            ${isUser ? "message-user" : "message-assistant"}
          `}
        >
          {entry.content}
        </div>
        <span className="text-[10px] text-surface-500 px-1">
          {time}
        </span>
      </div>
    </div>
  );
});
