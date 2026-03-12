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
    const { challengeId } = body;

    if (!challengeId) {
      return NextResponse.json({ success: false, error: "Challenge ID is required" }, { status: 400 });
    }

    // Check if challenge exists and is active
    const challenge = await prisma.challenge.findFirst({
      where: {
        id: challengeId,
        isActive: true,
      },
    });

    if (!challenge) {
      return NextResponse.json({ success: false, error: "Challenge not found or inactive" }, { status: 404 });
    }

    // Check if user already has this challenge active or completed recently
    const existingUserChallenge = await prisma.userChallenge.findUnique({
      where: {
        userId_challengeId: {
          userId: authResult.userId,
          challengeId: challengeId,
        },
      },
    });

    if (existingUserChallenge && existingUserChallenge.status === "active") {
      return NextResponse.json({ success: false, error: "Challenge already active" }, { status: 400 });
    }

    // Calculate expiry date based on challenge type
    const now = new Date();
    let expiresAt: Date;

    if (challenge.type === "daily") {
      expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + 1);
      expiresAt.setHours(23, 59, 59, 999);
    } else {
      // weekly
      expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + 7);
      expiresAt.setHours(23, 59, 59, 999);
    }

    // Create or update user challenge
    const userChallenge = await prisma.userChallenge.upsert({
      where: {
        userId_challengeId: {
          userId: authResult.userId,
          challengeId: challengeId,
        },
      },
      update: {
        status: "active",
        progress: 0,
        startedAt: now,
        completedAt: null,
        expiresAt: expiresAt,
      },
      create: {
        userId: authResult.userId,
        challengeId: challengeId,
        status: "active",
        progress: 0,
        expiresAt: expiresAt,
      },
      include: {
        challenge: true,
      },
    });

    return NextResponse.json({
      success: true,
      userChallenge,
    });
  } catch (error) {
    console.error("Error accepting challenge:", error);
    return NextResponse.json({ success: false, error: "Failed to accept challenge" }, { status: 500 });
  }
}
