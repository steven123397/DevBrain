import { expect, test } from "@playwright/test";

import { resetSeededDatabase } from "./database";

test("an inbox note can accept AI extracted candidates before saving", async ({ page }) => {
  resetSeededDatabase();
  await page.goto("/notes/note-2/edit");

  await expect(page.getByRole("button", { name: "AI 辅助提取" })).toBeVisible();

  await page.getByRole("button", { name: "AI 辅助提取" }).click();

  await expect(
    page.getByText("Use pnpm overrides to align shared package versions."),
  ).toBeVisible();
  await expect(
    page.getByText("Workspace packages were pulling incompatible peer dependency ranges."),
  ).toBeVisible();
  await expect(
    page.getByText("Add overrides at the workspace root and reinstall dependencies."),
  ).toBeVisible();

  await page.getByRole("button", { name: "采纳摘要候选" }).click();
  await page.getByRole("button", { name: "采纳问题候选" }).click();
  await page.getByRole("button", { name: "采纳方案候选" }).click();

  await expect(page.getByLabel("摘要")).toHaveValue(
    "Use pnpm overrides to align shared package versions.",
  );
  await expect(page.getByLabel("问题")).toHaveValue(
    "Workspace packages were pulling incompatible peer dependency ranges.",
  );
  await expect(page.getByLabel("方案")).toHaveValue(
    "Add overrides at the workspace root and reinstall dependencies.",
  );

  await page.getByLabel("状态").selectOption("digested");
  await page.getByLabel("可信度").selectOption("tested");
  await page.getByRole("button", { name: "保存并返回详情" }).click();

  await expect(page).toHaveURL("/notes/note-2");
  await expect(page.getByText("Digested")).toBeVisible();
  await expect(
    page.getByText("Use pnpm overrides to align shared package versions."),
  ).toBeVisible();
});
