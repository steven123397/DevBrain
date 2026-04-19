import { expect, test } from "@playwright/test";

import { resetSeededDatabase } from "./database";

test("search results lazily render AI compressed hints", async ({ page }) => {
  resetSeededDatabase();
  await page.goto("/notes?q=database");

  await expect(page.getByText("2 条结果")).toBeVisible();
  await expect(page.getByText("validation db target safety")).toBeVisible();
  await expect(page.getByText("db:migrate target validation db")).toBeVisible();

  await expect(page.getByText("AI 快速提示").first()).toBeVisible();
  await expect(
    page.getByText("Keep seed and migrate commands pinned to the validation db before touching real data."),
  ).toBeVisible();
  await expect(
    page.getByText("Review migration targets on the validation db first so local data never drifts by accident."),
  ).toBeVisible();
});
