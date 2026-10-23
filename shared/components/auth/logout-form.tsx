"use client";

import { useState, type ReactNode } from "react";
import { logout } from "@/shared/actions/auth/logout";
import { removeDownload } from "@/shared/offline/module3-storage";
import { clearReadingPositions } from "@/shared/learning/reading-position";

export function LogoutForm({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <form
      className={className}
      aria-busy={pending}
      action={async () => {
        setPending(true);
        setError("");
        try {
          if ("indexedDB" in window && "caches" in window) await removeDownload();
          clearReadingPositions();
        } catch {
          setPending(false);
          setError(
            "No se pudo borrar la descarga de este dispositivo. Intenta cerrar sesión nuevamente."
          );
          return;
        }
        await logout();
      }}
    >
      <fieldset className="contents" disabled={pending}>
        {children}
      </fieldset>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
