import { getYouTubeEmbedUrl } from "@/shared/lib/youtube";
import { cn } from "@/shared/lib/utils";

type YouTubePlayerProps = {
  videoId: string;
  title: string;
  className?: string;
};

export function YouTubePlayer({ videoId, title, className }: YouTubePlayerProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-black shadow-soft",
        className
      )}
    >
      <iframe
        className="aspect-video w-full"
        src={getYouTubeEmbedUrl(videoId)}
        title={title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
