"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export function LearningChecklist({
  items,
  title = "Mi lista de tareas"
}: {
  items: readonly string[];
  title?: string;
}) {
  const [done, setDone] = useState<readonly string[]>([]);
  const completed = items.filter((item) => done.includes(item)).length;
  const next = items.find((item) => !done.includes(item));

  return (
    <fieldset data-learning-checklist className="min-w-0 space-y-3">
      <legend className="text-base font-bold text-[#202b29]">{title}</legend>
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="flex min-h-7 items-center gap-2 text-sm font-bold text-[#24756f]"
      >
        {completed === items.length && <Check aria-hidden="true" className="h-5 w-5" />}
        {completed} de {items.length} tareas listas
      </p>
      <div className="divide-y divide-[#ead2dc]">
        {items.map((item, index) => {
          const checked = done.includes(item);
          const current = item === next;
          return (
            <label
              key={item}
              className={`flex min-h-16 cursor-pointer items-start gap-3 border-l-4 px-3 py-3 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#b5245b] ${current ? "border-[#24756f] bg-white" : checked ? "border-transparent bg-[#e2f2ef]" : "border-transparent"}`}
            >
              <input
                type="checkbox"
                aria-label={item}
                checked={checked}
                onChange={(event) => {
                  const selected = event.target.checked;
                  setDone((previous) =>
                    selected
                      ? [...previous, item]
                      : previous.filter((value) => value !== item)
                  );
                }}
                className="mt-1 h-6 w-6 shrink-0 accent-[#24756f]"
              />
              <span className="min-w-0 flex-1">
                <span
                  className="block text-sm font-bold text-[#24756f]"
                  aria-hidden="true"
                >
                  {checked ? "Hecho" : current ? "Siguiente tarea" : "Pendiente"}
                </span>
                <span className="block break-words text-base leading-6 text-[#344441]">
                  <span aria-hidden="true">{index + 1}. </span>
                  {item}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
