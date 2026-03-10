import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, rewardId } = await req.json();

    if (!userId || !rewardId) {
      return NextResponse.json(
        { error: "userId and rewardId are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find reward
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
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

    // Transaction: deduct points + store redemption
    const result = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            decrement: reward.cost,
          },
        },
      }),

      prisma.redemption.create({
        data: {
          userId: userId,
          rewardId: rewardId,
        },
      }),
    ]);

    return NextResponse.json({
      message: "Reward redeemed successfully",
      result,
    });
  } catch (error) {
    console.error("Redeem reward error:", error);

    return NextResponse.json(
      { error: "Failed to redeem reward" },
      { status: 500 }
    );
  }
}