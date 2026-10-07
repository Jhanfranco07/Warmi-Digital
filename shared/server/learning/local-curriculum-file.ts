import { readFile } from "node:fs/promises";
import path from "node:path";
import { curriculumFile } from "@/shared/learning/curriculum";

// Only reviewed, versioned source assets can be read; URLs never become arbitrary paths.
export async function localCurriculumResponse(file: {
  url: string;
  provider: string;
  mimeType: string;
}) {
  const guide = file.provider === "warmi-curriculum" && curriculumFile(file.url);
  if (!guide || file.mimeType !== "image/webp") return null;
  const root = path.resolve(process.cwd(), "public/images/learning/modules");
  const target = path.resolve(root, path.basename(guide.src));
  if (path.dirname(target) !== root) return null;
  const bytes = await readFile(target);
  return new Response(bytes, {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(bytes.length),
      "Cache-Control": "private, no-store"
    }
  });
}
