import { z } from "zod";

import {
  noteConfidenceValues,
  noteStatusValues,
  sourceTypeValues,
} from "./note.types";

const noteSortValues = ["updatedAtDesc", "createdAtDesc"] as const;

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

const normalizedTagArray = z
  .array(z.string().trim().min(1, "tag cannot be empty"))
  .optional()
  .default([])
  .transform((tags) => Array.from(new Set(tags.map((tag) => tag.toLowerCase()))));

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

    return value.toLowerCase();
  });

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  rawInput: z.string().optional().default(""),
  summary: createOptionalTextField,
  problem: createOptionalTextField,
  solution: createOptionalTextField,
  why: createOptionalTextField,
  commands: createOptionalTextField,
  references: createOptionalTextField,
  tags: normalizedTagArray,
  stack: createOptionalTextField,
  status: z.enum(noteStatusValues).default("inbox"),
  confidence: z.enum(noteConfidenceValues).default("draft"),
  sourceType: z.enum(sourceTypeValues).default("manual"),
  sourceUrl: createOptionalUrlField,
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
  tags: normalizedTagArray.optional(),
  stack: updateOptionalTextField,
  status: z.enum(noteStatusValues).optional(),
  confidence: z.enum(noteConfidenceValues).optional(),
  sourceType: z.enum(sourceTypeValues).optional(),
  sourceUrl: updateOptionalUrlField,
});

export const noteFiltersSchema = z.object({
  query: normalizedFilterText,
  status: z.enum(noteStatusValues).optional(),
  tag: normalizedTagFilter,
  stack: normalizedFilterText,
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
