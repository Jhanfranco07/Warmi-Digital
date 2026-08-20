"use client";

import { useEffect } from "react";

import {
  applyAccessibilitySettings,
  readAccessibilitySettings
} from "@/shared/accessibility/accessibility-settings";

export function AccessibilityPreferencesProvider() {
  useEffect(() => {
    function syncSettings() {
      applyAccessibilitySettings(readAccessibilitySettings());
    }

    syncSettings();
    window.addEventListener("storage", syncSettings);
    window.addEventListener("warmi-accessibility-settings-change", syncSettings);

    return () => {
      window.removeEventListener("storage", syncSettings);
      window.removeEventListener("warmi-accessibility-settings-change", syncSettings);
    };
  }, []);

  return null;
}
