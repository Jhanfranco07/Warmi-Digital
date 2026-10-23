import pdfjsPackage from "pdfjs-dist/package.json";

export const PDFJS_BASE = `/pdfjs/${pdfjsPackage.version}`;
let engine: Promise<typeof import("pdfjs-dist")> | undefined;

async function cachedResponse(url: string) {
  try {
    return await window.caches?.match(url);
  } catch {
    return undefined;
  }
}

export async function readPdfResponse(src: string, signal: AbortSignal) {
  const url = new URL(src, window.location.href);
  if (
    url.origin === window.location.origin &&
    url.pathname.startsWith("/__warmi_offline__/")
  ) {
    const cached = await cachedResponse(url.href);
    signal.throwIfAborted();
    if (cached) return cached;
  }
  return fetch(src, { signal, credentials: "same-origin" });
}

async function scriptResponse(url: string) {
  const response =
    (await cachedResponse(url)) ?? (await fetch(url, { credentials: "same-origin" }));
  if (!response.ok) throw new Error("PDF engine unavailable");
  const source = await response.text();
  if (source.trimStart().startsWith("<")) throw new Error("Invalid PDF engine");
  return URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
}

export function loadPdfEngine() {
  if (!engine) {
    const url = `${PDFJS_BASE}/pdf.min.mjs`;
    engine = (async () => {
      let library: typeof import("pdfjs-dist");
      try {
        library = await import(/* webpackIgnore: true */ url);
      } catch {
        const localUrl = await scriptResponse(url);
        try {
          library = await import(/* webpackIgnore: true */ localUrl);
        } finally {
          URL.revokeObjectURL(localUrl);
        }
      }
      // Bootstrap the module worker from saved bytes, not the browser's HTTP cache.
      // The shared engine owns this URL for the lifetime of the page.
      library.GlobalWorkerOptions.workerSrc = await scriptResponse(
        `${PDFJS_BASE}/pdf.worker.min.mjs`
      );
      return library;
    })().catch((error: unknown) => {
      engine = undefined;
      throw error;
    });
  }
  return engine;
}
