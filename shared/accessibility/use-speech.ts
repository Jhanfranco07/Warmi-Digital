"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";

import {
  type AccessibilitySettings,
  readAccessibilitySettings,
  speechRateOptions,
  speechToneOptions
} from "@/shared/accessibility/accessibility-settings";

type SpeechState = {
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  message: string | null;
  settings: AccessibilitySettings;
};

function getBrowserSynthesis() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  return window.speechSynthesis;
}

function getPreferredVoice(settings: AccessibilitySettings) {
  const synthesis = getBrowserSynthesis();

  if (!synthesis) {
    return null;
  }

  const voices = synthesis.getVoices();

  if (settings.speechVoiceURI !== "auto") {
    const selectedVoice = voices.find(
      (voice) => voice.voiceURI === settings.speechVoiceURI
    );

    if (selectedVoice) {
      return selectedVoice;
    }
  }

  return (
    voices.find((voice) => voice.lang.toLowerCase() === "es-pe") ??
    voices.find((voice) => voice.lang.toLowerCase() === "es-419") ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("es")) ??
    voices[0] ??
    null
  );
}

export function useSpeech() {
  const id = useId();
  const pathname = usePathname();
  const [state, setState] = useState<SpeechState>(() => ({
    isSpeaking: false,
    isPaused: false,
    isSupported: true,
    message: null,
    settings: readAccessibilitySettings()
  }));
  const settings = state.settings;

  useEffect(() => {
    setState((current) => ({
      ...current,
      isSupported: Boolean(getBrowserSynthesis())
    }));
  }, []);

  useEffect(() => {
    function handleSettingsChange() {
      setState((current) => ({
        ...current,
        settings: readAccessibilitySettings()
      }));
    }

    window.addEventListener("warmi-accessibility-settings-change", handleSettingsChange);

    return () => {
      window.removeEventListener(
        "warmi-accessibility-settings-change",
        handleSettingsChange
      );
    };
  }, []);

  useEffect(() => {
    function handleOtherSpeech(event: Event) {
      const detail = (event as CustomEvent<{ id: string }>).detail;

      if (detail?.id !== id) {
        setState((current) => ({
          ...current,
          isSpeaking: false,
          isPaused: false
        }));
      }
    }

    window.addEventListener("warmi-speech-start", handleOtherSpeech);

    return () => {
      window.removeEventListener("warmi-speech-start", handleOtherSpeech);
    };
  }, [id]);

  useEffect(() => {
    return () => {
      getBrowserSynthesis()?.cancel();
    };
  }, [pathname]);

  const stop = useCallback(() => {
    const synthesis = getBrowserSynthesis();

    synthesis?.cancel();
    setState((current) => ({
      ...current,
      isSpeaking: false,
      isPaused: false
    }));
  }, []);

  const speak = useCallback(
    (text: string) => {
      const synthesis = getBrowserSynthesis();

      if (!synthesis || typeof window === "undefined") {
        setState((current) => ({
          ...current,
          isSupported: false,
          message: "Tu dispositivo no permite usar la ayuda por voz."
        }));
        return;
      }

      if (!settings.voiceEnabled) {
        setState((current) => ({
          ...current,
          message: "La ayuda por voz está desactivada en tu perfil."
        }));
        return;
      }

      const cleanText = text.trim();

      if (!cleanText) {
        return;
      }

      synthesis.cancel();
      window.dispatchEvent(new CustomEvent("warmi-speech-start", { detail: { id } }));

      const selectedVoice = getPreferredVoice(settings);
      const utterance = new SpeechSynthesisUtterance(cleanText);

      utterance.lang = selectedVoice?.lang ?? "es-PE";
      utterance.rate = speechRateOptions[settings.speechRate].rate;
      utterance.pitch = speechToneOptions[settings.speechTone].pitch;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setState((current) => ({
          ...current,
          isSpeaking: true,
          isPaused: false,
          message: null
        }));
      };
      utterance.onpause = () => {
        setState((current) => ({ ...current, isPaused: true }));
      };
      utterance.onresume = () => {
        setState((current) => ({ ...current, isPaused: false }));
      };
      utterance.onend = () => {
        setState((current) => ({ ...current, isSpeaking: false, isPaused: false }));
      };
      utterance.onerror = () => {
        setState((current) => ({
          ...current,
          isSpeaking: false,
          isPaused: false,
          message: "No pudimos reproducir la ayuda por voz en este momento."
        }));
      };

      synthesis.speak(utterance);
    },
    [id, settings]
  );

  const pause = useCallback(() => {
    const synthesis = getBrowserSynthesis();

    if (synthesis?.speaking && !synthesis.paused) {
      synthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    const synthesis = getBrowserSynthesis();

    if (synthesis?.paused) {
      synthesis.resume();
    }
  }, []);

  return {
    speak,
    pause,
    resume,
    stop,
    isSpeaking: state.isSpeaking,
    isPaused: state.isPaused,
    isSupported: state.isSupported,
    message: state.message,
    settings: state.settings
  };
}
