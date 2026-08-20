"use client";

import { Pause, Play, Square, Volume2 } from "lucide-react";

import { useSpeech } from "@/shared/accessibility/use-speech";
import { WarmiVoiceGuide } from "@/shared/accessibility/warmi-voice-guide";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type SpeechButtonProps = {
  text: string;
  label?: string;
  className?: string;
  compact?: boolean;
};

export function SpeechButton({
  text,
  label = "Escuchar",
  className,
  compact = false
}: SpeechButtonProps) {
  const {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isSupported,
    message,
    settings
  } = useSpeech();
  const disabled = !isSupported || !settings.voiceEnabled || !text.trim();

  if (!isSupported) {
    return (
      <p className="rounded-xl border border-[#f0c7bb] bg-white px-4 py-3 text-sm font-semibold text-[#7a3100]">
        Tu dispositivo no permite usar la ayuda por voz.
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <WarmiVoiceGuide compact={compact} />
        {!isSpeaking ? (
          <Button
            type="button"
            onClick={() => speak(text)}
            disabled={disabled}
            aria-label={label}
            className={cn(
              "min-h-touch-target rounded-full bg-[#b5245b] text-white shadow-[0_12px_28px_rgba(181,36,91,0.2)] hover:bg-[#941747] focus-visible:ring-[#b5245b]",
              compact ? "px-4 text-sm" : "px-5 text-base"
            )}
          >
            <Volume2 className="h-5 w-5" />
            {label}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              onClick={isPaused ? resume : pause}
              aria-label={isPaused ? "Continuar ayuda por voz" : "Pausar ayuda por voz"}
              className="min-h-touch-target rounded-full bg-[#b5245b] text-white hover:bg-[#941747] focus-visible:ring-[#b5245b]"
            >
              {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              {isPaused ? "Continuar" : "Pausar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={stop}
              aria-label="Detener ayuda por voz"
              className="min-h-touch-target rounded-full border-[#b5245b] text-[#b5245b] focus-visible:ring-[#b5245b]"
            >
              <Square className="h-5 w-5" />
              Detener
            </Button>
          </>
        )}
      </div>
      {message ? (
        <p className="text-sm font-semibold text-[#7a3100]" role="status">
          {message}
        </p>
      ) : null}
      {!settings.voiceEnabled ? (
        <p className="text-sm font-semibold text-[#7a3100]" role="status">
          La ayuda por voz está desactivada en tu perfil.
        </p>
      ) : null}
    </div>
  );
}
