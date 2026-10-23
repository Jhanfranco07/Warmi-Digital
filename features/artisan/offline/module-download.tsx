"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, CheckCircle2, Download, Trash2, Pause } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { selectSpeechVoice } from "@/shared/accessibility/speech-voice";
import {
  downloadModule,
  formatBytes,
  moduleCachePrefix,
  readDownload,
  readDownloadAttempt,
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
    "idle" | "downloading" | "ready" | "outdated" | "paused" | "incomplete" | "error"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [bytes, setBytes] = useState(0);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(true);
  const [checking, setChecking] = useState(true);
  const [hasLocalData, setHasLocalData] = useState(false);
  const [hasCompleteDownload, setHasCompleteDownload] = useState(false);
  const [voiceWarning, setVoiceWarning] = useState("");
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
  const moduleHref = module.lessons[0]
    ? `/artesana/aprender/${module.courseId}/lecciones/${module.lessons[0].id}`
    : `/artesana/aprender/${module.courseId}`;

  useEffect(() => {
    const synthesis = window.speechSynthesis;
    const checkVoice = () => {
      setVoiceWarning(
        synthesis && selectSpeechVoice(synthesis.getVoices(), "auto", false, true)
          ? ""
          : "Para escuchar sin internet, instala una voz en español en los ajustes de tu dispositivo."
      );
    };
    checkVoice();
    synthesis?.addEventListener("voiceschanged", checkVoice);
    return () => synthesis?.removeEventListener("voiceschanged", checkVoice);
  }, []);

  useEffect(() => {
    let active = true;
    setChecking(true);
    const expected = JSON.parse(revision) as OfflineModule;
    const connection = () => setOnline(navigator.onLine);
    connection();
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    void verifiedDownload(expected.moduleId)
      .then(async (download) => {
        const attempt = await readDownloadAttempt(expected);
        const local =
          Boolean(await readDownload(expected.moduleId)) ||
          (await caches.keys()).some((name) =>
            name.startsWith(moduleCachePrefix(expected.moduleId))
          );
        if (!active) return;
        setStatus("idle");
        setError("");
        setHasCompleteDownload(false);
        setHasLocalData(local);
        if (
          download?.moduleId === expected.moduleId &&
          download.userId === expected.userId
        ) {
          setStatus(isCurrentDownload(download, expected) ? "ready" : "outdated");
          setBytes(download.bytes);
          setHasCompleteDownload(true);
        }
        if (attempt) {
          setStatus(attempt.status);
          setBytes(attempt.bytes);
          setProgress(
            Math.min(
              99,
              Math.round(approximateSize ? (attempt.bytes / approximateSize) * 100 : 0)
            )
          );
        }
      })
      .catch(() => {
        if (active) setError("Este navegador no permite guardar la descarga.");
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
      controller.current?.abort();
      controller.current = null;
      window.removeEventListener("online", connection);
      window.removeEventListener("offline", connection);
    };
  }, [revision, approximateSize]);

  async function download() {
    setStatus("downloading");
    setError("");
    setProgress(0);
    const operation = new AbortController();
    controller.current = operation;
    try {
      await downloadModule(
        module,
        (percent, downloadedBytes) => {
          if (controller.current !== operation) return;
          setProgress(percent);
          setBytes(downloadedBytes);
        },
        operation.signal
      );
      if (controller.current !== operation) return;
      setStatus("ready");
      setHasLocalData(true);
      setHasCompleteDownload(true);
    } catch (cause) {
      if (controller.current !== operation) return;
      const attempt = await readDownloadAttempt(module).catch(() => null);
      if (controller.current !== operation) return;
      const paused = operation.signal.reason === "warmi-download-paused";
      setStatus(paused ? "paused" : attempt ? "incomplete" : "error");
      if (attempt) {
        setBytes(attempt.bytes);
        setProgress(
          Math.min(
            99,
            Math.round(approximateSize ? (attempt.bytes / approximateSize) * 100 : 0)
          )
        );
      }
      if ("caches" in window) {
        void caches
          .keys()
          .then((names) =>
            setHasLocalData(
              names.some((name) => name.startsWith(moduleCachePrefix(module.moduleId)))
            )
          )
          .catch(() => undefined);
      }
      setError(
        paused
          ? ""
          : cause instanceof DOMException && cause.name === "QuotaExceededError"
            ? "No hay espacio suficiente. Libera espacio en tu dispositivo e intenta nuevamente."
            : cause instanceof Error
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
      setHasCompleteDownload(false);
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
                : status === "paused"
                  ? "Descarga pausada"
                  : status === "incomplete"
                    ? "Descarga incompleta"
                    : "No descargado"}
      </p>
      <p className="text-sm text-muted-foreground">
        {status === "ready"
          ? formatBytes(bytes)
          : `Tamaño aproximado: ${formatBytes(approximateSize + new TextEncoder().encode(JSON.stringify(module)).byteLength)}`}
      </p>
      <p className="text-xs text-muted-foreground">
        La aplicación y sus imágenes ocupan espacio adicional y se conservan al eliminar
        el módulo.
      </p>
      {voiceWarning && (
        <p role="status" className="text-sm text-[#7a1042]">
          {voiceWarning}
        </p>
      )}
      {hasCompleteDownload &&
        (status === "paused" || status === "incomplete" || status === "error") && (
          <p className="text-sm text-[#24756f]">
            La descarga anterior sigue disponible sin conexión.
          </p>
        )}
      {(status === "downloading" || status === "paused" || status === "incomplete") && (
        <div className="space-y-2">
          <Progress value={progress} aria-label={`Descarga ${progress}%`} />
          <p className="text-sm">
            {progress}% · {formatBytes(bytes)}
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {status === "downloading" && (
          <Button
            type="button"
            variant="outline"
            onClick={() => controller.current?.abort("warmi-download-paused")}
          >
            <Pause aria-hidden="true" className="h-5 w-5" />
            Pausar descarga
          </Button>
        )}
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
              : status === "paused" || status === "incomplete"
                ? "Continuar descarga"
                : status === "error"
                  ? "Reintentar descarga"
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
      {hasCompleteDownload && (
        <a
          href={moduleHref}
          className="inline-flex min-h-12 items-center gap-2 font-bold text-[#b5245b]"
        >
          <BookOpen aria-hidden="true" className="h-5 w-5" />
          Abrir módulo descargado
        </a>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
