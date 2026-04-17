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

test("database detail page surfaces the migrate note as the top related note", async ({
  page,
}) => {
  resetSeededDatabase();
  await page.goto("/notes/note-4");

  await expect(
    page.getByRole("heading", { name: "validation db target safety" }),
  ).toBeVisible();

  const relatedPanel = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "相关推荐" }) })
    .last();

  await expect(relatedPanel.getByText("db:migrate target validation db")).toBeVisible();
  await expect(relatedPanel.getByText("共享术语")).toBeVisible();
  await expect(
    relatedPanel.locator("article").first().getByRole("link", {
      name: "db:migrate target validation db",
    }),
  ).toBeVisible();

  await relatedPanel
    .locator("article")
    .first()
    .getByRole("link", { name: "db:migrate target validation db" })
    .click();

  await expect(page).toHaveURL("/notes/note-5");
  await expect(
    page.getByRole("heading", { name: "db:migrate target validation db" }),
  ).toBeVisible();
});
