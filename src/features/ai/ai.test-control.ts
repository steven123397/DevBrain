export const testAIResponseModeValues = [
  "normal",
  "error",
  "malformed",
  "empty",
] as const;

export type TestAIResponseMode = (typeof testAIResponseModeValues)[number];

export interface TestAIControlState {
  forceDisabled: boolean;
  mode: TestAIResponseMode;
}

const defaultTestAIControlState: TestAIControlState = {
  forceDisabled: false,
  mode: "normal",
};

let currentTestAIControlState: TestAIControlState = {
  ...defaultTestAIControlState,
};

export function isTestAIControlEnabled() {
  return process.env.DEVBRAIN_ALLOW_TEST_AI_MOCK === "true";
}

export function isTestAIResponseMode(value: string): value is TestAIResponseMode {
  return testAIResponseModeValues.includes(value as TestAIResponseMode);
}

export function getTestAIControlState(): TestAIControlState {
  if (!isTestAIControlEnabled()) {
    return defaultTestAIControlState;
  }

  return currentTestAIControlState;
}

export function isTestAIDisabled() {
  return isTestAIControlEnabled() && getTestAIControlState().forceDisabled;
}

export function updateTestAIControlState(
  input: Partial<TestAIControlState>,
): TestAIControlState {
  if (!isTestAIControlEnabled()) {
    return defaultTestAIControlState;
  }

  if (
    input.mode &&
    !isTestAIResponseMode(input.mode)
  ) {
    throw new Error(`Unsupported mock AI mode: ${input.mode}`);
  }

  currentTestAIControlState = {
    ...currentTestAIControlState,
    ...input,
  };

  return currentTestAIControlState;
}

export function resetTestAIControlState(): TestAIControlState {
  if (!isTestAIControlEnabled()) {
    return defaultTestAIControlState;
  }

  currentTestAIControlState = { ...defaultTestAIControlState };
  return currentTestAIControlState;
}
