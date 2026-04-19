import { expect, test } from "@playwright/test";

import { resetSeededDatabase } from "./database";

test("an inbox note can accept AI tag suggestions before saving", async ({ page }) => {
  resetSeededDatabase();
  await page.goto("/notes/note-2/edit");

  await expect(page.getByRole("button", { name: "AI 建议" })).toBeVisible();

  await page.getByRole("button", { name: "AI 建议" }).click();

  await expect(page.getByRole("button", { name: "添加标签建议 overrides" })).toBeVisible();
  await expect(page.getByRole("button", { name: "应用技术栈建议 Tooling" })).toBeVisible();

  await page.getByRole("button", { name: "添加标签建议 overrides" }).click();

  await expect(page.getByRole("textbox", { name: "标签" })).toHaveValue("pnpm, overrides");

  await page.getByRole("button", { name: "保存并返回详情" }).click();

  await expect(page).toHaveURL("/notes/note-2");
  await expect(page.getByText("#pnpm")).toBeVisible();
  await expect(page.getByText("#overrides")).toBeVisible();
});
