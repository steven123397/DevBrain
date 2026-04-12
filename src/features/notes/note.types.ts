export const noteStatusValues = ["inbox", "digested", "archived"] as const;
export type NoteStatus = (typeof noteStatusValues)[number];

export const noteConfidenceValues = ["draft", "tested", "trusted"] as const;
export type NoteConfidence = (typeof noteConfidenceValues)[number];

export const sourceTypeValues = [
  "manual",
  "article",
  "chat",
  "terminal",
  "doc",
  "other",
] as const;
export type SourceType = (typeof sourceTypeValues)[number];

export interface KnowledgeNote {
  id: string;
  title: string;
  rawInput: string;
  summary: string | null;
  problem: string | null;
  solution: string | null;
  why: string | null;
  commands: string | null;
  references: string | null;
  tags: string[];
  stack: string | null;
  status: NoteStatus;
  confidence: NoteConfidence;
  sourceType: SourceType;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoteDashboardOverview {
  totalNotes: number;
  inboxCount: number;
  digestedCount: number;
  recentNotes: KnowledgeNote[];
}

export interface NoteFilterOptions {
  tags: string[];
  stacks: string[];
}
