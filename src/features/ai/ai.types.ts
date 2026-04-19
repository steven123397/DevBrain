import type { KnowledgeNote } from "@/features/notes/note.types";

export const aiProviderValues = ["dashscope"] as const;
export type AIProviderName = (typeof aiProviderValues)[number];

export const fieldCandidateConfidenceValues = ["low", "medium", "high"] as const;
export type FieldCandidateConfidence = (typeof fieldCandidateConfidenceValues)[number];

export interface FieldCandidate {
  value: string;
  confidence: FieldCandidateConfidence;
}

export interface FieldCandidates {
  summary: FieldCandidate | null;
  problem: FieldCandidate | null;
  solution: FieldCandidate | null;
  why: FieldCandidate | null;
}

export interface TagSuggestions {
  suggestedTags: string[];
  suggestedStack: string | null;
}

export interface ExtractStructuredFieldsInput {
  rawInput: string;
  existingNote?: Partial<KnowledgeNote>;
}

export interface SuggestTagsInput {
  rawInput: string;
  existingTags: string[];
  existingStack?: string | null;
}

export interface CompressSummariesInput {
  notes: KnowledgeNote[];
}

export type CompressedSummaryMap = Record<string, string>;

export interface AIProvider {
  name: AIProviderName;
  extractStructuredFields(input: ExtractStructuredFieldsInput): Promise<FieldCandidates>;
  suggestTags(input: SuggestTagsInput): Promise<TagSuggestions>;
  compressSummaries(input: CompressSummariesInput): Promise<CompressedSummaryMap>;
}

export const emptyFieldCandidates: FieldCandidates = {
  summary: null,
  problem: null,
  solution: null,
  why: null,
};
