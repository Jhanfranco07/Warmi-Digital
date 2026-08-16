export function isSupportedImageUrl(url?: string | null): url is string {
  if (!url) return false;

  if (url.startsWith("/")) return true;

  try {
    return new URL(url).hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}
