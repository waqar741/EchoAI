/**
 * useVoiceInput – Web Speech API hook with auto-silence detection.
 *
 * Flow: start → listen → detect 1.5s silence → auto-finalize transcript.
 * The caller gets notified via onSilenceDetected callback.
 */

import { useCallback, useEffect, useRef, useState } from "react";

interface UseVoiceInputOptions {
  /** Called when user stops speaking for silenceMs. Receives final text. */
  onSilenceDetected?: (transcript: string) => void;
  /** Silence threshold in ms before auto-send (default 1500). */
  silenceMs?: number;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => string;
  resetTranscript: () => void;
}

export function useVoiceInput(opts: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const { onSilenceDetected, silenceMs = 1500 } = opts;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const accumulatedRef = useRef("");
  const currentSessionFinalRef = useRef("");
  const intentionalStopRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSpokenRef = useRef(false);
  const onSilenceRef = useRef(onSilenceDetected);

  // Keep callback ref in sync (no stale closures).
  useEffect(() => {
    onSilenceRef.current = onSilenceDetected;
  }, [onSilenceDetected]);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const startSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      // Only auto-send if user actually spoke something.
      if (hasSpokenRef.current && accumulatedRef.current.trim()) {
        intentionalStopRef.current = true;
        recognitionRef.current?.stop();
        setIsListening(false);
        const final = accumulatedRef.current.trim();
        setInterimTranscript("");
        onSilenceRef.current?.(final);
      }
    }, silenceMs);
  }, [silenceMs, clearSilenceTimer]);

  /* ─── Add interim ref to track latest partials ─── */
  const currentSessionInterimRef = useRef("");

  // Lazily initialise recognition once.
  const getRecognition = useCallback((): SpeechRecognition | null => {
    if (recognitionRef.current) return recognitionRef.current;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      let sessionFinal = "";
      let sessionInterim = "";

      for (let i = 0; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          sessionFinal += text;
        } else {
          sessionInterim += text;
        }
      }

      sessionFinal = sessionFinal.trim();
      sessionInterim = sessionInterim.trim();

      currentSessionFinalRef.current = sessionFinal;
      currentSessionInterimRef.current = sessionInterim;

      const fullFinal = (accumulatedRef.current + " " + sessionFinal).trim();
      setTranscript(fullFinal);
      setInterimTranscript((fullFinal + " " + sessionInterim).trim());

      hasSpokenRef.current = true;
      startSilenceTimer();
    };

    rec.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      console.error("[useVoiceInput] error:", event.error);
      intentionalStopRef.current = true;
      clearSilenceTimer();
      setIsListening(false);
    };

    rec.onend = () => {
      if (currentSessionFinalRef.current) {
        accumulatedRef.current = (accumulatedRef.current + " " + currentSessionFinalRef.current).trim();
        currentSessionFinalRef.current = "";
      }
      currentSessionInterimRef.current = ""; // Clear interim on end

      if (!intentionalStopRef.current) {
        try {
          rec.start();
          return;
        } catch { }
      }
      clearSilenceTimer();
      setIsListening(false);
    };

    recognitionRef.current = rec;
    return rec;
  }, [startSilenceTimer, clearSilenceTimer]);

  const startListening = useCallback(() => {
    const rec = getRecognition();
    if (!rec) {
      alert("Speech Recognition not supported. Please use Chrome or Edge.");
      return;
    }
    accumulatedRef.current = "";
    currentSessionFinalRef.current = "";
    currentSessionInterimRef.current = "";
    intentionalStopRef.current = false;
    hasSpokenRef.current = false;
    setTranscript("");
    setInterimTranscript("");
    try {
      rec.start();
      setIsListening(true);
    } catch {
      console.warn("[useVoiceInput] recognition already running");
    }
  }, [getRecognition]);

  const stopListening = useCallback((): string => {
    intentionalStopRef.current = true;
    clearSilenceTimer();

    // Construct final result BEFORE aborting/stopping to ensure we capture everything
    const final = [
      accumulatedRef.current,
      currentSessionFinalRef.current,
      currentSessionInterimRef.current
    ].filter(Boolean).join(" ").trim();

    try {
      recognitionRef.current?.abort();
    } catch {
      recognitionRef.current?.stop();
    }

    setIsListening(false);
    setInterimTranscript("");

    // Reset refs appropriately
    accumulatedRef.current = "";
    currentSessionFinalRef.current = "";
    currentSessionInterimRef.current = "";
    hasSpokenRef.current = false;

    return final;
  }, [clearSilenceTimer]);

  const resetTranscript = useCallback(() => {
    accumulatedRef.current = "";
    hasSpokenRef.current = false;
    setTranscript("");
    setInterimTranscript("");
  }, []);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      intentionalStopRef.current = true;
      clearSilenceTimer();
      recognitionRef.current?.abort();
    };
  }, [clearSilenceTimer]);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  };
}
