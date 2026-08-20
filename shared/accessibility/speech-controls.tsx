"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";

import {
  type AccessibilitySettings,
  type SpeechRateOption,
  applyAccessibilitySettings,
  defaultAccessibilitySettings,
  readAccessibilitySettings,
  saveAccessibilitySettings,
  speechRateOptions
} from "@/shared/accessibility/accessibility-settings";
import { SpeechButton } from "@/shared/accessibility/speech-button";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/shared/lib/utils";

const voiceExample =
  "Hola. Soy la ayuda por voz de Warmi. Puedo explicarte las opciones de la pantalla y acompañarte mientras utilizas la plataforma.";

const visualPreferences: Array<{
  description: string;
  key: "largeText" | "highContrast" | "reduceMotion";
  label: string;
}> = [
  {
    key: "largeText",
    label: "Texto más grande",
    description: "Aumenta ligeramente el tamaño de lectura en toda la plataforma."
  },
  {
    key: "highContrast",
    label: "Alto contraste",
    description: "Refuerza colores, bordes y focos para distinguir mejor cada acción."
  },
  {
    key: "reduceMotion",
    label: "Reducir animaciones",
    description: "Disminuye movimientos y transiciones para navegar con más calma."
  }
];

export function AccessibilitySettingsPanel() {
  const [settings, setSettings] = useState<AccessibilitySettings>(
    defaultAccessibilitySettings
  );

  useEffect(() => {
    const currentSettings = readAccessibilitySettings();

    setSettings(currentSettings);
    applyAccessibilitySettings(currentSettings);
  }, []);

  function updateSettings(next: AccessibilitySettings) {
    setSettings(next);
    saveAccessibilitySettings(next);
    applyAccessibilitySettings(next);
  }

  return (
    <section className="rounded-[20px] border border-[#ecd0bd] bg-white p-6 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-ui text-xs font-extrabold uppercase tracking-[0.08em] text-[#b5245b]">
            Accesibilidad
          </p>
          <h2 className="mt-2 font-serif text-4xl font-bold text-[#7a1042]">
            Ayuda por voz
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#5b4a42]">
            Warmi puede leer en voz alta las instrucciones y explicarte qué puedes hacer
            en cada pantalla.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[#f0c7bb] bg-[#fffaf6] px-4 py-3">
          <Volume2 className="h-5 w-5 text-[#b5245b]" />
          <span className="font-ui text-sm font-extrabold text-[#1b1c1a]">
            {settings.voiceEnabled ? "Activada" : "Desactivada"}
          </span>
          <Switch
            checked={settings.voiceEnabled}
            onCheckedChange={(checked) =>
              updateSettings({ ...settings, voiceEnabled: checked })
            }
            aria-label="Activar o desactivar ayuda por voz"
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#f4d8cc] bg-[#fffdfb] p-5">
        <h3 className="font-serif text-2xl font-bold text-[#7a3100]">
          Velocidad de lectura
        </h3>
        <div className="mt-4 flex flex-wrap gap-3" role="radiogroup">
          {(Object.keys(speechRateOptions) as SpeechRateOption[]).map((option) => {
            const selected = settings.speechRate === option;

            return (
              <Button
                key={option}
                type="button"
                variant={selected ? "default" : "outline"}
                aria-pressed={selected}
                onClick={() => updateSettings({ ...settings, speechRate: option })}
                className={cn(
                  "min-h-touch-target rounded-full px-5",
                  selected
                    ? "bg-[#b5245b] text-white hover:bg-[#941747]"
                    : "border-[#ecd0bd] text-[#7a3100]"
                )}
              >
                {speechRateOptions[option].label}
              </Button>
            );
          })}
        </div>
        <div className="mt-5">
          <SpeechButton text={voiceExample} label="Escuchar ejemplo" />
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {visualPreferences.map((item) => {
          const enabled = settings[item.key];

          return (
            <div
              key={item.key}
              className={cn(
                "rounded-2xl border bg-[#fffaf6] p-4 transition-all duration-300",
                enabled
                  ? "border-[#b5245b] shadow-[0_14px_28px_rgba(181,36,91,0.12)]"
                  : "border-dashed border-[#ecd0bd]"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold text-[#7a3100]">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-[#7a5b4a]">
                    {item.description}
                  </p>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) =>
                    updateSettings({ ...settings, [item.key]: checked })
                  }
                  aria-label={`${enabled ? "Desactivar" : "Activar"} ${item.label}`}
                />
              </div>
              <span
                className={cn(
                  "mt-3 inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold",
                  enabled ? "bg-[#ffe8ef] text-[#b5245b]" : "bg-white text-[#8a7165]"
                )}
              >
                {enabled ? "Activado" : "Desactivado"}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
