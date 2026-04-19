import { expect, test, type Page } from "@playwright/test";

import { resetSeededDatabase } from "./database";

async function setMockAIState(
  page: Page,
  payload: {
    forceDisabled?: boolean;
    mode?: "normal" | "error" | "malformed" | "empty";
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
    forceDisabled: false,
    mode: "normal",
  });
});

test.afterEach(async ({ page }) => {
  await setMockAIState(page, {
    forceDisabled: false,
    mode: "normal",
  });
});

test("ai entries stay hidden when AI is disabled", async ({ page }) => {
  await setMockAIState(page, {
    forceDisabled: true,
  });

  await page.goto("/notes/note-2/edit");
  await expect(page.getByRole("button", { name: "AI 辅助提取" })).not.toBeVisible();
  await expect(page.getByRole("button", { name: "AI 建议" })).not.toBeVisible();

  await page.getByLabel("标题").fill("manual digest still works");
  await page.getByRole("button", { name: "保存并返回详情" }).click();
  await expect(page).toHaveURL("/notes/note-2");
  await expect(page.getByRole("heading", { name: "manual digest still works" })).toBeVisible();

  await page.goto("/notes?q=database");
  await expect(page.getByText("validation db target safety")).toBeVisible();
  await expect(page.getByText("AI 快速提示")).not.toBeVisible();
});

test("provider errors show friendly messages without blocking the main flow", async ({ page }) => {
  await setMockAIState(page, {
    mode: "error",
  });

  await page.goto("/notes/note-2/edit");
  await page.getByRole("button", { name: "AI 辅助提取" }).click();
  await expect(page.getByText("AI 提取失败，请稍后重试。")).toBeVisible();

  await page.getByLabel("摘要").fill("Manual fallback summary.");
  await page.getByLabel("问题").fill("Manual fallback problem.");
  await page.getByLabel("方案").fill("Manual fallback solution.");
  await page.getByLabel("标签").fill("pnpm, fallback");
  await page.getByLabel("状态").selectOption("digested");
  await page.getByRole("button", { name: "保存并返回详情" }).click();

  await expect(page).toHaveURL("/notes/note-2");
  await expect(page.getByText("Manual fallback summary.")).toBeVisible();

  await page.goto("/notes?q=database");
  await expect(page.getByText("validation db target safety")).toBeVisible();
  await expect(page.getByText("AI 压缩提示失败，请稍后重试。")).toBeVisible();
});

test("malformed AI payloads degrade to empty candidate states", async ({ page }) => {
  await setMockAIState(page, {
    mode: "malformed",
  });

  await page.goto("/notes/note-2/edit");
  await page.getByRole("button", { name: "AI 辅助提取" }).click();
  await expect(
    page.getByText("这次没有提取到足够明确的结构化候选，可以补充更多上下文后再试一次。"),
  ).toBeVisible();

  await page.getByRole("button", { name: "AI 建议" }).click();
  await expect(
    page.getByText("这次没有生成足够明确的标签或技术栈建议，可以先补充原始输入再试一次。"),
  ).toBeVisible();

  await page.goto("/notes?q=database");
  await expect(page.getByText("validation db target safety")).toBeVisible();
  await expect(page.getByText("AI 快速提示")).not.toBeVisible();
});
