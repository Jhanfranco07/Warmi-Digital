const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function parseYouTubeVideoId(input: string) {
  try {
    const url = new URL(input.trim());
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        const videoId = url.searchParams.get("v");
        return videoId && YOUTUBE_ID_PATTERN.test(videoId) ? videoId : null;
      }

      const embedMatch = url.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/);
      return embedMatch?.[1] ?? null;
    }

    if (host === "youtu.be") {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return videoId && YOUTUBE_ID_PATTERN.test(videoId) ? videoId : null;
    }

    return null;
  } catch {
    return null;
  }
}

export function getYouTubeEmbedUrl(videoId: string) {
  return `https://www.youtube.com/embed/${videoId}`;
}
