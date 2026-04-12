import { expect, test } from "@playwright/test";

test("search filters persist in the url and narrow the list", async ({ page }) => {
  await page.goto("/notes");

  await page.getByLabel("搜索条目").fill("hydration");
  await page.getByLabel("状态").selectOption("digested");
  await page.getByLabel("技术栈").selectOption("Next.js");
  await page.getByRole("button", { name: "应用筛选" }).click();

  await expect(page).toHaveURL(/\/notes\?q=hydration/);
  await expect(page).toHaveURL(/status=digested/);
  await expect(page).toHaveURL(/stack=Next\.js/);
  await expect(page.getByText("1 条结果")).toBeVisible();
  await expect(page.getByText("hydration mismatch")).toBeVisible();
  await expect(page.getByText("pnpm peer dep fix")).not.toBeVisible();
  await expect(page.getByLabel("搜索条目")).toHaveValue("hydration");
});
