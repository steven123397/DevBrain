import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { vi } from "vitest";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "font-geist-sans" }),
  Geist_Mono: () => ({ variable: "font-geist-mono" }),
}));

vi.mock("next/image", () => ({
  default: () => null,
}));

import { metadata } from "../../src/app/layout";
import Home from "../../src/app/page";

describe("app bootstrap", () => {
  it("publishes DevBrain metadata", () => {
    expect(metadata.title).toBe("DevBrain");
    expect(metadata.description).toContain("本地优先");
  });

  it("renders the knowledge loop on the homepage", async () => {
    const html = renderToStaticMarkup(await Home());

    expect(html).toContain("DevBrain");
    expect(html).toContain("收集");
    expect(html).toContain("整理");
    expect(html).toContain("搜索");
    expect(html).toContain("复用");
  });
});
