import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import {
  DAILY_STEP_GOAL,
  estimateRewardPointsFromSteps,
  getUtcDateFromInput,
  toStepProgress,
} from "@/lib/steps";

export async function POST(request: NextRequest) {
  const authResult = await authenticate(request);
  if (authResult.error || !authResult.user) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const steps = Number(body?.steps);
    const source =
      typeof body?.source === "string" ? body.source.trim() : "health-connect";
    const date = getUtcDateFromInput(body?.date);

    if (!date) {
      return NextResponse.json(
        { success: false, error: "Invalid date value" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(steps) || steps < 0) {
      return NextResponse.json(
        { success: false, error: "steps must be a non-negative integer" },
        { status: 400 },
      );
    }

    const record = await prisma.stepDaily.upsert({
      where: {
        userId_date: {
          userId: authResult.user.id,
          date,
        },
      },
      create: {
        userId: authResult.user.id,
        date,
        steps,
        source: source || "health-connect",
      },
      update: {
        steps,
        source: source || "health-connect",
      },
      select: {
        date: true,
        steps: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        date: record.date.toISOString(),
        steps: record.steps,
        goal: DAILY_STEP_GOAL,
        progressPercent: toStepProgress(record.steps),
        estimatedRewardPoints: estimateRewardPointsFromSteps(record.steps),
        lastSyncedAt: record.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("POST /api/steps/sync error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync step data" },
      { status: 500 },
    );
  }
}
