"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, PlayCircle } from "lucide-react";
import { module1YouTubeEmbed } from "@/shared/learning/module1";

type Props = {
  sourceType: "CLOUDINARY" | "YOUTUBE";
  url: string;
  title: string;
  action: string;
  author?: string;
};

export function LearningVideo({ sourceType, url, title, action, author }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <details
      name="learning-video"
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group mt-4"
    >
      <summary
        aria-expanded={open}
        className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-md border border-[#b5245b] px-4 py-3 text-base font-bold text-[#b5245b] hover:bg-[#fff0f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b5245b] [&::-webkit-details-marker]:hidden"
      >
        <span className="flex min-w-0 items-center gap-3">
          <PlayCircle className="h-5 w-5 shrink-0" />
          {action}
        </span>
        <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      {open && (
        <div className="mt-4 space-y-3">
          {sourceType === "CLOUDINARY" ? (
            <video
              src={url}
              controls
              playsInline
              preload="metadata"
              aria-label={title}
              className="aspect-video w-full rounded-lg bg-black"
            >
              <a href={url}>Abrir video</a>
            </video>
          ) : (
            <>
              <p className="text-sm text-[#526361]">Video de apoyo · {author}</p>
              <iframe
                src={module1YouTubeEmbed(url)}
                title={title}
                className="aspect-video w-full rounded-lg bg-black"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 text-sm font-bold text-[#b5245b] underline underline-offset-4"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir este video en YouTube
              </a>
            </>
          )}
        </div>
      )}
    </details>
  );
}
