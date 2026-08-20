"use client";

export const ACCESSIBILITY_STORAGE_KEY = "warmi-accessibility-settings";

export const speechRateOptions = {
  slow: { label: "Lenta", rate: 0.8 },
  normal: { label: "Normal", rate: 1 },
  fast: { label: "Rápida", rate: 1.2 }
} as const;

export type SpeechRateOption = keyof typeof speechRateOptions;

export type AccessibilitySettings = {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  voiceEnabled: boolean;
  speechRate: SpeechRateOption;
};

export const defaultAccessibilitySettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  voiceEnabled: true,
  speechRate: "normal"
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
      speechRate
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
