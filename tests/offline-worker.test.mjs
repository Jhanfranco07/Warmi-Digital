import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../public/warmi-sw.js", import.meta.url), "utf8");

function worker() {
  const handlers = {};
  const entries = new Map();
  const cache = {
    match: async (url) => entries.get(typeof url === "string" ? url : url.url)?.clone(),
    put: async (url, response) =>
      entries.set(typeof url === "string" ? url : url.url, response),
    add: async () => {}
  };
  const context = {
    URL,
    Response,
    Blob,
    Set,
    fetch: async () => {
      throw new Error("offline");
    },
    caches: { match: cache.match, open: async () => cache },
    self: {
      location: { origin: "https://warmi.test" },
      addEventListener: (name, fn) => {
        handlers[name] = fn;
      }
    }
  };
  vm.runInNewContext(source, context);
  async function request(path, { range, mode = "navigate", method = "GET" } = {}) {
    let response;
    handlers.fetch({
      request: {
        url: `https://warmi.test${path}`,
        method,
        mode,
        headers: new Headers(range ? { Range: range } : {})
      },
      respondWith: (promise) => {
        response = promise;
      }
    });
    return response;
  }
  return { request, entries, handlers, context };
}

test("shell upgrade removes only previous public shells and preserves every downloaded media generation", async () => {
  const { handlers, context } = worker();
  const names = [
    "warmi-offline-shell-v4",
    "warmi-offline-shell-v5",
    "warmi-module3-old",
    "warmi-learning-module-m3-generation",
    "warmi-learning-module-m4-generation"
  ];
  const removed = [];
  context.caches.keys = async () => names;
  context.caches.delete = async (name) => {
    removed.push(name);
    return true;
  };
  context.self.clients = { claim: async () => {} };
  let done;
  handlers.activate({
    waitUntil: (promise) => {
      done = promise;
    }
  });
  await done;
  assert.deepEqual(removed, ["warmi-offline-shell-v4"]);
});

test("offline shell preserves entry and learning URLs, without caching auth or other modules", async () => {
  const { request, entries } = worker();
  entries.set("/offline-learning", new Response("public shell"));
  for (const path of [
    "/",
    "/artesana/dashboard",
    "/artesana/aprender",
    "/artesana/aprender/course/lecciones/lesson"
  ]) {
    assert.equal(await (await request(path)).text(), "public shell");
  }
  for (const path of ["/api/auth/session", "/artesana/mensajes", "/admin", "/login"]) {
    assert.equal(await request(path), undefined);
  }
  assert.equal(await request("/artesana/aprender", { method: "POST" }), undefined);
  assert.equal(
    await request("/artesana/aprender?_rsc=test", { mode: "cors" }),
    undefined
  );
});

test("MP4 and PDF full responses and byte ranges work without network", async () => {
  const { request, entries } = worker();
  const path = "/__warmi_offline__/generation/file";
  entries.set(
    `https://warmi.test${path}`,
    new Response("0123456789", { headers: { "Content-Type": "video/mp4" } })
  );
  assert.equal(await (await request(path)).text(), "0123456789");
  for (const [range, expected, contentRange] of [
    ["bytes=2-5", "2345", "bytes 2-5/10"],
    ["bytes=7-", "789", "bytes 7-9/10"],
    ["bytes=-3", "789", "bytes 7-9/10"],
    ["bytes=0-999", "0123456789", "bytes 0-9/10"]
  ]) {
    const response = await request(path, { range });
    assert.equal(response.status, 206);
    assert.equal(response.headers.get("Content-Range"), contentRange);
    assert.equal(response.headers.get("Content-Type"), "video/mp4");
    assert.equal(await response.text(), expected);
  }
  for (const range of ["bytes=30-", "bytes=5-2", "bytes=-", "bytes=0-1,3-4"]) {
    assert.equal((await request(path, { range })).status, 416);
  }
  assert.equal((await request("/__warmi_offline__/missing")).status, 404);
});

test("a missing shell reports unavailable rather than a successful empty document", async () => {
  const { request } = worker();
  const response = await request("/artesana/aprender");
  assert.equal(response.status, 503);
  assert.match(await response.text(), /todavía no está disponible/);
});
