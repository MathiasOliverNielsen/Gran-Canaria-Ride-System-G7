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

    // Get all active challenges with user progress
    const challenges = await prisma.challenge.findMany({
      where: { isActive: true },
      include: {
        userChallenges: {
          where: {
            userId: authResult.userId,
            status: { in: ["active", "completed"] },
          },
        },
      },
      orderBy: [{ type: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(challenges);
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch challenges" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { title, description, type, goal, goalUnit, rewardPoints } = body;

    // Validate input
    if (!title || !description || !type || !goal || !goalUnit || !rewardPoints) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }

    if (!["daily", "weekly"].includes(type)) {
      return NextResponse.json({ success: false, error: "Type must be 'daily' or 'weekly'" }, { status: 400 });
    }

    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        type,
        goal,
        goalUnit,
        rewardPoints,
      },
    });

    return NextResponse.json({
      success: true,
      challenge,
    });
  } catch (error) {
    console.error("Error creating challenge:", error);
    return NextResponse.json({ success: false, error: "Failed to create challenge" }, { status: 500 });
  }
}
