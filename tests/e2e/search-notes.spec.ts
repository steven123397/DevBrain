import { expect, test } from "@playwright/test";

import { resetSeededDatabase } from "./database";

test("search filters persist in the url and narrow the list", async ({ page }) => {
  resetSeededDatabase();
  await page.goto("/notes");

  await page.getByLabel("搜索条目").fill("hydration");
  await page.getByLabel("状态").selectOption("digested");
  await page.getByLabel("技术栈").selectOption("Next.js");
  await page.getByRole("button", { name: "应用筛选" }).click();

  await expect(page).toHaveURL(/\/notes\?q=hydration/);
  await expect(page).toHaveURL(/status=digested/);
  await expect(page).toHaveURL(/stack=Next\.js/);
  await expect(page.getByText("2 条结果")).toBeVisible();
  await expect(page.getByText("hydration mismatch")).toBeVisible();
  await expect(page.getByText("next.js hydration guard")).toBeVisible();
  await expect(page.getByText("pnpm peer dep fix")).not.toBeVisible();
  await expect(page.getByLabel("搜索条目")).toHaveValue("hydration");
});

test("search recalls the database safety note for 中文边界词", async ({ page }) => {
  resetSeededDatabase();
  await page.goto("/notes?q=%E9%BB%98%E8%AE%A4%E4%B8%BB%E5%BA%93");

  await expect(page.getByLabel("搜索条目")).toHaveValue("默认主库");
  await expect(page.getByText("validation db target safety")).toBeVisible();
  await expect(page.getByRole("link", { name: /打开 / }).first()).toHaveAttribute(
    "aria-label",
    "打开 validation db target safety",
  );
});
