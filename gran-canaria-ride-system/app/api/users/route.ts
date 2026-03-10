import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// GET /api/users - List all active users (admin functionality)
export async function GET(request: NextRequest) {
  try {
    // Authenticate user (optional - you can add admin role check here)
    const { error, user: authUser } = await authenticate(request);
    if (error) return error;

    // Get all active users (excluding passwords)
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        points: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      users: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
      },
      { status: 500 },
    );
  }
}
