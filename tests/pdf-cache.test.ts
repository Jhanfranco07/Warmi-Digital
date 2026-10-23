import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { readPdfResponse } from "../shared/lib/pdfjs";

const origin = "https://warmi.test";
const local = `${origin}/__warmi_offline__/generation/guide`;

function mockWindow(t: TestContext, value: unknown) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  });
}

test("PDF reader opens saved bytes directly without network or an active SW", async (t) => {
  mockWindow(t, {
    location: { href: `${origin}/offline-learning`, origin },
    caches: {
      match: async (url: string) => {
        assert.equal(url, local);
        return new Response("%PDF-1.7 cached guide");
      }
    }
  });
  t.mock.method(globalThis, "fetch", async () => {
    throw new Error("No connection or SW");
  });
  const response = await readPdfResponse(local, new AbortController().signal);
  assert.match(await response.text(), /^%PDF-/);
});

test("PDF cache never substitutes authenticated online or remote requests", async (t) => {
  mockWindow(t, {
    location: { href: `${origin}/offline-learning`, origin },
    caches: { match: async () => assert.fail("Must not use a private cache") }
  });
  const fetch = t.mock.method(globalThis, "fetch", async () => new Response("online"));
  for (const url of [
    `${origin}/api/files/guide/preview`,
    "https://other.test/__warmi_offline__/generation/guide"
  ]) {
    assert.equal(
      await (await readPdfResponse(url, new AbortController().signal)).text(),
      "online"
    );
  }
  assert.equal(fetch.mock.callCount(), 2);
});

test("blocked cache storage falls back to the existing delivery URL", async (t) => {
  mockWindow(t, {
    location: { href: `${origin}/offline-learning`, origin },
    caches: {
      match: async () => {
        throw new Error("Storage blocked");
      }
    }
  });
  t.mock.method(globalThis, "fetch", async () => new Response("%PDF-1.7 fallback"));
  assert.match(
    await (await readPdfResponse(local, new AbortController().signal)).text(),
    /fallback/
  );
});

test("closing a PDF aborts even a cache hit", async (t) => {
  mockWindow(t, {
    location: { href: `${origin}/offline-learning`, origin },
    caches: { match: async () => new Response("%PDF-1.7 cached") }
  });
  const abort = new AbortController();
  abort.abort();
  await assert.rejects(readPdfResponse(local, abort.signal), { name: "AbortError" });
});
