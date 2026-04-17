const tagAliases: Record<string, string> = {
  "next js": "nextjs",
  "next.js": "nextjs",
  nextjs: "nextjs",
  "react js": "react",
  "react.js": "react",
  reactjs: "react",
  "node js": "nodejs",
  "node.js": "nodejs",
  nodejs: "nodejs",
};

const stackAliases: Record<string, string> = {
  "drizzle orm": "Drizzle ORM",
  drizzle: "Drizzle ORM",
  javascript: "JavaScript",
  js: "JavaScript",
  "next js": "Next.js",
  "next.js": "Next.js",
  nextjs: "Next.js",
  "node js": "Node.js",
  "node.js": "Node.js",
  nodejs: "Node.js",
  pnpm: "pnpm",
  react: "React",
  "react js": "React",
  "react.js": "React",
  reactjs: "React",
  sqlite: "SQLite",
  sqlite3: "SQLite",
  tailwind: "Tailwind CSS",
  "tailwind css": "Tailwind CSS",
  tailwindcss: "Tailwind CSS",
  tooling: "Tooling",
  ts: "TypeScript",
  typescript: "TypeScript",
};

interface CanonicalTermDefinition {
  key: string;
  label: string;
  aliases: string[];
}

export interface SearchTextAnalysis {
  normalized: string;
  loose: string;
  phraseVariants: string[];
  tokens: string[];
  structuredTokens: string[];
  canonicalKeys: string[];
}

const canonicalTermDefinitions: CanonicalTermDefinition[] = [
  {
    key: "drizzle-orm",
    label: "drizzle-orm",
    aliases: ["drizzle orm", "drizzle-orm"],
  },
  {
    key: "drizzle-kit",
    label: "drizzle-kit",
    aliases: ["drizzle kit", "drizzle-kit"],
  },
  {
    key: "db-migrate",
    label: "db:migrate",
    aliases: ["db migrate", "db:migrate", "migrate", "migration", "migrations"],
  },
  {
    key: "db-seed",
    label: "seed",
    aliases: ["seed", "seed data", "demo seed", "pnpm seed"],
  },
  {
    key: "better-sqlite3",
    label: "better-sqlite3",
    aliases: ["better sqlite3", "better-sqlite3", "bindings"],
  },
  {
    key: "database-target",
    label: "数据库目标",
    aliases: [
      "validation db",
      "validation 库",
      "demo db",
      "默认主库",
      "主库",
      "default db",
      "default main db",
      "main db",
      "database file",
      "db file",
      "DEVBRAIN_DB_FILE",
    ],
  },
  {
    key: "server-action",
    label: "server action",
    aliases: ["server action", "server actions"],
  },
  {
    key: "server-component",
    label: "server component",
    aliases: ["server component", "server components"],
  },
  {
    key: "hydration-mismatch",
    label: "hydration mismatch",
    aliases: ["hydration mismatch"],
  },
];

function collapseWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeLookupValue(value: string) {
  return collapseWhitespace(value).toLowerCase();
}

function normalizeLooseLookupValue(value: string) {
  return collapseWhitespace(value)
    .replace(/[_:/.-]+/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function extractAsciiTokens(value: string) {
  return value.match(/[a-z0-9][a-z0-9.+#/_:-]*/g) ?? [];
}

function buildChineseFragments(value: string) {
  const fragments: string[] = [];
  const runs = value.match(/[\u4e00-\u9fff]{2,}/g) ?? [];

  for (const run of runs) {
    fragments.push(run);

    if (run.length <= 2) {
      continue;
    }

    for (let size = 2; size <= Math.min(3, run.length); size += 1) {
      for (let index = 0; index <= run.length - size; index += 1) {
        fragments.push(run.slice(index, index + size));
      }
    }
  }

  return uniqueValues(fragments);
}

function matchesAlias(
  normalizedValue: string,
  looseValue: string,
  alias: string,
) {
  const normalizedAlias = normalizeLookupValue(alias);
  const looseAlias = normalizeLooseLookupValue(alias);

  return (
    (normalizedAlias.length > 0 && normalizedValue.includes(normalizedAlias)) ||
    (looseAlias.length > 0 && looseValue.includes(looseAlias))
  );
}

export function normalizeTagName(value: string) {
  const normalized = normalizeLookupValue(value).replace(/^#+/, "");
  if (!normalized) {
    return "";
  }

  return tagAliases[normalized] ?? normalized;
}

export function normalizeStackName(value: string) {
  const collapsed = collapseWhitespace(value);
  if (!collapsed) {
    return "";
  }

  return stackAliases[collapsed.toLowerCase()] ?? collapsed;
}

export function normalizeSearchText(value: string) {
  return collapseWhitespace(value).toLowerCase();
}

export function analyzeSearchText(value: string): SearchTextAnalysis {
  const normalized = normalizeSearchText(value);
  const loose = normalizeLooseLookupValue(value);
  const exactTokens = extractAsciiTokens(normalized);
  const looseTokens = extractAsciiTokens(loose);
  const chineseFragments = buildChineseFragments(normalized);
  const canonicalDefinitions = canonicalTermDefinitions.filter((definition) =>
    definition.aliases.some((alias) => matchesAlias(normalized, loose, alias)),
  );
  const phraseVariants = uniqueValues([
    normalized,
    ...canonicalDefinitions.flatMap((definition) =>
      definition.aliases.map((alias) => normalizeSearchText(alias)),
    ),
  ]);
  const tokens = uniqueValues([
    ...exactTokens,
    ...looseTokens,
    ...chineseFragments,
  ]);
  const structuredTokens = uniqueValues(
    exactTokens.filter((token) => /[_:/.-]/.test(token)),
  );

  return {
    normalized,
    loose,
    phraseVariants,
    tokens,
    structuredTokens,
    canonicalKeys: canonicalDefinitions.map((definition) => definition.key),
  };
}

export function describeCanonicalTerms(keys: string[]) {
  const labelMap = new Map(
    canonicalTermDefinitions.map((definition) => [definition.key, definition.label]),
  );

  return uniqueValues(keys.map((key) => labelMap.get(key) ?? key)).sort();
}
