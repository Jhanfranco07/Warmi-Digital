"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type MessageAutoRefreshProps = {
  intervalMs?: number;
};

export function MessageAutoRefresh({
  intervalMs = 15000
}: MessageAutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!document.hidden) router.refresh();
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [intervalMs, router]);

  return null;
}
