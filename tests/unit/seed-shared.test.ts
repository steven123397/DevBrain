import { describe, expect, it } from "vitest";

import { assertSafeSeedTarget } from "@/db/seed.shared";

describe("assertSafeSeedTarget", () => {
  it("rejects resetting the default database path without explicit opt-in", () => {
    expect(() =>
      assertSafeSeedTarget({
        databaseFilePath: "/repo/data/devbrain.sqlite",
        usesDefaultPath: true,
        allowDefaultReset: false,
      }),
    ).toThrow(/default database/i);
  });

  it("allows resetting an explicit review database path", () => {
    expect(() =>
      assertSafeSeedTarget({
        databaseFilePath: "/repo/data/devbrain.demo.sqlite",
        usesDefaultPath: false,
        allowDefaultReset: false,
      }),
    ).not.toThrow();
  });
});
