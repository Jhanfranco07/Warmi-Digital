import {
  OFFLINE_DB,
  OFFLINE_KEY,
  OFFLINE_STORE,
  isDownloadableFile,
  isOfflineModule,
  type ModuleDownload,
  type OfflineModule
} from "@/shared/offline/module3-types";
import { LEARNING_PROGRAM } from "@/shared/learning/program";
import { clearReadingPositions } from "@/shared/learning/reading-position";
import {
  downloadSignature,
  fileSignature,
  isMatchingCheckpoint,
  type DownloadCheckpoint
} from "@/shared/offline/download-checkpoint";

const defaultModuleId = LEARNING_PROGRAM.modules[2].id;
const downloadKey = (moduleId: string) => `module:${moduleId}`;
export function moduleCachePrefix(moduleId: string) {
  return `warmi-learning-module-${moduleId}-`;
}
export function isLearningCache(name: string) {
  return name.startsWith("warmi-learning-module-") || name.startsWith("warmi-module3-");
}
function belongsToModule(name: string, moduleId: string) {
  return (
    name.startsWith(moduleCachePrefix(moduleId)) ||
    (moduleId === defaultModuleId && name.startsWith("warmi-module3-"))
  );
}

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

export async function readDownloads(): Promise<ModuleDownload[]> {
  const records = await transaction<ModuleDownload[]>("readonly", (store) =>
    store.getAll()
  );
  return [
    ...new Map(
      records
        .sort((a, b) => a.downloadedAt.localeCompare(b.downloadedAt))
        .map((item) => [item.moduleId, item])
    ).values()
  ];
}

export async function readDownload(
  moduleId: string = defaultModuleId
): Promise<ModuleDownload | undefined> {
  return (await readDownloads()).find((item) => item.moduleId === moduleId);
}

export async function verifiedDownload(moduleId: string = defaultModuleId) {
  const download = await readDownload(moduleId);
  if (!download) return undefined;
  if (!(await caches.has(download.cacheName))) return undefined;
  const cache = await caches.open(download.cacheName);
  for (const url of Object.values(download.assets)) {
    if (!(await cache.match(url))) return undefined;
  }
  return download;
}

export async function verifiedDownloads() {
  const records = await readDownloads();
  const verified = await Promise.all(
    records.map((record) => verifiedDownload(record.moduleId))
  );
  return verified.filter((item): item is ModuleDownload => Boolean(item));
}

export async function readDownloadAttempt(module: OfflineModule) {
  const complete = await readDownload(module.moduleId);
  const files = [
    ...new Map(
      [...module.lessons, ...(module.supportLessons ?? [])]
        .flatMap((lesson) => lesson.resources)
        .filter((resource) => isDownloadableFile(resource.file))
        .map((resource) => [resource.file!.id, resource.file!])
    ).values()
  ];
  for (const name of await caches.keys()) {
    if (!belongsToModule(name, module.moduleId) || name === complete?.cacheName) continue;
    const cache = await caches.open(name);
    const checkpoint: unknown = await (
      await cache.match("/__warmi_offline__/download-checkpoint")
    )
      ?.json()
      .catch(() => null);
    if (
      !isMatchingCheckpoint(checkpoint, module) ||
      name !== `${moduleCachePrefix(module.moduleId)}${checkpoint.generation}`
    )
      continue;
    let bytes = 0;
    for (const file of files) {
      const response = await cache.match(
        `/__warmi_offline__/${checkpoint.generation}/${file.id}`
      );
      if (response) bytes += (await response.blob()).size;
    }
    return {
      status:
        checkpoint.state === "paused" ? ("paused" as const) : ("incomplete" as const),
      bytes
    };
  }
  return null;
}

export async function hasForeignDownloads(userId: string) {
  const records = await readDownloads();
  if (records.some((record) => record.userId !== userId)) return true;
  const complete = new Set(records.map((record) => record.cacheName));
  for (const name of await caches.keys()) {
    if (!isLearningCache(name) || complete.has(name)) continue;
    const cache = await caches.open(name);
    const checkpoint = await (
      await cache.match("/__warmi_offline__/download-checkpoint")
    )
      ?.json()
      .catch(() => null);
    if (checkpoint?.userId !== userId) return true;
  }
  return false;
}

function changed() {
  window.dispatchEvent(new Event("warmi-offline-download-change"));
}

async function removeDownloadUnlocked(moduleId?: string) {
  if (moduleId) {
    await transaction("readwrite", (store) => store.delete(downloadKey(moduleId)));
    const legacy = await transaction<ModuleDownload | undefined>("readonly", (store) =>
      store.get(OFFLINE_KEY)
    );
    if (legacy?.moduleId === moduleId)
      await transaction("readwrite", (store) => store.delete(OFFLINE_KEY));
  } else await transaction("readwrite", (store) => store.clear());
  for (const name of await caches.keys()) {
    if (moduleId ? belongsToModule(name, moduleId) : isLearningCache(name))
      await caches.delete(name);
  }
  if (!moduleId || moduleId === defaultModuleId) clearReadingPositions();
  changed();
}

async function exclusive<T>(operation: () => Promise<T>) {
  return navigator.locks
    ? navigator.locks.request("warmi-learning-downloads", operation)
    : operation();
}

export async function removeDownload(moduleId?: string) {
  return exclusive(() => removeDownloadUnlocked(moduleId));
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
  const previous = await readDownload(module.moduleId);
  const checkpointUrl = "/__warmi_offline__/download-checkpoint";
  let generation = crypto.randomUUID() as string;
  let cacheName = `${moduleCachePrefix(module.moduleId)}${generation}`;
  for (const name of await caches.keys()) {
    if (!belongsToModule(name, module.moduleId) || name === previous?.cacheName) continue;
    const candidate = await caches.open(name);
    const saved: unknown = await (
      await candidate.match(checkpointUrl)
    )
      ?.json()
      .catch(() => null);
    if (
      isMatchingCheckpoint(saved, module) &&
      name === `${moduleCachePrefix(module.moduleId)}${saved.generation}`
    ) {
      cacheName = name;
      generation = saved.generation;
      break;
    }
  }
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
  // Remove abandoned generations left by a closed browser, preserving a complete download.
  for (const name of await caches.keys()) {
    if (
      belongsToModule(name, module.moduleId) &&
      name !== previous?.cacheName &&
      name !== cacheName
    ) {
      await caches.delete(name);
    }
  }
  const cache = await caches.open(cacheName);
  const checkpoint: DownloadCheckpoint = {
    userId: module.userId,
    courseId: module.courseId,
    moduleId: module.moduleId,
    generation,
    signature: downloadSignature(module),
    state: "incomplete"
  };
  await cache.put(checkpointUrl, Response.json(checkpoint));
  const previousCache =
    previous?.userId === module.userId && (await caches.has(previous.cacheName))
      ? await caches.open(previous.cacheName)
      : undefined;
  const previousFiles = new Map(
    [...(previous?.lessons ?? []), ...(previous?.supportLessons ?? [])]
      .flatMap((lesson) => lesson.resources)
      .filter((r) => r.file)
      .map((r) => [r.file!.id, r.file!])
  );
  let bytes = 0;
  let complete = 0;
  try {
    for (const file of files) {
      signal?.throwIfAborted();
      const url = `/__warmi_offline__/${generation}/${file.id}`;
      let cached = await cache.match(url);
      const oldFile = previousFiles.get(file.id);
      if (
        !cached &&
        previousCache &&
        file.revision &&
        oldFile &&
        fileSignature(oldFile) === fileSignature(file)
      ) {
        const oldUrl = previous?.assets[file.id];
        if (oldUrl) {
          const response = await previousCache.match(oldUrl);
          if (response) {
            await cache.put(url, response.clone());
            cached = response;
          }
        }
      }
      if (cached) {
        bytes += (await cached.blob()).size;
        assets[file.id] = url;
        complete++;
        onProgress(
          Math.min(
            99,
            Math.round(
              expectedBytes
                ? (bytes / expectedBytes) * 100
                : (complete / Math.max(files.length, 1)) * 100
            )
          ),
          bytes
        );
        continue;
      }
      const estimate = await navigator.storage?.estimate().catch(() => undefined);
      if (estimate?.quota && file.size > estimate.quota - (estimate.usage ?? 0)) {
        throw new Error(
          "No hay espacio suficiente. Libera espacio en tu dispositivo e intenta nuevamente."
        );
      }
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
    await transaction("readwrite", (store) => {
      const saved = store.put(download, downloadKey(module.moduleId));
      const legacy = store.get(OFFLINE_KEY);
      legacy.onsuccess = () => {
        if ((legacy.result as ModuleDownload | undefined)?.moduleId === module.moduleId)
          store.delete(OFFLINE_KEY);
      };
      return saved;
    });
    if (previous && previous.cacheName !== cacheName)
      await caches.delete(previous.cacheName).catch(() => false);
    onProgress(100, bytes);
    await cache.delete(checkpointUrl).catch(() => false);
    changed();
    // A best-effort request; browsers may still evict site storage.
    void navigator.storage?.persist?.().catch(() => false);
    return download;
  } catch (error) {
    // Cache.put commits complete responses only; keep them for a later retry.
    checkpoint.state =
      signal?.reason === "warmi-download-paused" ? "paused" : "incomplete";
    await cache.put(checkpointUrl, Response.json(checkpoint)).catch(() => undefined);
    throw error;
  }
}

export async function downloadModule(
  module: OfflineModule,
  onProgress: (percent: number, bytes: number) => void,
  signal?: AbortSignal
) {
  if (!isOfflineModule(module.moduleId))
    throw new Error("Este módulo no está habilitado para descargar sin conexión.");
  return exclusive(() => downloadModuleUnlocked(module, onProgress, signal));
}

export function formatBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
