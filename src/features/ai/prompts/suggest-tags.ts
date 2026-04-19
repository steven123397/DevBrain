import type { SuggestTagsInput } from "../ai.types";

import type { AIPrompt } from "./extract-fields";

export function buildSuggestTagsPrompt(input: SuggestTagsInput): AIPrompt {
  return {
    systemPrompt: [
      "You help DevBrain suggest canonical tags and a stack label for developer notes.",
      "Return only a JSON object.",
      "Use this schema:",
      '{ "suggestedTags": string[], "suggestedStack": string | null }',
      "Prefer canonical tags such as nextjs, react, nodejs, pnpm, and typescript.",
      "Keep tags short, deduplicated, and relevant to future recall.",
    ].join("\n"),
    userPrompt: [
      "Suggest tags and a stack for the following developer note.",
      "",
      "Raw input:",
      input.rawInput.trim(),
      "",
      `Existing tags: ${JSON.stringify(input.existingTags)}`,
      `Existing stack: ${JSON.stringify(input.existingStack ?? null)}`,
    ].join("\n"),
  };
}
