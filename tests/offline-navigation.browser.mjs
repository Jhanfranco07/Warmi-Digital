// Content regression tests enter through Home first; local route changes reuse the production router.
export async function navigateDownloadedLearning(page, href) {
  if (await page.evaluate(() => navigator.onLine)) return page.goto(href);
  if (!(await page.locator("[data-warmi-offline-learning]").count()))
    await page.goto(href);
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
