const SHELL_CACHE = "warmi-offline-shell-v4";
const SHELL_URL = "/offline-learning";

async function prepareShell() {
  const cache = await caches.open(SHELL_CACHE);
  const response = await fetch(SHELL_URL, { cache: "reload", credentials: "omit" });
  if (!response.ok || response.redirected) throw new Error("Shell unavailable");
  const html = await response.clone().text();
  const urls = new Set([
    "/icons/faviconWarmi.png",
    "/images/accessibility/warmi-voice-guide1.png",
    "/images/accessibility/warmi-voice-guide2.png"
  ]);
  // Only public build assets are saved, never authenticated HTML or RSC payloads.
  for (const match of html.matchAll(/(?:src|href)="([^"<>]+)"/g)) {
    const url = new URL(match[1].replace(/&amp;/g, "&"), self.location.origin);
    if (url.origin === self.location.origin && url.pathname.startsWith("/_next/static/")) urls.add(url.href);
  }
  for (const url of urls) {
    const asset = await fetch(url, { cache: "reload", credentials: "omit" });
    if (!asset.ok) throw new Error("Asset unavailable");
    await cache.put(url, asset.clone());
    if (asset.headers.get("Content-Type")?.includes("text/css")) {
      const css = await asset.text();
      for (const match of css.matchAll(/url\(["']?([^\s)"']+)["']?\)/g)) {
        const fontUrl = new URL(match[1], new URL(url, self.location.origin));
        if (fontUrl.origin === self.location.origin && fontUrl.pathname.startsWith("/_next/static/")) {
          await cache.add(fontUrl.href);
        }
      }
    }
  }
  await cache.put(SHELL_URL, response);
}

self.addEventListener("install", (event) => {
  event.waitUntil(prepareShell().then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // Installation has already saved the new shell; downloaded media is never removed.
    for (const name of await caches.keys()) {
      if (name.startsWith("warmi-offline-shell-") && name !== SHELL_CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "PREPARE_SHELL") {
    event.waitUntil(prepareShell().then(
      () => event.ports[0]?.postMessage({ ok: true }),
      () => event.ports[0]?.postMessage({ ok: false })
    ));
  }
});

async function offlineShell() {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(SHELL_URL);
  return cached
    ? new Response(cached.body, { headers: cached.headers })
    : new Response("Este contenido todavía no está disponible sin conexión.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

async function offlineAsset(request) {
  const response = await caches.match(request.url, { ignoreSearch: true });
  if (!response) return new Response("Este contenido todavía no está disponible sin conexión.", { status: 404 });
  const range = request.headers.get("Range");
  if (!range) return response;
  // Video/PDF viewers request byte ranges even when the complete file is local.
  const blob = await response.blob();
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${blob.size}` } });
  const start = match[1] ? Number(match[1]) : Math.max(0, blob.size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), blob.size - 1) : blob.size - 1;
  if (start > end || start >= blob.size) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${blob.size}` } });
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "application/octet-stream",
      "Accept-Ranges": "bytes",
      "Content-Range": `bytes ${start}-${end}/${blob.size}`,
      "Content-Length": String(end - start + 1)
    }
  });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/__warmi_offline__/")) {
    event.respondWith(offlineAsset(request));
    return;
  }
  const voiceImage = url.searchParams.get("url");
  if (
    url.pathname === "/_next/image" &&
    ["/images/accessibility/warmi-voice-guide1.png", "/images/accessibility/warmi-voice-guide2.png"].includes(voiceImage)
  ) {
    event.respondWith(fetch(request).catch(async () => {
      const cache = await caches.open(SHELL_CACHE);
      return (await cache.match(voiceImage)) || new Response(null, { status: 404 });
    }));
    return;
  }
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
    return;
  }
  const entry = ["/", "/artesana", "/artesana/dashboard", SHELL_URL].includes(url.pathname);
  const learning = url.pathname === "/artesana/aprender" || url.pathname.startsWith("/artesana/aprender/");
  if (request.mode === "navigate" && (entry || learning)) {
    event.respondWith(self.navigator?.onLine === false
      ? offlineShell()
      : fetch(request).catch(offlineShell));
  }
});
