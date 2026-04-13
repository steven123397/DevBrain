import {
  getDigestedFieldErrors,
  updateNoteSchema,
  type UpdateNoteInput,
} from "@/features/notes/note.schemas";
import {
  noteConfidenceValues,
  noteStatusValues,
  sourceTypeValues,
  type KnowledgeNote,
  type NoteConfidence,
  type NoteStatus,
  type SourceType,
} from "@/features/notes/note.types";

export interface UpdateNoteFormValues {
  noteId: string;
  title: string;
  rawInput: string;
  summary: string;
  problem: string;
  solution: string;
  why: string;
  commands: string;
  references: string;
  tags: string;
  stack: string;
  status: NoteStatus;
  confidence: NoteConfidence;
  sourceType: SourceType;
  sourceUrl: string;
}

export interface UpdateNoteFormState {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof UpdateNoteFormValues, string[]>>;
  values: UpdateNoteFormValues;
}

export interface UpdateNoteActionDependencies {
  updateNote: (
    noteId: string,
    input: UpdateNoteInput,
  ) => Promise<Pick<KnowledgeNote, "id"> | null>;
  redirect: (location: string) => never;
}

interface UpdateNoteActionInput {
  noteId: string;
  title: string;
  rawInput: string;
  summary: string;
  problem: string;
  solution: string;
  why: string;
  commands: string;
  references: string;
  tags: string[];
  stack?: string;
  status?: string;
  confidence?: string;
  sourceType?: string;
  sourceUrl?: string;
}

function readTextField(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value : "";
}

function parseTags(tagInput: string) {
  return tagInput
    .split(/[\n,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeStatus(status: string): NoteStatus {
  if (noteStatusValues.includes(status as NoteStatus)) {
    return status as NoteStatus;
  }

  return "inbox";
}

function normalizeConfidence(confidence: string): NoteConfidence {
  if (noteConfidenceValues.includes(confidence as NoteConfidence)) {
    return confidence as NoteConfidence;
  }

  return "draft";
}

function normalizeSourceType(sourceType: string): SourceType {
  if (sourceTypeValues.includes(sourceType as SourceType)) {
    return sourceType as SourceType;
  }

  return "manual";
}

export function createUpdateNoteFormValues(
  note: KnowledgeNote,
): UpdateNoteFormValues {
  return {
    noteId: note.id,
    title: note.title,
    rawInput: note.rawInput,
    summary: note.summary ?? "",
    problem: note.problem ?? "",
    solution: note.solution ?? "",
    why: note.why ?? "",
    commands: note.commands ?? "",
    references: note.references ?? "",
    tags: note.tags.join(", "),
    stack: note.stack ?? "",
    status: note.status,
    confidence: note.confidence,
    sourceType: note.sourceType,
    sourceUrl: note.sourceUrl ?? "",
  };
}

export function createInitialUpdateNoteFormState(
  values: UpdateNoteFormValues,
): UpdateNoteFormState {
  return {
    status: "idle",
    values,
  };
}

function buildFormValues(input: {
  noteId?: string;
  title?: string;
  rawInput?: string;
  summary?: string;
  problem?: string;
  solution?: string;
  why?: string;
  commands?: string;
  references?: string;
  tags?: string;
  stack?: string;
  status?: string;
  confidence?: string;
  sourceType?: string;
  sourceUrl?: string;
}): UpdateNoteFormValues {
  return {
    noteId: input.noteId ?? "",
    title: input.title ?? "",
    rawInput: input.rawInput ?? "",
    summary: input.summary ?? "",
    problem: input.problem ?? "",
    solution: input.solution ?? "",
    why: input.why ?? "",
    commands: input.commands ?? "",
    references: input.references ?? "",
    tags: input.tags ?? "",
    stack: input.stack ?? "",
    status: normalizeStatus(input.status ?? ""),
    confidence: normalizeConfidence(input.confidence ?? ""),
    sourceType: normalizeSourceType(input.sourceType ?? ""),
    sourceUrl: input.sourceUrl ?? "",
  };
}

function selectFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Partial<Record<keyof UpdateNoteFormValues, string[]>> {
  return {
    title: fieldErrors.title,
    rawInput: fieldErrors.rawInput,
    summary: fieldErrors.summary,
    problem: fieldErrors.problem,
    solution: fieldErrors.solution,
    why: fieldErrors.why,
    commands: fieldErrors.commands,
    references: fieldErrors.references,
    tags: fieldErrors.tags,
    stack: fieldErrors.stack,
    status: fieldErrors.status,
    confidence: fieldErrors.confidence,
    sourceType: fieldErrors.sourceType,
    sourceUrl: fieldErrors.sourceUrl,
  };
}

function mergeFieldErrors(
  base: Partial<Record<keyof UpdateNoteFormValues, string[]>>,
  extra: Partial<Record<keyof UpdateNoteFormValues, string[]>>,
): Partial<Record<keyof UpdateNoteFormValues, string[]>> {
  const merged = { ...base };

  for (const [field, messages] of Object.entries(extra) as Array<
    [keyof UpdateNoteFormValues, string[] | undefined]
  >) {
    if (!messages || messages.length === 0) {
      continue;
    }

    merged[field] = [...(merged[field] ?? []), ...messages];
  }

  return merged;
}

export function extractUpdateNoteInput(
  formData: FormData,
): UpdateNoteActionInput {
  const noteId = readTextField(formData, "noteId");
  const title = readTextField(formData, "title");
  const rawInput = readTextField(formData, "rawInput");
  const summary = readTextField(formData, "summary");
  const problem = readTextField(formData, "problem");
  const solution = readTextField(formData, "solution");
  const why = readTextField(formData, "why");
  const commands = readTextField(formData, "commands");
  const references = readTextField(formData, "references");
  const tags = readTextField(formData, "tags");
  const stack = readTextField(formData, "stack");
  const status = readTextField(formData, "status");
  const confidence = readTextField(formData, "confidence");
  const sourceType = readTextField(formData, "sourceType");
  const sourceUrl = readTextField(formData, "sourceUrl");

  return {
    noteId,
    title,
    rawInput,
    summary,
    problem,
    solution,
    why,
    commands,
    references,
    tags: parseTags(tags),
    stack: stack || undefined,
    status: status || undefined,
    confidence: confidence || undefined,
    sourceType: sourceType || undefined,
    sourceUrl: sourceUrl || undefined,
  };
}

export async function runUpdateNoteAction(
  _previousState: UpdateNoteFormState,
  formData: FormData,
  dependencies: UpdateNoteActionDependencies,
): Promise<UpdateNoteFormState> {
  const rawValues = {
    noteId: readTextField(formData, "noteId"),
    title: readTextField(formData, "title"),
    rawInput: readTextField(formData, "rawInput"),
    summary: readTextField(formData, "summary"),
    problem: readTextField(formData, "problem"),
    solution: readTextField(formData, "solution"),
    why: readTextField(formData, "why"),
    commands: readTextField(formData, "commands"),
    references: readTextField(formData, "references"),
    tags: readTextField(formData, "tags"),
    stack: readTextField(formData, "stack"),
    status: readTextField(formData, "status"),
    confidence: readTextField(formData, "confidence"),
    sourceType: readTextField(formData, "sourceType"),
    sourceUrl: readTextField(formData, "sourceUrl"),
  };
  const input = extractUpdateNoteInput(formData);
  const parsed = updateNoteSchema.safeParse({
    title: input.title,
    rawInput: input.rawInput,
    summary: input.summary,
    problem: input.problem,
    solution: input.solution,
    why: input.why,
    commands: input.commands,
    references: input.references,
    tags: input.tags,
    stack: input.stack,
    status: input.status,
    confidence: input.confidence,
    sourceType: input.sourceType,
    sourceUrl: input.sourceUrl,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "请先修正表单后再保存。",
      fieldErrors: selectFieldErrors(parsed.error.flatten().fieldErrors),
      values: buildFormValues(rawValues),
    };
  }

  const digestedFieldErrors = getDigestedFieldErrors(parsed.data);
  if (Object.keys(digestedFieldErrors).length > 0) {
    return {
      status: "error",
      message: "要标记为 Digested，请先补齐摘要、问题、方案，并至少填写一个标签或技术栈。",
      fieldErrors: mergeFieldErrors({}, digestedFieldErrors),
      values: buildFormValues(rawValues),
    };
  }

  const updated = await dependencies.updateNote(input.noteId, parsed.data);
  if (!updated) {
    return {
      status: "error",
      message: "条目不存在或已被删除，请返回列表确认。",
      values: buildFormValues(rawValues),
    };
  }

  dependencies.redirect(`/notes/${updated.id}`);
}
