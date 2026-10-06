"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { readDownloads, removeDownload } from "@/shared/offline/module3-storage";

export function OfflineRuntime() {
  const [online, setOnline] = useState(true);
  const [message, setMessage] = useState("");
  const { data: session, status } = useSession();
  useEffect(() => {
    const update = () => {
      setOnline(navigator.onLine);
      setMessage("");
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    function navigate(event: MouseEvent) {
      if (navigator.onLine || event.button !== 0) return;
      const anchor = (event.target as Element).closest?.(
        "a[href]"
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.closest("[data-warmi-offline-learning]")) return;
      const url = new URL(anchor.href);
      if (url.origin !== window.location.origin) {
        event.preventDefault();
        event.stopPropagation();
        setMessage("Este recurso necesita conexión a internet.");
      } else if (
        url.pathname !== location.pathname &&
        !url.pathname.startsWith("/__warmi_offline__/")
      ) {
        event.preventDefault();
        event.stopPropagation();
        if (
          url.pathname === "/artesana/aprender" ||
          url.pathname.startsWith("/artesana/aprender/")
        )
          location.assign(url.href);
        else setMessage("Este contenido todavía no está disponible sin conexión.");
      }
    }
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      document.removeEventListener("click", navigate, true);
    };
  }, []);

  useEffect(() => {
    if (
      !online ||
      status === "loading" ||
      !("indexedDB" in window) ||
      !("caches" in window)
    )
      return;
    let cancelled = false;
    async function checkOwner() {
      const downloads = await readDownloads();
      if (!downloads.length || cancelled) return;
      if (status === "authenticated") {
        if (downloads.some((download) => download.userId !== session?.user.id))
          await removeDownload();
      } else {
        // A failed network request is not proof that the user signed out.
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!response.ok) return;
        const confirmedSession = await response.json();
        if (!confirmedSession?.user && !cancelled) await removeDownload();
      }
    }
    void checkOwner().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [online, session?.user.id, status]);

  if (online && !message) return null;
  return (
    <aside
      role="status"
      aria-live="polite"
      className="sticky top-0 z-50 space-y-2 border-b border-[#b5245b]/20 bg-[#fff5f8] px-5 py-3 text-sm text-[#7a1042]"
    >
      {!online && (
        <p>
          Estás usando Warmi sin internet. Puedes seguir viendo tus contenidos
          descargados.
        </p>
      )}
      {message && <p>{message}</p>}
    </aside>
  );
}
