import pdfjsPackage from "pdfjs-dist/package.json";

export const PDFJS_BASE = `/pdfjs/${pdfjsPackage.version}`;
let engine: Promise<typeof import("pdfjs-dist")> | undefined;

export function loadPdfEngine() {
  if (!engine) {
    const url = `${PDFJS_BASE}/pdf.min.mjs`;
    engine = import(/* webpackIgnore: true */ url)
      .then((library: typeof import("pdfjs-dist")) => {
        library.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.mjs`;
        return library;
      })
      .catch((error: unknown) => {
        engine = undefined;
        throw error;
      });
  }
  return engine;
}
