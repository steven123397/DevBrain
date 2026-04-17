import { describe, expect, it } from "vitest";

import {
  analyzeSearchText,
  normalizeStackName,
  normalizeTagName,
} from "@/features/notes/note.normalization";

describe("note normalization", () => {
  it("keeps existing tag and stack canonicalization stable", () => {
    expect(normalizeTagName(" Next.js ")).toBe("nextjs");
    expect(normalizeTagName("React.js")).toBe("react");
    expect(normalizeStackName("drizzle orm")).toBe("Drizzle ORM");
    expect(normalizeStackName("tailwind css")).toBe("Tailwind CSS");
  });

  it("extracts canonical aliases, structured tokens, and Chinese fragments for search reuse", () => {
    const analysis = analyzeSearchText(
      "drizzle orm 默认主库 DEVBRAIN_DB_FILE 输入框改了列表没变",
    );

    expect(analysis.canonicalKeys).toEqual(
      expect.arrayContaining(["database-target", "drizzle-orm"]),
    );
    expect(analysis.phraseVariants).toEqual(
      expect.arrayContaining([
        "drizzle-orm",
        "validation db",
        "devbrain_db_file",
        "默认主库",
      ]),
    );
    expect(analysis.structuredTokens).toEqual(
      expect.arrayContaining(["devbrain_db_file"]),
    );
    expect(analysis.tokens).toEqual(
      expect.arrayContaining(["输入框", "列表", "没变"]),
    );
  });
});
