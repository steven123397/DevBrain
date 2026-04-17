import {
  analyzeSearchText,
  describeCanonicalTerms,
  normalizeStackName,
  normalizeTagName,
} from "./note.normalization";
import type { KnowledgeNote } from "./note.types";

export interface RelatedNoteRecommendation {
  note: KnowledgeNote;
  score: number;
  reasons: string[];
}

interface RelatedScore {
  score: number;
  reasons: string[];
}

const titleStopWords = new Set([
  "after",
  "action",
  "before",
  "component",
  "database",
  "db",
  "default",
  "demo",
  "file",
  "files",
  "from",
  "into",
  "with",
  "without",
  "guide",
  "issue",
  "main",
  "note",
  "notes",
  "problem",
  "server",
  "solution",
  "validation",
]);

function uniqueIntersection(left: string[], right: string[]) {
  const rightSet = new Set(right);
  return Array.from(new Set(left.filter((token) => rightSet.has(token)))).sort();
}

function formatReason(label: string, values: string[]) {
  return `${label}：${values.join("、")}`;
}

function tokenizeTitle(value: string) {
  const analysis = analyzeSearchText(value);

  return analysis.tokens.filter(
    (token) => token.length >= 3 && !titleStopWords.has(token),
  );
}

function tokenizeCommands(value: string | null) {
  if (!value) {
    return [];
  }

  const analysis = analyzeSearchText(value);

  return analysis.structuredTokens.filter(
    (token) =>
      token.length >= 3 &&
      !token.includes("/") &&
      !token.endsWith(".sqlite") &&
      !token.endsWith(".ts"),
  );
}

function collectCanonicalTerms(note: KnowledgeNote) {
  const combined = [
    note.title,
    note.rawInput,
    note.summary,
    note.problem,
    note.solution,
    note.why,
    note.commands,
    note.references,
    note.stack,
    note.tags.join(" "),
  ]
    .filter(Boolean)
    .join(" ");

  return analyzeSearchText(combined).canonicalKeys;
}

export function scoreRelated(
  base: KnowledgeNote,
  candidate: KnowledgeNote,
): RelatedScore {
  if (base.id === candidate.id) {
    return {
      score: 0,
      reasons: [],
    };
  }

  const reasons: string[] = [];
  let score = 0;

  const sharedTags = uniqueIntersection(
    base.tags.map(normalizeTagName),
    candidate.tags.map(normalizeTagName),
  ).map(
    (tag) => `#${tag}`,
  );
  if (sharedTags.length > 0) {
    score += sharedTags.length * 4;
    reasons.push(formatReason("共享标签", sharedTags));
  }

  if (
    base.stack &&
    candidate.stack &&
    normalizeStackName(base.stack) === normalizeStackName(candidate.stack)
  ) {
    score += 3;
    reasons.push(`同技术栈：${normalizeStackName(candidate.stack)}`);
  }

  const sharedCanonicalTerms = uniqueIntersection(
    collectCanonicalTerms(base),
    collectCanonicalTerms(candidate),
  );
  if (sharedCanonicalTerms.length > 0) {
    score += sharedCanonicalTerms.length * 4;
    reasons.push(
      formatReason("共享术语", describeCanonicalTerms(sharedCanonicalTerms)),
    );
  }

  const sharedTitleTokens = uniqueIntersection(
    tokenizeTitle(base.title),
    tokenizeTitle(candidate.title),
  );
  if (sharedTitleTokens.length > 0) {
    score += sharedTitleTokens.length;
    reasons.push(formatReason("标题词重叠", sharedTitleTokens));
  }

  const sharedCommandTokens = uniqueIntersection(
    tokenizeCommands(base.commands),
    tokenizeCommands(candidate.commands),
  );
  if (sharedCommandTokens.length > 0) {
    score += sharedCommandTokens.length * 2;
    reasons.push(formatReason("命令词重叠", sharedCommandTokens));
  }

  return {
    score,
    reasons,
  };
}

export function buildRelatedRecommendations(
  base: KnowledgeNote,
  candidates: KnowledgeNote[],
  limit = 4,
): RelatedNoteRecommendation[] {
  return candidates
    .map((candidate) => ({
      note: candidate,
      ...scoreRelated(base, candidate),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (right.note.updatedAt !== left.note.updatedAt) {
        return right.note.updatedAt.localeCompare(left.note.updatedAt);
      }

      return left.note.title.localeCompare(right.note.title);
    })
    .slice(0, limit);
}
