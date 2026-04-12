import { expect, test } from "@playwright/test";

import { resetSeededDatabase } from "./database";

test("happy path covers create, search, digest, and related-note reuse", async ({
  page,
}) => {
  resetSeededDatabase();

  await page.goto("/notes/new");
  await page.getByLabel("标题").fill("pnpm workspace overrides checklist");
  await page.getByLabel("原始输入").fill("remember the workspace override smoke test");
  await page.getByLabel("标签").fill("pnpm, workspace");
  await page.getByLabel("技术栈").fill("Tooling");
  await page.getByRole("button", { name: "保存到 Inbox" }).click();

  await expect(page).toHaveURL(/\/notes\/.+/);
  await expect(
    page.getByRole("heading", { name: "pnpm workspace overrides checklist" }),
  ).toBeVisible();

  await page.goto("/notes");
  await page.getByLabel("搜索条目").fill("workspace override smoke test");
  await page.getByRole("button", { name: "应用筛选" }).click();

  await expect(page.getByText("1 条结果")).toBeVisible();
  await page.getByRole("link", { name: "打开 pnpm workspace overrides checklist" }).click();

  await page.getByRole("link", { name: "继续整理" }).click();
  await expect(page).toHaveURL(/\/notes\/.+\/edit$/);

  await page.getByLabel("摘要").fill("Use pnpm overrides to keep workspace installs aligned.");
  await page.getByLabel("问题").fill("Workspace packages were drifting to incompatible peer ranges.");
  await page.getByLabel("方案").fill("Pin shared versions with pnpm overrides and reinstall.");
  await page.getByLabel("为什么").fill("This keeps dependency resolution deterministic across the repo.");
  await page.getByLabel("命令").fill("pnpm install");
  await page.getByLabel("标签").fill("pnpm, workspace");
  await page.getByLabel("状态").selectOption("digested");
  await page.getByLabel("可信度").selectOption("tested");
  await page.getByRole("button", { name: "保存并返回详情" }).click();

  await expect(page).toHaveURL(/\/notes\/.+$/);
  await expect(
    page.getByText("Use pnpm overrides to keep workspace installs aligned."),
  ).toBeVisible();
  await expect(page.getByText("pnpm peer dep fix")).toBeVisible();

  await page.getByRole("link", { name: "pnpm peer dep fix" }).click();
  await expect(page).toHaveURL("/notes/note-2");
  await expect(
    page.getByRole("heading", { name: "pnpm peer dep fix" }),
  ).toBeVisible();
});
