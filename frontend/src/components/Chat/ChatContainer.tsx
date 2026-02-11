/**
 * ChatContainer – Premium scrollable message list
 * 
 * Features:
 *  • Glass card container with blur
 *  • Fade gradient at top for scroll indication
 *  • Modern empty state
 *  • Animated thinking indicator
 */

import { useEffect, useRef, memo } from "react";
import { useChatStore } from "../../store/chatStore";
import { Message } from "./Message";
import { TranscriptDisplay } from "./TranscriptDisplay";
import { LoadingDots } from "../UI/LoadingDots";
import { SparklesIcon } from "../UI/icons";

export const ChatContainer = memo(function ChatContainer() {
  const messages = useChatStore((s) => s.messages);
  const interimText = useChatStore((s) => s.interimText);
  const status = useChatStore((s) => s.status);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, interimText, status]);

  const isEmpty = messages.length === 0 && !interimText;

  return (
    <section
      aria-label="Conversation history"
      className="
        relative mx-auto mb-8 w-full max-w-xl flex-1
        min-h-[180px] max-h-[40vh] overflow-y-auto
        scroll-smooth glass-card p-5
      "
    >
      {/* Fade gradient at top */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-8 z-10"
        style={{
          background: "linear-gradient(to bottom, rgba(15, 23, 42, 0.9), transparent)"
        }}
      />

      {/* Empty state */}
      {isEmpty && (
        <div className="flex h-full min-h-[140px] flex-col items-center justify-center gap-3 animate-fade-in">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-purple/20">
            <SparklesIcon size={28} className="text-accent" />
          </div>
          <p className="text-center text-sm text-surface-400">
            Start a conversation by tapping the mic
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="relative z-0 space-y-3 pt-2">
        {messages.map((m) => (
          <Message key={m.id} entry={m} />
        ))}

        {/* Interim transcript */}
        {interimText && <TranscriptDisplay text={interimText} />}

        {/* Thinking indicator */}
        {status === "thinking" && (
          <div className="flex animate-fade-in justify-start">
            <div className="message-assistant inline-flex items-center gap-2 px-4 py-3 text-sm text-surface-300">
              <span>Thinking</span>
              <LoadingDots />
            </div>
          </div>
        )}
      </div>

      <div ref={bottomRef} className="h-2" />
    </section>
  );
});
