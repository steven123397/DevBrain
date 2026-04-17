import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDashboardOverview: vi.fn(),
}));

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "font-geist-sans" }),
  Geist_Mono: () => ({ variable: "font-geist-mono" }),
}));

vi.mock("next/image", () => ({
  default: () => null,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => createElement("a", { href, ...props }, children),
}));

vi.mock("@/features/notes/note.service", () => ({
  noteService: {
    getDashboardOverview: mocks.getDashboardOverview,
  },
}));

import { metadata } from "../../src/app/layout";
import Home from "../../src/app/page";

afterEach(() => {
  vi.clearAllMocks();
});

describe("app bootstrap", () => {
  it("publishes DevBrain metadata", () => {
    expect(metadata.title).toBe("DevBrain");
    expect(metadata.description).toContain("本地优先");
  });

  it("renders the knowledge loop on the homepage", async () => {
    mocks.getDashboardOverview.mockResolvedValue({
      totalNotes: 0,
      inboxCount: 0,
      digestedCount: 0,
      recentNotes: [],
    });

    const html = renderToStaticMarkup(await Home());

    expect(html).toContain("DevBrain");
    expect(html).toContain("收集");
    expect(html).toContain("整理");
    expect(html).toContain("搜索");
    expect(html).toContain("复用");
  });
});
