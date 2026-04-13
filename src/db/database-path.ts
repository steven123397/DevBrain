import path from "node:path";

export interface DatabasePathResolution {
  databaseFilePath: string;
  usesDefaultPath: boolean;
}

export function resolveDatabaseFilePath(
  env: NodeJS.ProcessEnv = process.env,
  cwd = process.cwd(),
): DatabasePathResolution {
  const configuredPath = env.DEVBRAIN_DB_FILE?.trim();
  if (configuredPath) {
    return {
      databaseFilePath: path.resolve(cwd, configuredPath),
      usesDefaultPath: false,
    };
  }

  return {
    databaseFilePath: path.join(cwd, "data", "devbrain.sqlite"),
    usesDefaultPath: true,
  };
}
