"use client";

export const ACCESSIBILITY_STORAGE_KEY = "warmi-accessibility-settings";

export const speechRateOptions = {
  slow: { label: "Lenta", rate: 0.8 },
  normal: { label: "Normal", rate: 1 },
  fast: { label: "Rápida", rate: 1.2 }
} as const;

export type SpeechRateOption = keyof typeof speechRateOptions;

export type AccessibilitySettings = {
  voiceEnabled: boolean;
  speechRate: SpeechRateOption;
};

export const defaultAccessibilitySettings: AccessibilitySettings = {
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
