import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateAuthCookie } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const challengeId = parseInt(params.id);

    if (isNaN(challengeId)) {
      return NextResponse.json({ success: false, error: "Invalid challenge ID" }, { status: 400 });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        userChallenges: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ success: false, error: "Challenge not found" }, { status: 404 });
    }

    return NextResponse.json(challenge);
  } catch (error) {
    console.error("Error fetching challenge:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch challenge" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await validateAuthCookie(request);
    if (!authResult.isValid || !authResult.userId) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    }

    const challengeId = parseInt(params.id);

    if (isNaN(challengeId)) {
      return NextResponse.json({ success: false, error: "Invalid challenge ID" }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, goal, goalUnit, rewardPoints, isActive } = body;

    const challenge = await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        title,
        description,
        goal,
        goalUnit,
        rewardPoints,
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      challenge,
    });
  } catch (error) {
    console.error("Error updating challenge:", error);
    return NextResponse.json({ success: false, error: "Failed to update challenge" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await validateAuthCookie(request);
    if (!authResult.isValid || !authResult.userId) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    }

    const challengeId = parseInt(params.id);

    if (isNaN(challengeId)) {
      return NextResponse.json({ success: false, error: "Invalid challenge ID" }, { status: 400 });
    }

    // Instead of hard delete, just set isActive to false
    const challenge = await prisma.challenge.update({
      where: { id: challengeId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Challenge deactivated successfully",
    });
  } catch (error) {
    console.error("Error deleting challenge:", error);
    return NextResponse.json({ success: false, error: "Failed to delete challenge" }, { status: 500 });
  }
}
