"use client";

import { useState } from "react";
import { MODULE2_CHOICES } from "@/shared/learning/module2";

export function LearningChoice() {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="space-y-4">
      <div className="grid gap-3" role="group" aria-label="Qué necesito hoy">
        {MODULE2_CHOICES.map((choice, index) => (
          <button
            key={choice.label}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
            className={`min-h-12 rounded-md border px-4 py-3 text-left font-bold ${selected === index ? "border-[#24756f] bg-[#e2f2ef] text-[#185750]" : "border-[#dfc7d2] bg-white text-[#344441]"}`}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <p role="status" className="min-h-20 border-l-4 border-[#24756f] pl-4">
        {selected === null ? (
          "Elige una opción para ver qué oportunidad puede ayudarte."
        ) : (
          <>
            <strong>{MODULE2_CHOICES[selected].answer}</strong>
            <br />
            {MODULE2_CHOICES[selected].text}
          </>
        )}
      </p>
    </div>
  );
}
