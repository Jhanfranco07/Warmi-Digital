"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Download, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import {
  downloadModule,
  formatBytes,
  moduleCachePrefix,
  readDownload,
  removeDownload,
  verifiedDownload
} from "@/shared/offline/module3-storage";
import {
  isDownloadableFile,
  isCurrentDownload,
  type OfflineModule
} from "@/shared/offline/module3-types";

export function ModuleDownload({ module }: { module: OfflineModule }) {
  const controller = useRef<AbortController | null>(null);
  const [status, setStatus] = useState<
    "idle" | "downloading" | "ready" | "outdated" | "error"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [bytes, setBytes] = useState(0);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(true);
  const [checking, setChecking] = useState(true);
  const [hasLocalData, setHasLocalData] = useState(false);
  const files = [
    ...new Map(
      [...module.lessons, ...(module.supportLessons ?? [])]
        .flatMap((lesson) => lesson.resources)
        .filter((resource) => isDownloadableFile(resource.file))
        .map((resource) => [resource.file!.id, resource.file!])
    ).values()
  ];
  const approximateSize = files.reduce((total, file) => total + file.size, 0);
  const revision = JSON.stringify(module);

  useEffect(() => {
    const expected = JSON.parse(revision) as OfflineModule;
    const connection = () => setOnline(navigator.onLine);
    connection();
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    void verifiedDownload(expected.moduleId)
      .then(async (download) => {
        setHasLocalData(
          Boolean(await readDownload(expected.moduleId)) ||
            (await caches.keys()).some((name) =>
              name.startsWith(moduleCachePrefix(expected.moduleId))
            )
        );
        if (
          download?.moduleId === expected.moduleId &&
          download.userId === expected.userId
        ) {
          setStatus(isCurrentDownload(download, expected) ? "ready" : "outdated");
          setBytes(download.bytes);
        }
      })
      .catch(() => setError("Este navegador no permite guardar la descarga."))
      .finally(() => setChecking(false));
    return () => {
      controller.current?.abort();
      window.removeEventListener("online", connection);
      window.removeEventListener("offline", connection);
    };
  }, [revision]);

  async function download() {
    setStatus("downloading");
    setError("");
    setProgress(0);
    controller.current = new AbortController();
    try {
      await downloadModule(
        module,
        (percent, downloadedBytes) => {
          setProgress(percent);
          setBytes(downloadedBytes);
        },
        controller.current.signal
      );
      setStatus("ready");
      setHasLocalData(true);
    } catch (cause) {
      setStatus("error");
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo descargar. Intenta nuevamente."
      );
    }
  }

  async function remove() {
    try {
      await removeDownload(module.moduleId);
      setStatus("idle");
      setHasLocalData(false);
      setBytes(0);
      setError("");
    } catch {
      setError("No se pudo eliminar la descarga. Intenta nuevamente.");
    }
  }

  return (
    <div
      id={`modulo-${module.moduleId}`}
      className="mb-5 space-y-3 border-y border-[#f0c7bb] py-4"
    >
      <p
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 text-sm font-semibold"
      >
        {status === "ready" && <CheckCircle2 className="h-5 w-5 text-green-700" />}
        {status === "ready"
          ? "Disponible sin conexión"
          : status === "outdated"
            ? "Hay contenido nuevo. Actualiza tu descarga con conexión. La anterior sigue disponible."
            : status === "downloading"
              ? "Descargando..."
              : status === "error"
                ? "Error de descarga"
                : "No descargado"}
      </p>
      <p className="text-sm text-muted-foreground">
        {status === "ready"
          ? formatBytes(bytes)
          : `Tamaño aproximado: ${formatBytes(approximateSize + new TextEncoder().encode(JSON.stringify(module)).byteLength)}`}
      </p>
      {status === "downloading" && (
        <div className="space-y-2">
          <Progress value={progress} aria-label={`Descarga ${progress}%`} />
          <p className="text-sm">
            {progress}% · {formatBytes(bytes)}
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {status !== "ready" && (
          <Button
            type="button"
            onClick={download}
            disabled={
              checking ||
              !online ||
              status === "downloading" ||
              Boolean(error && status === "idle")
            }
            className="h-auto min-h-12 whitespace-normal text-left"
          >
            <Download className="h-5 w-5 shrink-0" />
            {status === "outdated"
              ? "Actualizar descarga"
              : "Descargar para usar sin internet"}
          </Button>
        )}
        {hasLocalData && status !== "downloading" && (
          <Button type="button" variant="outline" onClick={remove}>
            <Trash2 className="h-5 w-5" />
            Eliminar descarga
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
