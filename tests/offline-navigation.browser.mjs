// Content regression tests enter through Home first; local route changes reuse the production router.
export async function navigateDownloadedLearning(page, href) {
  if (await page.evaluate(() => navigator.onLine)) return page.goto(href);
  if (!(await page.locator("[data-warmi-offline-learning]").count()))
    await page.goto(href);
  if (await page.locator("[data-warmi-offline-home]").count()) {
    // Direct saved lesson URLs now enter learning as soon as IndexedDB finishes loading.
    // Keep the old Home CTA path only when that transition did not happen.
    await page
      .locator("[data-warmi-offline-home]")
      .waitFor({ state: "detached", timeout: 1000 })
      .catch(() => {});
  }
  if (await page.locator("[data-warmi-offline-home]").count()) {
    await page
      .getByRole("link", { name: "Continuar mi aprendizaje", exact: true })
      .click();
    await page.locator("[data-warmi-offline-home]").waitFor({ state: "detached" });
  }
  await page.evaluate((url) => {
    history.pushState({ warmiOfflineView: "learning" }, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, href);
}
