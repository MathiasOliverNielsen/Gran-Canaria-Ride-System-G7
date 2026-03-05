import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rewards = await prisma.reward.findMany({
      orderBy: { cost: "asc" },
    });

    return NextResponse.json(rewards);
  } catch (error) {
    console.error("GET /api/rewards error:", error);

    return NextResponse.json(
      { error: "Failed to fetch rewards" },
      { status: 500 }
    );
  }
}