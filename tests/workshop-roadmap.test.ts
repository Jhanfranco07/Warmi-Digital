import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  WORKSHOP_MONTHS,
  WORKSHOPS_PRESENTATION
} from "@/shared/learning/workshops";

test("workshop roadmap has four ordered months and the agreed thematic titles", () => {
  assert.deepEqual(
    WORKSHOP_MONTHS.map((item) => item.month),
    [1, 2, 3, 4]
  );
  assert.deepEqual(
    WORKSHOP_MONTHS.map((item) => item.title),
    [
      "Mi celular como herramienta de acceso al Estado",
      "Oportunidades para mi negocio",
      "Herramientas digitales para vender",
      "Estrategias de venta y autonomía digital"
    ]
  );
  assert.ok(WORKSHOP_MONTHS.every((item) => item.topics.length === 4));
});

test("roadmap is descriptive and never invents scheduled workshop dates", () => {
  for (const item of WORKSHOP_MONTHS) {
    assert.ok(item.topics.every((topic) => topic.trim().length > 0));
    assert.equal(Object.hasOwn(item, "startsAt"), false);
    assert.equal(Object.hasOwn(item, "endsAt"), false);
    assert.equal(Object.hasOwn(item, "registrationId"), false);
  }
  assert.match(WORKSHOPS_PRESENTATION.duration, /2 horas por sesión/);
  assert.match(WORKSHOPS_PRESENTATION.duration, /4 meses/);
});

test("workshop cover uses verified client photo with responsive and accessible text", () => {
  const component = readFileSync(
    new URL("../features/artisan/workshops/workshop-roadmap.tsx", import.meta.url),
    "utf8"
  );
  assert.ok(component.includes("warmi-talleres-fototaller-2026-11.jpg"));
  assert.ok(component.includes('alt="Artesanas reunidas'));
  assert.ok(component.includes('sizes="(min-width: 1024px)'));
  assert.ok(component.includes("sm:aspect-[4/3]"));
  assert.ok(component.includes("ClipboardCheck"));
  assert.ok(component.includes("ShoppingCart"));
});

test("roadmap animations respect reduced-motion preferences", () => {
  const css = readFileSync(
    new URL("../features/artisan/workshops/workshop-roadmap.module.css", import.meta.url),
    "utf8"
  );
  assert.ok(css.includes("prefers-reduced-motion: no-preference"));
  assert.ok(css.includes("prefers-reduced-motion: reduce"));
  assert.ok(css.includes(".monthCard:hover"));
  assert.ok(css.includes(".photoFrame:hover .photoImage"));
});

test("mes 1 enseña Zoom y Google Meet en lugar de catálogos de WhatsApp Business", () => {
  const firstMonth = WORKSHOP_MONTHS[0];
  assert.equal(firstMonth.month, 1);
  assert.ok(firstMonth.topics.some((topic) => topic.includes("Zoom y Google Meet")));
  assert.equal(firstMonth.topics.some((topic) => topic.includes("WhatsApp Business")), false);
});

test("la descripción de Talleres menciona servicios públicos y la artesanía en Qallwa", () => {
  const source = readFileSync(
    new URL("../app/(artisan)/artesana/talleres/page.tsx", import.meta.url),
    "utf8"
  );
  assert.ok(source.includes("capacitaciones, concursos y ferias"));
  assert.ok(source.includes("artesanía tejida en Qallwa"));
  assert.equal(source.includes("tu vitrina cultural"), false);
  assert.ok(source.includes("${WORKSHOPS_INTRO} Los talleres presenciales"));
});
