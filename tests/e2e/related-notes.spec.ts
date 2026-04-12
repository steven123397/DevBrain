import { expect, test } from "@playwright/test";

import { resetSeededDatabase } from "./database";

test("detail page shows related notes and allows navigation", async ({ page }) => {
  resetSeededDatabase();
  await page.goto("/notes/note-1");

  await expect(page.getByRole("heading", { name: "相关推荐" })).toBeVisible();
  await expect(page.getByText("next.js hydration guard")).toBeVisible();
  await expect(page.getByText("共享标签")).toBeVisible();

  await page.getByRole("link", { name: "next.js hydration guard" }).click();

  await expect(page).toHaveURL("/notes/note-3");
  await expect(
    page.getByRole("heading", { name: "next.js hydration guard" }),
  ).toBeVisible();
});
