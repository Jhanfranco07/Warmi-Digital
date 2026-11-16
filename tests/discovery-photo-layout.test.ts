import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("Descubre muestra cuatro fotos sin franjas y con marcos del mismo tamaño", () => {
  const source = readFileSync(
    new URL("../shared/components/landing/descubre-content.tsx", import.meta.url),
    "utf8"
  );

  for (const image of ["aprende.png", "emprende.png", "taller.png", "recursos.png"]) {
    assert.ok(source.includes(image), `Falta la imagen ${image}`);
  }

  assert.ok(source.includes("object-cover ${item.position}"));
  assert.ok(source.includes('position: "object-[center_18%]"'));
  assert.equal(source.includes("object-contain"), false);
  assert.equal(source.includes("opacity-30 blur-xl"), false);
  assert.equal(source.includes('bg-[#e9dfd5]'), false);
  assert.ok(source.includes("aspect-[4/3]"));
  assert.ok(source.includes("sm:aspect-[5/4]"));
  assert.ok(source.includes("lg:aspect-[3/2]"));
  assert.ok(source.includes("unoptimized={offline}"));
  assert.ok(source.includes("alt={item.alt}"));
  assert.ok(source.includes("motion-reduce:transition-none"));
  assert.ok(source.includes("grid-cols-2 gap-0 overflow-hidden rounded-2xl"));
  assert.ok(source.includes("md:grid-cols-4"));
  assert.equal(source.includes("md:gap-3 md:p-3"), false);
  assert.equal(source.includes("overflow-hidden rounded-xl bg-[#e9dfd5]"), false);
});

test("Talleres no repite la nota de planificación bajo los cuatro meses", () => {
  const source = readFileSync(
    new URL("../features/artisan/workshops/workshop-roadmap.tsx", import.meta.url),
    "utf8"
  );

  assert.equal(source.includes("Esta es la secuencia de temas por mes"), false);
  assert.ok(source.includes("Las fechas y los horarios de cada encuentro"));
});
