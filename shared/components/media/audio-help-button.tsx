"use client";

import { useRef, useState } from "react";
import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";

import { cn } from "@/shared/lib/utils";

type AudioHelpButtonProps = {
  audioUrl?: string | null;
  title?: string;
  description?: string;
  className?: string;
};

export function AudioHelpButton({
  audioUrl,
  title = "Escuchar explicacion",
  description,
  className
}: AudioHelpButtonProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  if (!audioUrl) return null;

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    await audio.play();
    setPlaying(true);
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary",
        className
      )}
    >
      <Volume2 className="h-4 w-4" aria-hidden="true" />
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-1"
        aria-label={playing ? "Pausar audio de apoyo" : title}
      >
        {playing ? (
          <Pause className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Play className="h-4 w-4" aria-hidden="true" />
        )}
        {title}
      </button>
      <button
        type="button"
        aria-label="Repetir audio"
        onClick={() => {
          if (!audioRef.current) return;
          audioRef.current.currentTime = 0;
          void audioRef.current.play();
          setPlaying(true);
        }}
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
      </button>
      {description ? <span className="sr-only">{description}</span> : null}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="none"
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}
