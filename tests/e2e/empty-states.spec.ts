import { expect, test } from "@playwright/test";

import { resetEmptyDatabase, resetSeededDatabase } from "./database";

test("dashboard and list show clear empty states on first launch", async ({ page }) => {
  resetEmptyDatabase();

  await page.goto("/");
  await expect(page.getByText("还没有任何条目")).toBeVisible();
  await expect(page.getByText("Inbox 现在是空的")).toBeVisible();

  await page.goto("/notes");
  await expect(page.getByText("还没有任何条目")).toBeVisible();

  await page.getByLabel("状态").selectOption("inbox");
  await page.getByRole("button", { name: "应用筛选" }).click();

  await expect(page.getByText("Inbox 现在是空的")).toBeVisible();
});

test("search with no matches shows an empty result state", async ({ page }) => {
  resetSeededDatabase();

  await page.goto("/notes");
  await page.getByLabel("搜索条目").fill("socket timeout nowhere");
  await page.getByRole("button", { name: "应用筛选" }).click();

  await expect(page).toHaveURL(/q=socket\+timeout\+nowhere|q=socket%20timeout%20nowhere/);
  await expect(page.getByText("还没有匹配到条目")).toBeVisible();
});
