import { requireRole } from "@/shared/server/auth/helpers";
import { OfflineLearningService } from "@/shared/services/offline-learning.service";
import { localCurriculumResponse } from "@/shared/server/learning/local-curriculum-file";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string; fileId: string }> }
) {
  const session = await requireRole("ARTESANA");
  const { courseId, fileId } = await params;
  const file = await new OfflineLearningService().getAuthorizedFile(
    session.user.id,
    courseId,
    fileId
  );
  if (!file)
    return Response.json(
      { message: "Recurso no disponible para descargar." },
      { status: 404 }
    );
  const local = await localCurriculumResponse(file);
  if (local) return local;
  if (file.provider === "warmi-curriculum")
    return Response.json({ message: "Recurso no disponible." }, { status: 404 });
  const url = new URL(file.url);
  // This proxy is limited to stored Cloudinary assets, not arbitrary external URLs.
  if (
    url.protocol !== "https:" ||
    url.hostname !== "res.cloudinary.com" ||
    url.username ||
    url.password
  ) {
    return Response.json(
      { message: "Este recurso no es compatible con la descarga offline." },
      { status: 422 }
    );
  }
  try {
    const upstream = await fetch(url, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(120000)
    });
    if (!upstream.ok || !upstream.body)
      return Response.json(
        { message: "No se pudo descargar el recurso." },
        { status: 502 }
      );
    const mime = upstream.headers.get("Content-Type")?.split(";")[0];
    if (mime !== file.mimeType && mime !== "application/octet-stream") {
      return Response.json(
        { message: "El formato del recurso no coincide." },
        { status: 422 }
      );
    }
    return new Response(upstream.body, {
      headers: {
        "Content-Type": file.mimeType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        ...(upstream.headers.get("Content-Length")
          ? { "Content-Length": upstream.headers.get("Content-Length")! }
          : {})
      }
    });
  } catch {
    return Response.json(
      { message: "No se pudo descargar el recurso." },
      { status: 502 }
    );
  }
}
