import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const rideCount = await prisma.ride.count();

    return NextResponse.json({
      success: true,
      message: "Database connected successfully!",
      data: { users: userCount, rides: rideCount },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Database connection failed",
      },
      { status: 500 },
    );
  }
}
