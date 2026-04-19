import { NextResponse } from "next/server";

import { getTestAIControlState } from "@/features/ai/ai.test-control";

interface MockMessageRequest {
  system?: string;
  messages?: Array<{
    role?: string;
    content?: string;
  }>;
}

interface MockCompressPromptNote {
  noteId?: string;
  title?: string;
  summary?: string | null;
  problem?: string | null;
  solution?: string | null;
  why?: string | null;
  rawInput?: string | null;
  commands?: string | null;
  references?: string | null;
}

function isMockEnabled() {
  return process.env.DEVBRAIN_ALLOW_TEST_AI_MOCK === "true";
}

function buildTextResponse(payload: object) {
  return NextResponse.json({
    content: [
      {
        type: "text",
        text: JSON.stringify(payload),
      },
    ],
  });
}

function readUserPrompt(payload: MockMessageRequest) {
  return payload.messages?.find((message) => message.role === "user")?.content ?? "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseCompressPromptNotes(userPrompt: string): MockCompressPromptNote[] {
  const jsonStart = userPrompt.indexOf("[");
  if (jsonStart < 0) {
    return [];
  }

  try {
    const parsed = JSON.parse(userPrompt.slice(jsonStart));
    return Array.isArray(parsed)
      ? parsed.filter((item): item is MockCompressPromptNote => isRecord(item))
      : [];
  } catch {
    return [];
  }
}

function readGenericSummarySeed(note: MockCompressPromptNote) {
  const candidates = [
    note.summary,
    note.solution,
    note.problem,
    note.why,
    note.rawInput,
    note.commands,
    note.references,
    note.title,
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== "string") {
      continue;
    }

    const trimmed = candidate.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return null;
}

export async function POST(request: Request) {
  if (!isMockEnabled()) {
    return NextResponse.json(
      {
        error: {
          message: "Mock AI route is disabled.",
        },
      },
      { status: 404 },
    );
  }

  const payload = (await request.json()) as MockMessageRequest;
  const systemPrompt = payload.system ?? "";
  const userPrompt = readUserPrompt(payload);
  const controlState = getTestAIControlState();

  if (controlState.mode === "error") {
    return NextResponse.json(
      {
        error: {
          message: "Mock AI provider error.",
        },
      },
      { status: 502 },
    );
  }

  if (controlState.mode === "malformed") {
    return NextResponse.json({
      content: [
        {
          type: "text",
          text: "not valid json",
        },
      ],
    });
  }

  if (systemPrompt.includes("structured knowledge candidates")) {
    return buildTextResponse({
      ...(controlState.mode === "empty"
        ? {}
        : {
            summary: {
              value: "Use pnpm overrides to align shared package versions.",
              confidence: "high",
            },
            problem: {
              value:
                "Workspace packages were pulling incompatible peer dependency ranges.",
              confidence: "high",
            },
            solution: {
              value: "Add overrides at the workspace root and reinstall dependencies.",
              confidence: "high",
            },
            why: {
              value: "This keeps local installs deterministic across every package.",
              confidence: "medium",
            },
          }),
      sourcePreview: userPrompt.slice(0, 120),
    });
  }

  if (systemPrompt.includes("suggest canonical tags")) {
    return buildTextResponse({
      ...(controlState.mode === "empty"
        ? {}
        : {
            suggestedTags: ["pnpm", "monorepo", "overrides"],
            suggestedStack: "Tooling",
          }),
      sourcePreview: userPrompt.slice(0, 120),
    });
  }

  if (systemPrompt.includes("compressed summary hints")) {
    const candidates = [
      {
        match: "hydration mismatch",
        noteId: "note-1",
        summary:
          "Hydration errors usually come from browser-only branches in the first render.",
      },
      {
        match: "pnpm peer dep fix",
        noteId: "note-2",
        summary:
          "Workspace drift is usually fixed by pinning shared versions with overrides.",
      },
      {
        match: "validation db target safety",
        noteId: "note-4",
        summary:
          "Keep seed and migrate commands pinned to the validation db before touching real data.",
      },
      {
        match: "db:migrate target validation db",
        noteId: "note-5",
        summary:
          "Review migration targets on the validation db first so local data never drifts by accident.",
      },
    ];
    const matchedSummaries = candidates
      .filter((item) => userPrompt.includes(item.noteId) || userPrompt.includes(item.match))
      .map(({ noteId, summary }) => ({
        noteId,
        summary,
      }));
    const matchedNoteIds = new Set(matchedSummaries.map((item) => item.noteId));
    const genericSummaries = parseCompressPromptNotes(userPrompt)
      .map((note) => {
        const noteId = typeof note.noteId === "string" ? note.noteId.trim() : "";
        if (!noteId || matchedNoteIds.has(noteId)) {
          return null;
        }

        const seed = readGenericSummarySeed(note);
        if (!seed) {
          return null;
        }

        return {
          noteId,
          summary: `值得打开：${seed}`,
        };
      })
      .filter((item): item is { noteId: string; summary: string } => item !== null);

    return buildTextResponse({
      summaries: controlState.mode === "empty" ? [] : [...matchedSummaries, ...genericSummaries],
      sourcePreview: userPrompt.slice(0, 120),
    });
  }

  return NextResponse.json(
    {
      error: {
        message: "Unsupported mock AI request.",
      },
    },
    { status: 400 },
  );
}
