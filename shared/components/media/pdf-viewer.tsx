"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize
} from "lucide-react";
import type { PDFDocumentProxy, PDFDocumentLoadingTask, RenderTask } from "pdfjs-dist";
import { loadPdfEngine, PDFJS_BASE, readPdfResponse } from "@/shared/lib/pdfjs";
import { readPosition, writePosition } from "@/shared/learning/reading-position";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/shared/components/ui/tooltip";

const controlStyle =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#dfc7d2] bg-white text-[#9c174e] hover:bg-[#fff0f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9c174e] disabled:cursor-default disabled:opacity-40";

export function PdfViewer({
  src,
  title,
  fullScreen = false
}: {
  src: string;
  title: string;
  fullScreen?: boolean;
}) {
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [text, setText] = useState("");
  const [rendered, setRendered] = useState("");
  const renderKey = `${pageNumber}/${zoom}/${width}`;
  const ready = Boolean(document && !loading && rendered === renderKey);
  const container = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.floor(entry.contentRect.width))
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const abort = new AbortController();
    let task: PDFDocumentLoadingTask | undefined;
    setDocument(null);
    setPageNumber(1);
    setZoom(1);
    setError("");
    setLoading(true);
    setText("");
    void (async () => {
      try {
        const [library, response] = await Promise.all([
          loadPdfEngine(),
          readPdfResponse(src, abort.signal)
        ]);
        if (!response.ok) throw new Error("PDF unavailable");
        const data = new Uint8Array(await response.arrayBuffer());
        if (abort.signal.aborted) return;
        task = library.getDocument({
          data,
          enableXfa: false,
          cMapUrl: `${PDFJS_BASE}/cmaps/`,
          cMapPacked: true,
          standardFontDataUrl: `${PDFJS_BASE}/standard_fonts/`,
          wasmUrl: `${PDFJS_BASE}/wasm/`,
          iccUrl: `${PDFJS_BASE}/iccs/`
        });
        const pdf = await task.promise;
        if (!abort.signal.aborted) {
          setPageNumber(readPosition(`pdf:${title}`, pdf.numPages - 1) + 1);
          setDocument(pdf);
        }
      } catch {
        if (!abort.signal.aborted) {
          setLoading(false);
          setError(
            "No se pudo abrir la guía. Verifica que esté descargada e intenta nuevamente."
          );
        }
      }
    })();
    return () => {
      abort.abort();
      void task?.destroy().catch(() => {});
    };
  }, [src, retry, title]);

  useEffect(() => {
    if (!document || !width || !canvas.current) return;
    let cancelled = false;
    let render: RenderTask | undefined;
    setLoading(true);
    setError("");
    setText("");
    const element = canvas.current;
    void (async () => {
      try {
        const page = await document.getPage(pageNumber);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({
          scale:
            (Math.max(1, fullScreen ? Math.min(960, width - 16) : width - 16) /
              base.width) *
            zoom
        });
        // Bound bitmap size on phones while allowing horizontal scrolling at higher zoom.
        const pixels = Math.min(
          window.devicePixelRatio || 1,
          2,
          4096 / Math.max(viewport.width, viewport.height)
        );
        element.width = Math.ceil(viewport.width * pixels);
        element.height = Math.ceil(viewport.height * pixels);
        element.style.width = `${Math.ceil(viewport.width)}px`;
        element.style.height = `${Math.ceil(viewport.height)}px`;
        const context = element.getContext("2d");
        if (!context) throw new Error("Canvas unavailable");
        render = page.render({
          canvas: element,
          canvasContext: context,
          viewport,
          transform: pixels === 1 ? undefined : [pixels, 0, 0, pixels, 0, 0]
        });
        await render.promise;
        if (cancelled) return;
        setLoading(false);
        setRendered(`${pageNumber}/${zoom}/${width}`);
        writePosition(`pdf:${title}`, pageNumber - 1);
        const content = await page.getTextContent().catch(() => null);
        if (!cancelled)
          setText(
            content?.items.map((item) => ("str" in item ? item.str : "")).join(" ") ?? ""
          );
      } catch {
        if (!cancelled) {
          setLoading(false);
          setError("No se pudo mostrar esta página. Intenta nuevamente.");
        }
      }
    })();
    return () => {
      cancelled = true;
      render?.cancel();
    };
  }, [document, pageNumber, width, zoom, title, fullScreen]);

  function control(
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
    disabled = false
  ) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className={controlStyle}
          >
            {icon}
          </button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <section
      data-pdf-viewer
      data-pdf-src={src}
      aria-label={`Visor PDF: ${title}`}
      className={
        fullScreen
          ? "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]"
          : "min-w-0 space-y-3"
      }
    >
      <TooltipProvider delayDuration={300}>
        <div
          role="toolbar"
          aria-label="Controles del PDF"
          className={`flex shrink-0 flex-wrap items-center justify-between gap-2 bg-[#f5efec] p-2 ${fullScreen ? "border-b border-[#dfc7d2] sm:px-6" : "rounded-md"}`}
        >
          <div className="flex items-center gap-1">
            {control(
              "Página anterior",
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />,
              () => setPageNumber((n) => Math.max(1, n - 1)),
              !document || loading || pageNumber === 1
            )}
            <p
              aria-live="polite"
              className="min-w-16 text-center text-sm font-bold text-[#344441]"
            >
              {document ? `${pageNumber} de ${document.numPages}` : "PDF"}
            </p>
            {control(
              "Página siguiente",
              <ChevronRight aria-hidden="true" className="h-5 w-5" />,
              () => setPageNumber((n) => Math.min(document?.numPages ?? 1, n + 1)),
              !document || loading || pageNumber === document.numPages
            )}
          </div>
          <div className="flex items-center gap-1">
            {control(
              "Reducir",
              <ZoomOut aria-hidden="true" className="h-5 w-5" />,
              () => setZoom((n) => Math.max(1, n - 0.25)),
              !document || loading || zoom <= 1
            )}
            {control(
              "Ampliar",
              <ZoomIn aria-hidden="true" className="h-5 w-5" />,
              () => setZoom((n) => Math.min(3, n + 0.25)),
              !document || loading || zoom >= 3
            )}
            {control(
              "Ajustar al ancho",
              <Maximize aria-hidden="true" className="h-5 w-5" />,
              () => setZoom(1),
              !document || loading || zoom === 1
            )}
          </div>
        </div>
      </TooltipProvider>
      <div
        ref={container}
        className={
          fullScreen
            ? "relative min-h-0 w-full flex-1 overflow-auto overscroll-contain bg-[#eeeae7] p-2 sm:p-4"
            : "relative min-h-64 w-full overflow-auto rounded-md border border-[#dfc7d2] bg-[#eeeae7] p-2"
        }
        aria-busy={!ready && !error}
      >
        {!ready && !error && (
          <p
            role="status"
            className="flex items-center justify-center gap-2 py-4 text-sm text-[#344441]"
          >
            <LoaderCircle
              aria-hidden="true"
              className="h-5 w-5 animate-spin motion-reduce:animate-none"
            />
            Cargando guía…
          </p>
        )}
        <canvas
          ref={canvas}
          role="img"
          aria-label={`${title}. Página ${pageNumber}${document ? ` de ${document.numPages}` : ""}`}
          className={`mx-auto bg-white shadow-sm ${!ready || error ? "hidden" : "block"}`}
        />
        {error && (
          <div role="alert" className="space-y-3 p-3 text-[#800041]">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setRetry((n) => n + 1)}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[#9c174e] px-4 font-bold"
            >
              <RotateCcw aria-hidden="true" className="h-5 w-5" />
              Reintentar
            </button>
          </div>
        )}
      </div>
      {text && (
        <details
          className={`border-y border-[#dfc7d2] text-sm ${fullScreen ? "max-h-40 shrink-0 overflow-auto px-4" : ""}`}
        >
          <summary className="min-h-11 cursor-pointer py-3 font-bold text-[#006b5a]">
            Texto de esta página
          </summary>
          <p className="whitespace-pre-wrap pb-4">{text}</p>
        </details>
      )}
    </section>
  );
}
