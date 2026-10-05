import {
  OFFLINE_DB,
  OFFLINE_KEY,
  OFFLINE_STORE,
  isDownloadableFile,
  type ModuleDownload,
  type OfflineModule
} from "@/shared/offline/module3-types";

async function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(OFFLINE_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error("Cierra las otras ventanas de Warmi e intenta otra vez."));
  });
}

async function transaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
) {
  const db = await database();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(OFFLINE_STORE, mode);
      const request = operation(tx.objectStore(OFFLINE_STORE));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("No se pudo guardar la descarga."));
    });
  } finally {
    db.close();
  }
}

export async function readDownload(): Promise<ModuleDownload | undefined> {
  return transaction("readonly", (store) => store.get(OFFLINE_KEY));
}

export async function verifiedDownload() {
  const download = await readDownload();
  if (!download) return undefined;
  if (!(await caches.has(download.cacheName))) return undefined;
  const cache = await caches.open(download.cacheName);
  for (const url of Object.values(download.assets)) {
    if (!(await cache.match(url))) return undefined;
  }
  return download;
}

function changed() {
  window.dispatchEvent(new Event("warmi-offline-download-change"));
}

async function removeDownloadUnlocked() {
  await transaction("readwrite", (store) => store.delete(OFFLINE_KEY));
  for (const name of await caches.keys()) {
    if (name.startsWith("warmi-module3-")) await caches.delete(name);
  }
  changed();
}

async function exclusive<T>(operation: () => Promise<T>) {
  return navigator.locks
    ? navigator.locks.request("warmi-module3-download", operation)
    : operation();
}

export async function removeDownload() {
  return exclusive(removeDownloadUnlocked);
}

export async function prepareOfflineShell() {
  if (
    !("serviceWorker" in navigator) ||
    !("caches" in window) ||
    !("indexedDB" in window)
  ) {
    throw new Error("Este navegador no permite descargar contenidos sin conexión.");
  }
  const registration = await navigator.serviceWorker.register("/warmi-sw.js", {
    scope: "/"
  });
  // Installation must finish before reporting a usable offline download.
  await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error("No se pudo preparar Warmi sin internet. Intenta nuevamente.")
          ),
        60000
      )
    )
  ]);
  if (!registration.active) throw new Error("No se pudo preparar Warmi sin internet.");
  await new Promise<void>((resolve, reject) => {
    const channel = new MessageChannel();
    const timeout = setTimeout(
      () => reject(new Error("No se pudo guardar la pantalla sin conexión.")),
      60000
    );
    channel.port1.onmessage = (event) => {
      clearTimeout(timeout);
      channel.port1.close();
      if (event.data.ok) resolve();
      else reject(new Error("No se pudo guardar la pantalla sin conexión."));
    };
    registration.active!.postMessage({ type: "PREPARE_SHELL" }, [channel.port2]);
  });
}

async function downloadModuleUnlocked(
  module: OfflineModule,
  onProgress: (percent: number, bytes: number) => void,
  signal?: AbortSignal
) {
  signal?.throwIfAborted();
  await prepareOfflineShell();
  const previous = await readDownload();
  const generation = crypto.randomUUID();
  const cacheName = `warmi-module3-${generation}`;
  const assets: Record<string, string> = {};
  const files = [
    ...new Map(
      [...module.lessons, ...(module.supportLessons ?? [])]
        .flatMap((lesson) => lesson.resources)
        .filter((resource) => isDownloadableFile(resource.file))
        .map((resource) => [resource.file!.id, resource.file!])
    ).values()
  ];
  const expectedBytes = files.reduce((total, file) => total + file.size, 0);
  const estimate = await navigator.storage?.estimate().catch(() => undefined);
  if (estimate?.quota && expectedBytes > estimate.quota - (estimate.usage ?? 0)) {
    throw new Error(
      "No hay espacio suficiente. Libera espacio en tu dispositivo e intenta nuevamente."
    );
  }
  // Remove abandoned generations left by a closed browser, preserving a complete download.
  for (const name of await caches.keys()) {
    if (name.startsWith("warmi-module3-") && name !== previous?.cacheName) {
      await caches.delete(name);
    }
  }
  const cache = await caches.open(cacheName);
  let bytes = 0;
  let complete = 0;
  try {
    for (const file of files) {
      const response = await fetch(
        `/api/learning/offline/${encodeURIComponent(module.courseId)}/files/${encodeURIComponent(file.id)}`,
        { cache: "no-store", signal }
      );
      if (!response.ok || !response.body || response.redirected)
        throw new Error(
          "No se pudo descargar un recurso. Revisa tu conexión y vuelve a intentar."
        );
      const contentType = response.headers.get("Content-Type")?.split(";")[0];
      if (contentType !== file.mimeType)
        throw new Error("El formato de un recurso no es compatible con la descarga.");
      const url = `/__warmi_offline__/${generation}/${file.id}`;
      const body = response.body.pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            bytes += chunk.byteLength;
            const percent = expectedBytes
              ? (bytes / expectedBytes) * 100
              : (complete / Math.max(files.length, 1)) * 100;
            onProgress(Math.min(99, Math.round(percent)), bytes);
            controller.enqueue(chunk);
          }
        })
      );
      await cache.put(
        url,
        new Response(body, { headers: { "Content-Type": file.mimeType } })
      );
      assets[file.id] = url;
      complete++;
    }
    const download: ModuleDownload = {
      ...module,
      assets,
      cacheName,
      bytes,
      downloadedAt: new Date().toISOString()
    };
    signal?.throwIfAborted();
    await transaction("readwrite", (store) => store.put(download, OFFLINE_KEY));
    if (previous && previous.cacheName !== cacheName)
      await caches.delete(previous.cacheName).catch(() => false);
    onProgress(100, bytes);
    changed();
    // A best-effort request; browsers may still evict site storage.
    void navigator.storage?.persist?.().catch(() => false);
    return download;
  } catch (error) {
    await caches.delete(cacheName);
    throw error;
  }
}

export async function downloadModule(
  module: OfflineModule,
  onProgress: (percent: number, bytes: number) => void,
  signal?: AbortSignal
) {
  return exclusive(() => downloadModuleUnlocked(module, onProgress, signal));
}

export function formatBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
