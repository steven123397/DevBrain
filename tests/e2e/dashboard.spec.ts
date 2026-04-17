import { expect, test } from "@playwright/test";

import { resetSeededDatabase } from "./database";

test("dashboard and notes list render seeded data", async ({ page }) => {
  resetSeededDatabase();
  await page.goto("/");

  await expect(page.getByText("总条目", { exact: true })).toBeVisible();
  await expect(page.getByText("最近更新", { exact: true })).toBeVisible();
  await expect(page.getByText("hydration mismatch")).toBeVisible();

  await page.getByRole("link", { name: "浏览全部条目" }).click();

  await expect(page).toHaveURL(/\/notes/);
  await expect(page.getByRole("searchbox", { name: "搜索条目" })).toBeVisible();
  await expect(page.getByText("5 条结果")).toBeVisible();
  await expect(page.getByText("pnpm peer dep fix")).toBeVisible();
  await expect(page.getByText("next.js hydration guard")).toBeVisible();
  await expect(page.getByText("validation db target safety")).toBeVisible();
});

test("quick capture creates an inbox note and lands on the detail page", async ({
  page,
}) => {
  resetSeededDatabase();
  await page.goto("/notes/new");

  await page.getByLabel("标题").fill("Document route handler cache bust");
  await page.getByLabel("原始输入").fill("remember the header mismatch repro");
  await page.getByLabel("标签").fill("nextjs, caching");
  await page.getByLabel("技术栈").fill("Next.js");
  await page.getByLabel("来源类型").selectOption("doc");
  await page
    .getByLabel("来源链接")
    .fill("https://nextjs.org/docs/app/building-your-application/routing/route-handlers");

  await page.getByRole("button", { name: "保存到 Inbox" }).click();

  await expect(page).toHaveURL(/\/notes\/.+/);
  await expect(
    page.getByRole("heading", { name: "Document route handler cache bust" }),
  ).toBeVisible();
  await expect(page.getByText("remember the header mismatch repro")).toBeVisible();
  const metadataPanel = page.locator("aside");
  await expect(metadataPanel.getByText("#nextjs", { exact: true })).toBeVisible();
  await expect(metadataPanel.getByText("#caching", { exact: true })).toBeVisible();
});
