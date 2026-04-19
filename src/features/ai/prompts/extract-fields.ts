import type { ExtractStructuredFieldsInput } from "../ai.types";

export interface AIPrompt {
  systemPrompt: string;
  userPrompt: string;
}

function buildExistingNoteContext(input: ExtractStructuredFieldsInput) {
  const existingNote = input.existingNote;
  if (!existingNote) {
    return "No existing note context.";
  }

  return JSON.stringify(
    {
      title: existingNote.title ?? null,
      tags: existingNote.tags ?? [],
      stack: existingNote.stack ?? null,
      summary: existingNote.summary ?? null,
      problem: existingNote.problem ?? null,
      solution: existingNote.solution ?? null,
      why: existingNote.why ?? null,
    },
    null,
    2,
  );
}

export function buildExtractFieldsPrompt(
  input: ExtractStructuredFieldsInput,
): AIPrompt {
  return {
    systemPrompt: [
      "You help DevBrain turn rough developer notes into structured knowledge candidates.",
      "Return only a JSON object.",
      "Use this schema:",
      "{",
      '  "summary": { "value": string, "confidence": "low" | "medium" | "high" } | null,',
      '  "problem": { "value": string, "confidence": "low" | "medium" | "high" } | null,',
      '  "solution": { "value": string, "confidence": "low" | "medium" | "high" } | null,',
      '  "why": { "value": string, "confidence": "low" | "medium" | "high" } | null',
      "}",
      "Prefer concise, factual wording. Use null when the raw input does not support a field.",
    ].join("\n"),
    userPrompt: [
      "Extract structured candidates from the following developer note.",
      "",
      "Raw input:",
      input.rawInput.trim(),
      "",
      "Existing note context:",
      buildExistingNoteContext(input),
    ].join("\n"),
  };
}
