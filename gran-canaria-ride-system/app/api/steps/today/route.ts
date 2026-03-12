import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import {
  DAILY_STEP_GOAL,
  estimateRewardPointsFromSteps,
  getStartOfUtcDay,
  toStepProgress,
} from "@/lib/steps";

export async function GET(request: NextRequest) {
  const authResult = await authenticate(request);
  if (authResult.error || !authResult.user) {
    return authResult.error;
  }

  try {
    const today = getStartOfUtcDay();

    const record = await prisma.stepDaily.findUnique({
      where: {
        userId_date: {
          userId: authResult.user.id,
          date: today,
        },
      },
      select: {
        steps: true,
        updatedAt: true,
      },
    });

    const steps = record?.steps ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        date: today.toISOString(),
        steps,
        goal: DAILY_STEP_GOAL,
        progressPercent: toStepProgress(steps),
        estimatedRewardPoints: estimateRewardPointsFromSteps(steps),
        lastSyncedAt: record?.updatedAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error("GET /api/steps/today error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch today's step progress" },
      { status: 500 },
    );
  }
}
