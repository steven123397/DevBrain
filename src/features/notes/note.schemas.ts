import { z } from "zod";

import {
  noteConfidenceValues,
  noteStatusValues,
  sourceTypeValues,
} from "./note.types";
import {
  normalizeStackName,
  normalizeTagName,
} from "./note.normalization";

const noteSortValues = ["updatedAtDesc", "createdAtDesc"] as const;
type DigestedFieldName =
  | "summary"
  | "problem"
  | "solution"
  | "stack"
  | "tags";

const createOptionalTextField = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => {
    if (value == null) {
      return null;
    }

    return value.length > 0 ? value : null;
  });

const updateOptionalTextField = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value.length === 0) {
      return null;
    }

    return value;
  });

const createOptionalStackField = createOptionalTextField.transform((value) => {
  if (value == null) {
    return null;
  }

  return normalizeStackName(value);
});

const updateOptionalStackField = updateOptionalTextField.transform((value) => {
  if (value === undefined || value === null) {
    return value;
  }

  return normalizeStackName(value);
});

const createOptionalUrlField = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((value) => value == null || value.length === 0 || URL.canParse(value), {
    message: "sourceUrl must be a valid URL",
  })
  .transform((value) => {
    if (value == null || value.length === 0) {
      return null;
    }

    return value;
  });

const updateOptionalUrlField = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((value) => value == null || value.length === 0 || URL.canParse(value), {
    message: "sourceUrl must be a valid URL",
  })
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value.length === 0) {
      return null;
    }

    return value;
  });

const createNormalizedTagArray = z
  .array(z.string().trim().min(1, "tag cannot be empty"))
  .optional()
  .default([])
  .transform((tags) =>
    Array.from(
      new Set(tags.map((tag) => normalizeTagName(tag)).filter(Boolean)),
    ),
  );

const updateNormalizedTagArray = z
  .array(z.string().trim().min(1, "tag cannot be empty"))
  .optional()
  .transform((tags) => {
    if (tags === undefined) {
      return undefined;
    }

    return Array.from(
      new Set(tags.map((tag) => normalizeTagName(tag)).filter(Boolean)),
    );
  });

const normalizedFilterText = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) {
      return undefined;
    }

    return value;
  });

const normalizedTagFilter = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) {
      return undefined;
    }

    return normalizeTagName(value);
  });

const normalizedStackFilter = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) {
      return undefined;
    }

    return normalizeStackName(value);
  });

function hasStructuredText(value: string | null | undefined) {
  return value != null && value.trim().length > 0;
}

function addFieldError(
  fieldErrors: Partial<Record<DigestedFieldName, string[]>>,
  field: DigestedFieldName,
  message: string,
) {
  const bucket = fieldErrors[field] ?? [];
  bucket.push(message);
  fieldErrors[field] = bucket;
}

export function getDigestedFieldErrors(input: {
  status?: (typeof noteStatusValues)[number];
  summary?: string | null;
  problem?: string | null;
  solution?: string | null;
  tags?: string[];
  stack?: string | null;
}): Partial<Record<DigestedFieldName, string[]>> {
  if (input.status !== "digested") {
    return {};
  }

  const fieldErrors: Partial<Record<DigestedFieldName, string[]>> = {};

  if (!hasStructuredText(input.summary)) {
    addFieldError(fieldErrors, "summary", "Digested 条目必须补齐摘要。");
  }

  if (!hasStructuredText(input.problem)) {
    addFieldError(fieldErrors, "problem", "Digested 条目必须补齐问题。");
  }

  if (!hasStructuredText(input.solution)) {
    addFieldError(fieldErrors, "solution", "Digested 条目必须补齐方案。");
  }

  if ((input.tags?.length ?? 0) === 0 && !hasStructuredText(input.stack)) {
    const message = "Digested 条目至少需要一个标签或技术栈。";
    addFieldError(fieldErrors, "tags", message);
    addFieldError(fieldErrors, "stack", message);
  }

  return fieldErrors;
}

function appendDigestedIssues(
  input: Parameters<typeof getDigestedFieldErrors>[0],
  ctx: z.RefinementCtx,
) {
  const fieldErrors = getDigestedFieldErrors(input);

  for (const [field, messages] of Object.entries(fieldErrors)) {
    for (const message of messages ?? []) {
      ctx.addIssue({
        code: "custom",
        message,
        path: [field],
      });
    }
  }
}

export const createNoteSchema = z
  .object({
    title: z.string().trim().min(1, "title is required"),
    rawInput: z.string().optional().default(""),
    summary: createOptionalTextField,
    problem: createOptionalTextField,
    solution: createOptionalTextField,
    why: createOptionalTextField,
    commands: createOptionalTextField,
    references: createOptionalTextField,
    tags: createNormalizedTagArray,
    stack: createOptionalStackField,
    status: z.enum(noteStatusValues).default("inbox"),
    confidence: z.enum(noteConfidenceValues).default("draft"),
    sourceType: z.enum(sourceTypeValues).default("manual"),
    sourceUrl: createOptionalUrlField,
  })
  .superRefine((value, ctx) => {
    appendDigestedIssues(value, ctx);
  });

export const updateNoteSchema = z.object({
  title: z.string().trim().min(1, "title is required").optional(),
  rawInput: z.string().optional(),
  summary: updateOptionalTextField,
  problem: updateOptionalTextField,
  solution: updateOptionalTextField,
  why: updateOptionalTextField,
  commands: updateOptionalTextField,
  references: updateOptionalTextField,
  tags: updateNormalizedTagArray,
  stack: updateOptionalStackField,
  status: z.enum(noteStatusValues).optional(),
  confidence: z.enum(noteConfidenceValues).optional(),
  sourceType: z.enum(sourceTypeValues).optional(),
  sourceUrl: updateOptionalUrlField,
});

export const noteFiltersSchema = z.object({
  query: normalizedFilterText,
  status: z.enum(noteStatusValues).optional(),
  tag: normalizedTagFilter,
  stack: normalizedStackFilter,
  sort: z.enum(noteSortValues).default("updatedAtDesc"),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type NoteSort = (typeof noteSortValues)[number];

export type CreateNoteInput = z.input<typeof createNoteSchema>;
export type CreateNoteValues = z.output<typeof createNoteSchema>;
export type UpdateNoteInput = z.input<typeof updateNoteSchema>;
export type UpdateNoteValues = z.output<typeof updateNoteSchema>;
export type NoteFiltersInput = z.input<typeof noteFiltersSchema>;
export type NoteFiltersValues = z.output<typeof noteFiltersSchema>;
