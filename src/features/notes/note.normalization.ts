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

function collapseWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeLookupValue(value: string) {
  return collapseWhitespace(value).toLowerCase();
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
