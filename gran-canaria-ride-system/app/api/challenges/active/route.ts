import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateAuthCookie } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAuthCookie(request);
    if (!authResult.isValid || !authResult.userId) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    // Get user's active challenges with challenge details
    const userChallenges = await prisma.userChallenge.findMany({
      where: {
        userId: authResult.userId,
        status: "active",
        expiresAt: {
          gt: new Date(), // Only non-expired challenges
        },
      },
      include: {
        challenge: true,
      },
      orderBy: [{ challenge: { type: "asc" } }, { startedAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      challenges: userChallenges,
    });
  } catch (error) {
    console.error("Error fetching active challenges:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch active challenges" }, { status: 500 });
  }
}
