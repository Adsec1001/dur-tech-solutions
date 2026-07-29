import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Minimal type shim for Web Speech API
type SpeechRecognitionType = any;

export function useVoiceInput(onResult: (transcript: string) => void, lang = "tr-TR") {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<SpeechRecognitionType | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const text = e.results?.[0]?.[0]?.transcript?.trim();
      if (text) onResult(text);
    };
    rec.onerror = (e: any) => {
      setListening(false);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        toast({ title: "Mikrofon izni gerekli", description: "Tarayıcı mikrofon erişimini reddetti.", variant: "destructive" });
      } else if (e.error === "no-speech") {
        toast({ title: "Ses algılanamadı", description: "Lütfen tekrar deneyin." });
      }
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    return () => {
      try { rec.abort(); } catch { /* noop */ }
    };
  }, [lang, onResult, toast]);

  const start = useCallback(() => {
    if (!recRef.current) return;
    try {
      recRef.current.start();
      setListening(true);
    } catch {
      // Already running
    }
  }, []);

  const stop = useCallback(() => {
    if (!recRef.current) return;
    try { recRef.current.stop(); } catch { /* noop */ }
    setListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop(); else start();
  }, [listening, start, stop]);

  return { listening, supported, start, stop, toggle };
}