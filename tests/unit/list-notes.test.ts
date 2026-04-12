import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDashboardOverview: vi.fn(),
  listNotes: vi.fn(),
  listFilterOptions: vi.fn(),
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
    listNotes: mocks.listNotes,
    listFilterOptions: mocks.listFilterOptions,
  },
}));

import Home from "@/app/page";
import NotesPage from "@/app/notes/page";

afterEach(() => {
  vi.clearAllMocks();
});

describe("dashboard page", () => {
  it("renders live counts, recent notes, and quick actions", async () => {
    mocks.getDashboardOverview.mockResolvedValue({
      totalNotes: 7,
      inboxCount: 3,
      digestedCount: 4,
      recentNotes: [
        {
          id: "note-1",
          title: "hydration mismatch",
          rawInput: "SSR warning",
          summary: "Guard browser-only state",
          problem: null,
          solution: "move browser-only logic into useEffect",
          why: null,
          commands: null,
          references: null,
          tags: ["nextjs", "react"],
          stack: "Next.js",
          status: "digested",
          confidence: "tested",
          sourceType: "manual",
          sourceUrl: null,
          createdAt: "2026-04-10T10:00:00.000Z",
          updatedAt: "2026-04-12T10:00:00.000Z",
        },
      ],
    });

    const html = renderToStaticMarkup(await Home());

    expect(html).toContain("总条目");
    expect(html).toContain("7");
    expect(html).toContain("最近更新");
    expect(html).toContain("hydration mismatch");
    expect(html).toContain("/notes/new");
    expect(html).toContain("/notes");
  });
});

describe("notes page", () => {
  it("renders search controls, current filters, and result count", async () => {
    mocks.listFilterOptions.mockResolvedValue({
      tags: ["nextjs", "pnpm"],
      stacks: ["Next.js", "Tooling"],
    });
    mocks.listNotes.mockResolvedValue([
      {
        id: "note-1",
        title: "hydration mismatch",
        rawInput: "SSR warning",
        summary: "Guard browser-only state",
        problem: null,
        solution: "move browser-only logic into useEffect",
        why: null,
        commands: null,
        references: null,
        tags: ["nextjs", "react"],
        stack: "Next.js",
        status: "digested",
        confidence: "tested",
        sourceType: "manual",
        sourceUrl: null,
        createdAt: "2026-04-10T10:00:00.000Z",
        updatedAt: "2026-04-12T10:00:00.000Z",
      },
      {
        id: "note-2",
        title: "pnpm peer dep fix",
        rawInput: "used overrides",
        summary: null,
        problem: null,
        solution: null,
        why: null,
        commands: null,
        references: null,
        tags: ["pnpm"],
        stack: "Tooling",
        status: "inbox",
        confidence: "draft",
        sourceType: "manual",
        sourceUrl: null,
        createdAt: "2026-04-11T10:00:00.000Z",
        updatedAt: "2026-04-12T09:00:00.000Z",
      },
    ]);

    const html = renderToStaticMarkup(
      await NotesPage({
        searchParams: Promise.resolve({
          query: "hydration",
          status: "inbox",
        }),
      }),
    );

    expect(html).toContain("搜索条目");
    expect(html).toContain('name="query"');
    expect(html).toContain('name="status"');
    expect(html).toContain('name="tag"');
    expect(html).toContain('name="stack"');
    expect(html).toContain("2 条结果");
    expect(html).toContain("hydration mismatch");
    expect(html).toContain("pnpm peer dep fix");
  });
});
