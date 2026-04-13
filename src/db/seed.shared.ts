export function assertSafeSeedTarget(input: {
  databaseFilePath: string;
  usesDefaultPath: boolean;
  allowDefaultReset: boolean;
}) {
  if (!input.usesDefaultPath || input.allowDefaultReset) {
    return;
  }

  throw new Error(
    `Refusing to reset the default database path (${input.databaseFilePath}). ` +
      "Set DEVBRAIN_DB_FILE to a dedicated demo database or set " +
      "DEVBRAIN_ALLOW_DEFAULT_DB_RESET=true if you really want to overwrite the main local database.",
  );
}
