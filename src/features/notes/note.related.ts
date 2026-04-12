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
  "before",
  "from",
  "into",
  "with",
  "without",
  "guide",
  "issue",
  "note",
  "notes",
  "problem",
  "solution",
]);

function uniqueIntersection(left: string[], right: string[]) {
  const rightSet = new Set(right);
  return Array.from(new Set(left.filter((token) => rightSet.has(token)))).sort();
}

function formatReason(label: string, values: string[]) {
  return `${label}：${values.join("、")}`;
}

function tokenizeTitle(value: string) {
  const matches = value.toLowerCase().match(/[a-z0-9][a-z0-9.+#/-]*/g) ?? [];

  return matches.filter(
    (token) => token.length >= 3 && !titleStopWords.has(token),
  );
}

function tokenizeCommands(value: string | null) {
  if (!value) {
    return [];
  }

  const matches = value.toLowerCase().match(/[a-z0-9][a-z0-9.+#/-]*/g) ?? [];
  return matches.filter((token) => token.length >= 2);
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

  const sharedTags = uniqueIntersection(base.tags, candidate.tags).map(
    (tag) => `#${tag}`,
  );
  if (sharedTags.length > 0) {
    score += sharedTags.length * 3;
    reasons.push(formatReason("共享标签", sharedTags));
  }

  if (
    base.stack &&
    candidate.stack &&
    base.stack.toLowerCase() === candidate.stack.toLowerCase()
  ) {
    score += 2;
    reasons.push(`同技术栈：${candidate.stack}`);
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
    score += sharedCommandTokens.length;
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
