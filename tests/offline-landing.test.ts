import assert from "node:assert/strict";
import test from "node:test";
import { readFile, stat } from "node:fs/promises";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WarmiPublicHeader } from "@/app/(public)/_components/warmi-public-header";
import { OfflineHome } from "@/features/artisan/offline/offline-home";
import { LANDING_OFFLINE_IMAGES } from "@/shared/offline/landing-assets";

// tsx uses the repository JSX-preserve setting outside Next; provide the test runtime.
Object.assign(globalThis, { React });

test("public join CTA stays public; offline fourth access continues existing learning", () => {
  const online = renderToStaticMarkup(createElement(WarmiPublicHeader));
  const offline = renderToStaticMarkup(
    createElement(WarmiPublicHeader, { offline: true })
  );
  assert.match(online, /UNETE A WARMI/);
  assert.match(online, /href="\/login"/);
  assert.doesNotMatch(offline, /UNETE A WARMI|href="\/login"/);
  assert.match(offline, /CONTINUAR MI APRENDIZAJE/);
  assert.match(offline, /data-offline-learning-cta/);
  for (const section of ["programa", "descubre", "identidad"])
    assert.ok(offline.includes(`href="#${section}"`));
});

test("offline landing includes real institutional sections and cached images", () => {
  const html = renderToStaticMarkup(
    createElement(OfflineHome, { downloads: [], loading: false })
  );
  for (const text of [
    "WARMI DIGITAL",
    "Artesanas conectadas, historias que transforman.",
    "Programa Warmi",
    "Objetivo general",
    "Misión",
    "Visión",
    "Descubre",
    "Aprender",
    "Emprender",
    "Colaborar",
    "Compartir",
    "Riqsichiq Warmi",
    "Nuestra fuerza nace de la comunidad.",
    "Historia",
    "Territorio",
    "Comunidad"
  ])
    assert.ok(html.includes(text), text);
  for (const src of Object.values(LANDING_OFFLINE_IMAGES))
    assert.ok(html.includes(src), src);
  assert.doesNotMatch(html, /UNETE A WARMI|https:\/\//);
});

test("every offline landing image exists, is precached, and additions stay below 700KB", async () => {
  const worker = await readFile(
    new URL("../public/warmi-sw.js", import.meta.url),
    "utf8"
  );
  let bytes = 0;
  for (const [original, offline] of Object.entries(LANDING_OFFLINE_IMAGES)) {
    assert.ok(worker.includes(`"${offline}"`), offline);
    assert.ok((await stat(new URL(`../public${original}`, import.meta.url))).size > 0);
    const file = await stat(new URL(`../public${offline}`, import.meta.url));
    assert.ok(file.size > 0);
    bytes += file.size;
  }
  assert.ok(bytes < 700_000, `Institutional image budget: ${bytes}`);
});
