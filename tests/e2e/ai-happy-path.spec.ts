import { expect, test, type Page } from "@playwright/test";

import { resetSeededDatabase } from "./database";

async function setMockAIState(
  page: Page,
  payload: {
    forceDisabled?: boolean;
    mode?: "normal" | "error" | "malformed" | "empty";
    reset?: boolean;
  },
) {
  const response = await page.request.post("/api/mock-ai/control", {
    data: payload,
  });

  expect(response.ok()).toBeTruthy();
}

test.beforeEach(async ({ page }) => {
  resetSeededDatabase();
  await setMockAIState(page, {
    reset: true,
    forceDisabled: false,
    mode: "normal",
  });
});

test.afterEach(async ({ page }) => {
  await setMockAIState(page, {
    reset: true,
    forceDisabled: false,
    mode: "normal",
  });
});

test("ai happy path covers create, extract, search, and compressed hint review", async ({
  page,
}) => {
  await page.goto("/notes/new");
  await page.getByLabel("标题").fill("workspace override ai happy path");
  await page
    .getByLabel("原始输入")
    .fill("pnpm workspace peer dependency drift，最后通过 overrides 对齐共享版本。");
  await page.getByLabel("技术栈").fill("Tooling");
  await page.getByRole("button", { name: "保存到 Inbox" }).click();

  await expect(page).toHaveURL(/\/notes\/.+/);
  await expect(page.getByRole("heading", { name: "workspace override ai happy path" })).toBeVisible();

  await page.getByRole("link", { name: "继续整理" }).click();
  await expect(page).toHaveURL(/\/notes\/.+\/edit$/);

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
  await page.getByRole("button", { name: "采纳为什么候选" }).click();

  await page.getByLabel("标签").fill("pnpm, overrides");
  await page.getByLabel("状态").selectOption("digested");
  await page.getByLabel("可信度").selectOption("tested");
  await page.getByRole("button", { name: "保存并返回详情" }).click();

  await expect(page).toHaveURL(/\/notes\/.+$/);
  await expect(
    page.getByText("Use pnpm overrides to align shared package versions."),
  ).toBeVisible();

  await page.goto("/notes?q=workspace+override+ai+happy+path");
  await expect(page.getByText(/^\d+ 条结果$/)).toBeVisible();
  const createdNoteCard = page
    .locator("li", {
      has: page.getByRole("link", {
        name: "打开 workspace override ai happy path",
      }),
    })
    .first();

  await expect(createdNoteCard.getByText("workspace override ai happy path")).toBeVisible();
  await expect(createdNoteCard.getByText("AI 快速提示")).toBeVisible();
  await expect(
    createdNoteCard.getByText(
      "值得打开：Use pnpm overrides to align shared package versions.",
    ),
  ).toBeVisible();
});
