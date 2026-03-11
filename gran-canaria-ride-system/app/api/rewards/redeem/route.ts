import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

interface JWTPayload {
  userId: number;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, rewardId } = await req.json();
    const parsedRewardId = Number(rewardId);
    const parsedUserId = Number(userId);
    let effectiveUserId: number | null = Number.isInteger(parsedUserId)
      ? parsedUserId
      : null;

    if (!effectiveUserId) {
      const cookieToken = req.cookies.get("auth-token")?.value;
      const authHeader = req.headers.get("authorization");
      const token =
        cookieToken ||
        (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null);

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
          effectiveUserId = decoded.userId;
        } catch {
          return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
        }
      }
    }

    if (!effectiveUserId || !Number.isInteger(parsedRewardId)) {
      return NextResponse.json(
        { error: "Valid rewardId and authenticated user are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: effectiveUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find reward
    const reward = await prisma.reward.findUnique({
      where: { id: parsedRewardId },
    });

    if (!reward) {
      return NextResponse.json(
        { error: "Reward not found" },
        { status: 404 }
      );
    }

    // Check points balance
    if (user.points < reward.cost) {
      return NextResponse.json(
        { error: "Not enough points" },
        { status: 400 }
      );
    }

    // Deduct points and remove reward so it cannot be redeemed again.
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: effectiveUserId },
        data: {
          points: {
            decrement: reward.cost,
          },
        },
        select: {
          id: true,
          points: true,
        },
      }),
      prisma.reward.delete({
        where: { id: parsedRewardId },
      }),
    ]);

    return NextResponse.json({
      message: "Reward redeemed successfully",
      user: updatedUser,
      redeemedRewardId: parsedRewardId,
    });
  } catch (error) {
    console.error("Redeem reward error:", error);

    return NextResponse.json(
      { error: "Failed to redeem reward" },
      { status: 500 }
    );
  }
}