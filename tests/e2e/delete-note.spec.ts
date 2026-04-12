import { expect, test } from "@playwright/test";

import { resetSeededDatabase } from "./database";

test("deleting a note removes it from the list and leaves a not found state", async ({
  page,
}) => {
  resetSeededDatabase();

  await page.goto("/notes");
  await page.getByRole("link", { name: "打开 pnpm peer dep fix" }).click();
  await page.getByRole("button", { name: "删除条目" }).click();

  await expect(page).toHaveURL(/\/notes(\?deleted=1)?$/);
  await expect(page.getByText("pnpm peer dep fix")).not.toBeVisible();

  await page.goto("/notes/note-2");
  await expect(
    page.getByRole("heading", { name: "这条记录已不存在" }),
  ).toBeVisible();
});
