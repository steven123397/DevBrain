import {
  createNoteSchema,
  type CreateNoteInput,
} from "@/features/notes/note.schemas";
import {
  sourceTypeValues,
  type KnowledgeNote,
  type SourceType,
} from "@/features/notes/note.types";

export interface CreateNoteFormValues {
  title: string;
  rawInput: string;
  tags: string;
  stack: string;
  sourceType: SourceType;
  sourceUrl: string;
}

export interface CreateNoteFormState {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof CreateNoteFormValues, string[]>>;
  values: CreateNoteFormValues;
}

export const initialCreateNoteFormValues: CreateNoteFormValues = {
  title: "",
  rawInput: "",
  tags: "",
  stack: "",
  sourceType: "manual",
  sourceUrl: "",
};

export const initialCreateNoteFormState: CreateNoteFormState = {
  status: "idle",
  values: initialCreateNoteFormValues,
};

export interface CreateNoteActionDependencies {
  createNote: (input: CreateNoteInput) => Promise<Pick<KnowledgeNote, "id">>;
  redirect: (location: string) => never;
}

interface CreateNoteActionInput {
  title: string;
  rawInput: string;
  tags: string[];
  stack?: string;
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

function normalizeSourceType(sourceType: string): SourceType {
  if (sourceTypeValues.includes(sourceType as SourceType)) {
    return sourceType as SourceType;
  }

  return "manual";
}

function buildFormValues(input: {
  title?: string;
  rawInput?: string;
  tags?: string;
  stack?: string;
  sourceType?: string;
  sourceUrl?: string;
}): CreateNoteFormValues {
  return {
    title: input.title ?? "",
    rawInput: input.rawInput ?? "",
    tags: input.tags ?? "",
    stack: input.stack ?? "",
    sourceType: normalizeSourceType(input.sourceType ?? ""),
    sourceUrl: input.sourceUrl ?? "",
  };
}

function selectFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Partial<Record<keyof CreateNoteFormValues, string[]>> {
  return {
    title: fieldErrors.title,
    rawInput: fieldErrors.rawInput,
    tags: fieldErrors.tags,
    stack: fieldErrors.stack,
    sourceType: fieldErrors.sourceType,
    sourceUrl: fieldErrors.sourceUrl,
  };
}

export function extractCreateNoteInput(
  formData: FormData,
): CreateNoteActionInput {
  const title = readTextField(formData, "title");
  const rawInput = readTextField(formData, "rawInput");
  const tags = readTextField(formData, "tags");
  const stack = readTextField(formData, "stack");
  const sourceType = readTextField(formData, "sourceType");
  const sourceUrl = readTextField(formData, "sourceUrl");

  return {
    title,
    rawInput,
    tags: parseTags(tags),
    stack: stack || undefined,
    sourceType: sourceType || undefined,
    sourceUrl: sourceUrl || undefined,
  };
}

export async function runCreateNoteAction(
  _previousState: CreateNoteFormState,
  formData: FormData,
  dependencies: CreateNoteActionDependencies,
): Promise<CreateNoteFormState> {
  const rawValues = {
    title: readTextField(formData, "title"),
    rawInput: readTextField(formData, "rawInput"),
    tags: readTextField(formData, "tags"),
    stack: readTextField(formData, "stack"),
    sourceType: readTextField(formData, "sourceType"),
    sourceUrl: readTextField(formData, "sourceUrl"),
  };
  const input = extractCreateNoteInput(formData);
  const parsed = createNoteSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: "请先修正表单后再提交。",
      fieldErrors: selectFieldErrors(parsed.error.flatten().fieldErrors),
      values: buildFormValues(rawValues),
    };
  }

  const created = await dependencies.createNote(parsed.data);
  dependencies.redirect(`/notes/${created.id}`);
}
