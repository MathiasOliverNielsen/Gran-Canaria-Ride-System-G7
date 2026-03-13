import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authResult = await authenticate(request);
  if (authResult.error || !authResult.user) {
    return authResult.error;
  }

  try {
    const rentalPoints = await prisma.rentalPoint.findMany();

    return NextResponse.json({
      success: true,
      data: rentalPoints
    })
  } catch (error) {
    console.error("GET /api/rental-point error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch rental points" },
      { status: 500 },
    );
  }
}