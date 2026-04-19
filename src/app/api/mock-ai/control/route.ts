import { NextResponse } from "next/server";

import {
  getTestAIControlState,
  isTestAIResponseMode,
  isTestAIControlEnabled,
  resetTestAIControlState,
  updateTestAIControlState,
} from "@/features/ai/ai.test-control";

interface MockAIControlPayload {
  forceDisabled?: boolean;
  mode?: string;
  reset?: boolean;
}

function buildDisabledResponse() {
  return NextResponse.json(
    {
      error: {
        message: "Mock AI control route is disabled.",
      },
    },
    { status: 404 },
  );
}

export async function GET() {
  if (!isTestAIControlEnabled()) {
    return buildDisabledResponse();
  }

  return NextResponse.json(getTestAIControlState());
}

export async function POST(request: Request) {
  if (!isTestAIControlEnabled()) {
    return buildDisabledResponse();
  }

  const payload = (await request.json().catch(() => ({}))) as MockAIControlPayload;

  try {
    const state = payload.reset
      ? resetTestAIControlState()
      : updateTestAIControlState({
          forceDisabled:
            typeof payload.forceDisabled === "boolean"
              ? payload.forceDisabled
              : undefined,
          mode:
            typeof payload.mode === "string" && isTestAIResponseMode(payload.mode)
              ? payload.mode
              : undefined,
        });

    return NextResponse.json(state);
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof Error ? error.message : "Invalid mock AI control payload.",
        },
      },
      { status: 400 },
    );
  }
}
