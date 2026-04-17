import { sql } from "drizzle-orm";

import { notes } from "@/db/schema";

import {
  analyzeSearchText,
  normalizeStackName,
} from "./note.normalization";
import type { KnowledgeNote } from "./note.types";

interface SearchFieldWeights {
  phrase: number;
  token: number;
  structured: number;
  canonical: number;
}

type SearchAnalysis = ReturnType<typeof analyzeSearchText>;

const searchableFieldExpressions = [
  sql`lower(${notes.title})`,
  sql`lower(${notes.rawInput})`,
  sql`lower(coalesce(${notes.summary}, ''))`,
  sql`lower(coalesce(${notes.problem}, ''))`,
  sql`lower(coalesce(${notes.solution}, ''))`,
  sql`lower(coalesce(${notes.why}, ''))`,
  sql`lower(coalesce(${notes.commands}, ''))`,
  sql`lower(coalesce(${notes.references}, ''))`,
];

const tokenStopWords = new Set(["db", "file"]);
const broadPackageManagerTokens = new Set(["pnpm", "npm", "yarn", "bun"]);

function uniqueIntersection(left: string[], right: string[]) {
  const rightSet = new Set(right);
  return Array.from(new Set(left.filter((token) => rightSet.has(token))));
}

function filterScoredTokens(tokens: string[]) {
  return tokens.filter((token) => !tokenStopWords.has(token));
}

function isBroadPackageManagerQuery(queryAnalysis: SearchAnalysis) {
  const tokens = filterScoredTokens(queryAnalysis.tokens);

  return (
    queryAnalysis.structuredTokens.length === 0 &&
    queryAnalysis.canonicalKeys.length === 0 &&
    tokens.length === 1 &&
    broadPackageManagerTokens.has(tokens[0] ?? "")
  );
}

function scaleScore(score: number, multiplier: number) {
  if (multiplier === 1) {
    return score;
  }

  return Math.round(score * multiplier);
}

function buildSearchPatterns(query: string) {
  const analysis = analyzeSearchText(query);
  return Array.from(
    new Set(
      [
        ...analysis.phraseVariants,
        ...analysis.structuredTokens,
        ...filterScoredTokens(analysis.tokens).filter((value) => {
          if (/[\u4e00-\u9fff]/.test(value)) {
            return value.length >= 2;
          }

          return value.length >= 3;
        }),
      ].filter((value) => value.length >= 2),
    ),
  );
}

function scoreFieldMatch(
  value: string | null,
  query: string,
  weights: SearchFieldWeights,
) {
  if (!value) {
    return 0;
  }

  const queryAnalysis = analyzeSearchText(query);
  if (!queryAnalysis.normalized) {
    return 0;
  }

  const valueAnalysis = analyzeSearchText(value);
  const phraseMatches = queryAnalysis.phraseVariants.filter(
    (phrase) =>
      valueAnalysis.normalized.includes(phrase) || valueAnalysis.loose.includes(phrase),
  );
  const tokenMatches = uniqueIntersection(
    filterScoredTokens(queryAnalysis.tokens),
    filterScoredTokens(valueAnalysis.tokens),
  );
  const structuredMatches = uniqueIntersection(
    queryAnalysis.structuredTokens,
    valueAnalysis.structuredTokens,
  );
  const canonicalMatches = uniqueIntersection(
    queryAnalysis.canonicalKeys,
    valueAnalysis.canonicalKeys,
  );

  return (
    phraseMatches.length * weights.phrase +
    tokenMatches.length * weights.token +
    structuredMatches.length * weights.structured +
    canonicalMatches.length * weights.canonical
  );
}

export function buildNoteSearchCondition(query: string) {
  const patterns = buildSearchPatterns(query);
  if (patterns.length === 0) {
    return sql`1 = 1`;
  }

  const clauses = patterns.flatMap((pattern) =>
    searchableFieldExpressions.map((field) => sql`${field} like ${`%${pattern}%`}`),
  );

  return sql`(${sql.join(clauses, sql` or `)})`;
}

export function scoreNoteSearch(note: KnowledgeNote, rawQuery: string) {
  const queryAnalysis = analyzeSearchText(rawQuery);
  if (!queryAnalysis.normalized) {
    return 0;
  }
  const broadPackageManagerQuery = isBroadPackageManagerQuery(queryAnalysis);
  const broadBodyMultiplier = broadPackageManagerQuery ? 0.35 : 1;

  let score = 0;

  score += scoreFieldMatch(note.title, rawQuery, {
    phrase: 110,
    token: 24,
    structured: 18,
    canonical: 30,
  });
  score += scoreFieldMatch(note.summary, rawQuery, {
    phrase: 72,
    token: 16,
    structured: 12,
    canonical: 24,
  });
  score += scoreFieldMatch(note.problem, rawQuery, {
    phrase: 68,
    token: 16,
    structured: 14,
    canonical: 22,
  });
  score += scaleScore(
    scoreFieldMatch(note.solution, rawQuery, {
      phrase: 64,
      token: 14,
      structured: 12,
      canonical: 20,
    }),
    broadBodyMultiplier,
  );
  score += scaleScore(
    scoreFieldMatch(note.why, rawQuery, {
      phrase: 80,
      token: 16,
      structured: 22,
      canonical: 26,
    }),
    broadBodyMultiplier,
  );
  score += scoreFieldMatch(note.rawInput, rawQuery, {
    phrase: 44,
    token: 10,
    structured: 12,
    canonical: 16,
  });
  score += scaleScore(
    scoreFieldMatch(note.commands, rawQuery, {
      phrase: 92,
      token: 18,
      structured: 30,
      canonical: 32,
    }),
    broadBodyMultiplier,
  );
  score += scaleScore(
    scoreFieldMatch(note.references, rawQuery, {
      phrase: 86,
      token: 16,
      structured: 26,
      canonical: 30,
    }),
    broadBodyMultiplier,
  );

  for (const tag of note.tags) {
    score += scoreFieldMatch(tag, rawQuery, {
      phrase: 22,
      token: 10,
      structured: 0,
      canonical: 18,
    });
  }

  if (note.stack) {
    score += scoreFieldMatch(normalizeStackName(note.stack), rawQuery, {
      phrase: 20,
      token: 10,
      structured: 0,
      canonical: 18,
    });
  }

  if (score > 0 && note.status === "digested") {
    score += 10;
  }

  if (score > 0) {
    if (note.confidence === "trusted") {
      score += 6;
    } else if (note.confidence === "tested") {
      score += 4;
    }
  }

  return score;
}
