"use client";

export const ACCESSIBILITY_STORAGE_KEY = "warmi-accessibility-settings";

export const speechRateOptions = {
  slow: { label: "Lenta", rate: 0.8 },
  normal: { label: "Normal", rate: 1 },
  fast: { label: "Rápida", rate: 1.2 }
} as const;

export const speechToneOptions = {
  warm: { label: "Cálida", pitch: 0.92 },
  natural: { label: "Natural", pitch: 1 },
  bright: { label: "Clara", pitch: 1.08 }
} as const;

export type SpeechRateOption = keyof typeof speechRateOptions;
export type SpeechToneOption = keyof typeof speechToneOptions;

export type AccessibilitySettings = {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  voiceEnabled: boolean;
  speechRate: SpeechRateOption;
  speechTone: SpeechToneOption;
  speechVoiceURI: string;
};

export const defaultAccessibilitySettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  voiceEnabled: true,
  speechRate: "normal",
  speechTone: "warm",
  speechVoiceURI: "auto"
};

export function readAccessibilitySettings(): AccessibilitySettings {
  if (typeof window === "undefined") {
    return defaultAccessibilitySettings;
  }

  try {
    const value = window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);

    if (!value) {
      return defaultAccessibilitySettings;
    }

    const parsed = JSON.parse(value) as Partial<AccessibilitySettings>;
    const speechRate =
      parsed.speechRate && parsed.speechRate in speechRateOptions
        ? parsed.speechRate
        : defaultAccessibilitySettings.speechRate;
    const speechTone =
      parsed.speechTone && parsed.speechTone in speechToneOptions
        ? parsed.speechTone
        : defaultAccessibilitySettings.speechTone;
    const speechVoiceURI =
      typeof parsed.speechVoiceURI === "string" && parsed.speechVoiceURI.trim()
        ? parsed.speechVoiceURI
        : defaultAccessibilitySettings.speechVoiceURI;

    return {
      highContrast:
        typeof parsed.highContrast === "boolean"
          ? parsed.highContrast
          : defaultAccessibilitySettings.highContrast,
      largeText:
        typeof parsed.largeText === "boolean"
          ? parsed.largeText
          : defaultAccessibilitySettings.largeText,
      reduceMotion:
        typeof parsed.reduceMotion === "boolean"
          ? parsed.reduceMotion
          : defaultAccessibilitySettings.reduceMotion,
      voiceEnabled:
        typeof parsed.voiceEnabled === "boolean"
          ? parsed.voiceEnabled
          : defaultAccessibilitySettings.voiceEnabled,
      speechRate,
      speechTone,
      speechVoiceURI
    };
  } catch {
    return defaultAccessibilitySettings;
  }
}

export function saveAccessibilitySettings(settings: AccessibilitySettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent("warmi-accessibility-settings-change"));
}

export function applyAccessibilitySettings(settings: AccessibilitySettings) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  root.classList.toggle("warmi-large-text", settings.largeText);
  root.classList.toggle("warmi-high-contrast", settings.highContrast);
  root.classList.toggle("warmi-reduce-motion", settings.reduceMotion);
}
