"use client";

import { useEffect, useState } from "react";
import { readPosition, writePosition } from "@/shared/learning/reading-position";

export function useReadingPosition(key: string, maximum: number) {
  const [position, setPosition] = useState(0);
  useEffect(() => {
    setPosition(readPosition(key, maximum));
  }, [key, maximum]);
  function choose(next: number) {
    const bounded = Math.max(0, Math.min(maximum, Math.trunc(next)));
    setPosition(bounded);
    writePosition(key, bounded);
  }
  return [position, choose] as const;
}
