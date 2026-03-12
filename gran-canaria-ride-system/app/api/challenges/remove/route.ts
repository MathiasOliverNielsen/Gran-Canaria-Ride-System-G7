import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateAuthCookie } from "@/lib/auth";

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest) {
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

    // Find the user's active challenge
    const userChallenge = await prisma.userChallenge.findFirst({
      where: {
        userId: authResult.userId,
        challengeId: challengeId,
        status: "active",
      },
    });

    if (!userChallenge) {
      return NextResponse.json({ success: false, error: "Active challenge not found" }, { status: 404 });
    }

    // Remove the user challenge (quit/abandon)
    await prisma.userChallenge.delete({
      where: {
        id: userChallenge.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Challenge removed successfully",
    });
  } catch (error) {
    console.error("Error removing challenge:", error);
    return NextResponse.json({ success: false, error: "Failed to remove challenge" }, { status: 500 });
  }
}
