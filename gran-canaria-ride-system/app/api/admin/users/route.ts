import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Example admin-only endpoint to get all users
export async function GET(request: NextRequest) {
  // Require admin authentication
  const authResult = await requireAdmin(request);

  if (authResult.error) {
    return authResult.error;
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        points: true,
        isAdmin: true,
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
      users,
      total: users.length,
    });
  } catch (error) {
    console.error("Admin get users error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
      },
      { status: 500 },
    );
  }
}

// Example admin endpoint to update user admin status
export async function PATCH(request: NextRequest) {
  // Require admin authentication
  const authResult = await requireAdmin(request);

  if (authResult.error) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { userId, isAdmin } = body;

    if (!userId || typeof isAdmin !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "userId and isAdmin (boolean) are required",
        },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { isAdmin },
      select: {
        id: true,
        email: true,
        isAdmin: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.email} admin status updated to ${isAdmin}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
      },
      { status: 500 },
    );
  }
}
