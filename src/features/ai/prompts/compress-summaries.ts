import type { CompressSummariesInput } from "../ai.types";

const maxFieldLength = 180;

function takeSnippet(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.length <= maxFieldLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxFieldLength).trimEnd()}...`;
}

export function buildCompressSummariesPrompt({ notes }: CompressSummariesInput) {
  const notePayload = notes.map((note) => {
    const summary = takeSnippet(note.summary);
    const problem = takeSnippet(note.problem);
    const solution = takeSnippet(note.solution);
    const why = takeSnippet(note.why);
    const rawInput = takeSnippet(note.rawInput);
    const hasStructuredContext = Boolean(summary || problem || solution || why);

    return {
      noteId: note.id,
      title: note.title,
      status: note.status,
      ...(note.stack ? { stack: note.stack } : {}),
      ...(note.tags.length > 0 ? { tags: note.tags } : {}),
      ...(summary ? { summary } : {}),
      ...(problem ? { problem } : {}),
      ...(solution ? { solution } : {}),
      ...(why ? { why } : {}),
      ...(!hasStructuredContext && rawInput ? { rawInput } : {}),
    };
  });

  return {
    systemPrompt: [
      "You generate compressed summary hints for DevBrain search results.",
      "Return JSON only.",
      'Use the shape {"summaries":[{"noteId":string,"summary":string|null}]}',
      "Each summary should be one short sentence that helps a developer decide whether to open the note.",
      "Do not invent facts. Return null when the note does not contain enough signal.",
    ].join(" "),
    userPrompt: [
      "Please create compressed summary hints for these notes.",
      "Keep each hint concise and directly reusable for triage.",
      JSON.stringify(notePayload, null, 2),
    ].join("\n\n"),
  };
}
