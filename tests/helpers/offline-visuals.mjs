import assert from "node:assert/strict";

export async function assertPdfRendered(page) {
  const viewer = page.locator("[data-pdf-viewer]");
  await viewer.locator("canvas").waitFor({ state: "visible" });
  assert.equal(await viewer.locator("iframe").count(), 0);
  const pixels = await viewer.locator("canvas").evaluate((canvas) => {
    const data = canvas
      .getContext("2d")
      .getImageData(0, 0, canvas.width, canvas.height).data;
    let ink = 0;
    for (let i = 0; i < data.length; i += 64) {
      if (data[i + 3] > 0 && Math.min(data[i], data[i + 1], data[i + 2]) < 220) ink++;
    }
    return ink;
  });
  assert.ok(
    pixels > 20,
    "PDF canvas must contain actual document pixels, not a blank native viewer"
  );
}

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
