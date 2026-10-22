import assert from "node:assert/strict";

export async function prepareVisualShell(page) {
  await page.evaluate(async () => {
    await navigator.serviceWorker.register("/warmi-sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
}

export async function assertOfflineImages(page, selector) {
  await page
    .waitForFunction((root) => {
      const images = [...document.querySelectorAll(`${root} img`)];
      return images.every((image) => image.complete && image.naturalWidth > 0);
    }, selector)
    .catch(async (error) => {
      console.error(
        await page.locator(`${selector} img`).evaluateAll((images) =>
          images.map((image) => ({
            src: image.currentSrc,
            complete: image.complete,
            width: image.naturalWidth
          }))
        )
      );
      throw error;
    });
  const sources = await page
    .locator(`${selector} img`)
    .evaluateAll((images) => images.map((image) => image.currentSrc || image.src));
  assert.ok(
    sources.every((src) => new URL(src).origin === new URL(page.url()).origin),
    "All pedagogical and voice images must be local, not remote Stitch URLs"
  );
}
