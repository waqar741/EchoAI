/**
 * TranscriptDisplay – Real-time interim transcript
 * 
 * Shows user speech in real-time while listening
 */

import { memo } from "react";

interface TranscriptDisplayProps {
  text: string;
}

export const TranscriptDisplay = memo(function TranscriptDisplay({ text }: TranscriptDisplayProps) {
  return (
    <div className="flex animate-fade-in justify-end">
      <div className="max-w-[85%] flex flex-col gap-1 items-end">
        <div
          className="
            px-4 py-3 text-sm leading-relaxed italic
            break-words rounded-2xl
            bg-speak/15 border border-speak/20
            text-speak-light shadow-sm
          "
        >
          {text}
          <span className="inline-block w-0.5 h-4 ml-1 bg-speak animate-pulse" />
        </div>
        <span className="text-[10px] text-surface-500 px-1">
          Listening...
        </span>
      </div>
    </div>
  );
});
