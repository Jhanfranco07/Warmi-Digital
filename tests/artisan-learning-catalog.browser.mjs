import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.WARMI_PLAYWRIGHT_PATH || "playwright");
const origin = process.env.WARMI_TEST_URL || "http://localhost:3100";
const email = process.env.WARMI_TEST_EMAIL;
const password = process.env.WARMI_TEST_PASSWORD;
if (!email || !password)
  throw new Error("Define las credenciales de la cuenta de prueba.");
const browser = await chromium.launch({
  headless: true,
  channel: process.env.WARMI_BROWSER_CHANNEL || undefined
});
try {
  const page = await browser.newPage();
  await page.goto(`${origin}/login`);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Ingresar como artesana", exact: true }).click();
  await page.waitForURL("**/artesana/**", { timeout: 60000 });
  for (const [name, viewport] of [
    ["mobile", { width: 390, height: 844 }],
    ["desktop", { width: 1365, height: 900 }]
  ]) {
    await page.setViewportSize(viewport);
    for (const route of ["dashboard", "aprender"]) {
      await page.goto(`${origin}/artesana/${route}`);
      await page.waitForFunction(() =>
        document.body.innerText.includes("Aprender para crecer")
      );
      assert.equal(
        await page.getByText("Aprende a usar Gmail desde cero", { exact: true }).count(),
        0
      );
      assert.equal(
        await page
          .getByText("Aprende a usar WhatsApp Business para tu negocio", { exact: true })
          .count(),
        0
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true
      );
      await page.screenshot({
        path: join(tmpdir(), `warmi-${route}-program-only-${name}.png`),
        fullPage: true
      });
      if (route === "aprender" && name === "mobile") {
        for (const tab of ["Completados", "Disponibles"]) {
          await page.getByRole("tab", { name: tab, exact: true }).click();
          assert.equal(
            await page
              .getByText("Aprende a usar Gmail desde cero", { exact: true })
              .count(),
            0
          );
          assert.equal(
            await page
              .getByText("Aprende a usar WhatsApp Business para tu negocio", {
                exact: true
              })
              .count(),
            0
          );
        }
      }
    }
  }
  console.log(
    "PASS: only Aprender para crecer in dashboard and learning tabs on mobile/desktop."
  );
} finally {
  await browser.close();
}
