import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test if we can fetch challenges
    const challenges = await prisma.challenge.findMany({
      where: { isActive: true },
      orderBy: [{ type: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      message: "Challenge test successful",
      challengeCount: challenges.length,
      challenges: challenges,
    });
  } catch (error) {
    console.error("Challenge test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Challenge test failed",
      },
      { status: 500 },
    );
  }
}
