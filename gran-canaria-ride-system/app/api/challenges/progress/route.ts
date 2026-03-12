import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateAuthCookie } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const authResult = await validateAuthCookie(request);
    if (!authResult.isValid || !authResult.userId) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { challengeId, progress } = body;

    if (!challengeId || typeof progress !== "number") {
      return NextResponse.json({ success: false, error: "Challenge ID and progress are required" }, { status: 400 });
    }

    // Find active user challenge
    const userChallenge = await prisma.userChallenge.findUnique({
      where: {
        userId_challengeId: {
          userId: authResult.userId,
          challengeId: challengeId,
        },
      },
      include: {
        challenge: true,
      },
    });

    if (!userChallenge || userChallenge.status !== "active") {
      return NextResponse.json({ success: false, error: "Active challenge not found" }, { status: 404 });
    }

    // Check if challenge has expired
    if (new Date() > userChallenge.expiresAt) {
      await prisma.userChallenge.update({
        where: { id: userChallenge.id },
        data: { status: "expired" },
      });

      return NextResponse.json({ success: false, error: "Challenge has expired" }, { status: 400 });
    }

    // Check if challenge is completed
    const isCompleted = progress >= userChallenge.challenge.goal;
    const now = new Date();

    const updatedUserChallenge = await prisma.userChallenge.update({
      where: { id: userChallenge.id },
      data: {
        progress: Math.min(progress, userChallenge.challenge.goal),
        status: isCompleted ? "completed" : "active",
        completedAt: isCompleted ? now : null,
      },
      include: {
        challenge: true,
      },
    });

    // If challenge is completed, award points and create reward
    if (isCompleted) {
      await prisma.$transaction(async (tx) => {
        // Add points to user
        await tx.user.update({
          where: { id: authResult.userId },
          data: {
            points: {
              increment: userChallenge.challenge.rewardPoints,
            },
          },
        });

        // Create a reward for completing the challenge
        await tx.reward.create({
          data: {
            title: `Challenge Completed: ${userChallenge.challenge.title}`,
            description: `You've successfully completed the ${userChallenge.challenge.title} challenge and earned ${userChallenge.challenge.rewardPoints} points!`,
            cost: 0, // Free reward for completing challenge
          },
        });
      });
    }

    return NextResponse.json({
      success: true,
      userChallenge: updatedUserChallenge,
      completed: isCompleted,
    });
  } catch (error) {
    console.error("Error updating challenge progress:", error);
    return NextResponse.json({ success: false, error: "Failed to update challenge progress" }, { status: 500 });
  }
}
