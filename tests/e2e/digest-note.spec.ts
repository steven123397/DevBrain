import { expect, test } from "@playwright/test";

test("an inbox note can be digested from the browser", async ({ page }) => {
  await page.goto("/notes/note-2");

  await expect(
    page.getByRole("heading", { name: "pnpm peer dep fix" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "继续整理" }).click();

  await expect(page).toHaveURL("/notes/note-2/edit");
  await page.getByLabel("摘要").fill("Use pnpm overrides to align shared package versions.");
  await page.getByLabel("问题").fill("Workspace packages were pulling incompatible peer ranges.");
  await page.getByLabel("方案").fill("Add overrides at the workspace root and reinstall dependencies.");
  await page.getByLabel("为什么").fill("This keeps local installs deterministic across every package.");
  await page.getByLabel("命令").fill("pnpm install");
  await page.getByLabel("参考").fill("https://pnpm.io/package_json#pnpmoverrides");
  await page.getByLabel("标签").fill("pnpm, workspace");
  await page.getByLabel("状态").selectOption("digested");
  await page.getByLabel("可信度").selectOption("tested");

  await page.getByRole("button", { name: "保存并返回详情" }).click();

  await expect(page).toHaveURL("/notes/note-2");
  await expect(page.getByText("Digested")).toBeVisible();
  await expect(page.getByText("Tested")).toBeVisible();
  await expect(
    page.getByText("Use pnpm overrides to align shared package versions."),
  ).toBeVisible();
  await expect(
    page.getByText("Workspace packages were pulling incompatible peer ranges."),
  ).toBeVisible();
  await expect(
    page.getByText("Add overrides at the workspace root and reinstall dependencies."),
  ).toBeVisible();
  await expect(
    page.getByText("This keeps local installs deterministic across every package."),
  ).toBeVisible();
  await expect(page.getByText("pnpm install")).toBeVisible();
  await expect(page.getByText("#workspace")).toBeVisible();
});
