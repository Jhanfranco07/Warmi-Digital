import { NextResponse } from "next/server";

import { FileRepository } from "@/shared/repositories/file.repository";
import { requireRole } from "@/shared/server/auth/helpers";

function safeFileName(value: string | null | undefined, fallback: string) {
  const name = value?.split("/").pop()?.trim() || fallback;
  return name.replace(/[^\w.\- ]+/g, "").replace(/"/g, "");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  await requireRole(["ARTESANA", "FACILITADORA", "ADMIN"]);

  const { fileId } = await params;
  const file = await new FileRepository().findById(fileId);

  if (!file) {
    return NextResponse.json({ message: "Archivo no encontrado." }, { status: 404 });
  }

  const upstream = await fetch(file.url, { cache: "no-store" });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { message: "No se pudo cargar la previsualización." },
      { status: 502 }
    );
  }

  const metadata =
    file.metadata && typeof file.metadata === "object"
      ? (file.metadata as Record<string, unknown>)
      : null;
  const originalName =
    typeof metadata?.originalName === "string" ? metadata.originalName : null;

  const fileName = safeFileName(
    originalName ?? file.publicId,
    file.type === "DOCUMENT" ? "recurso.pdf" : "recurso"
  );
  const shouldDownload = new URL(request.url).searchParams.get("download") === "1";

  return new Response(upstream.body, {
    headers: {
      "Content-Type": file.mimeType || "application/octet-stream",
      "Content-Disposition": `${shouldDownload ? "attachment" : "inline"}; filename="${fileName}"`,
      "Cache-Control": "private, max-age=300"
    }
  });
}
