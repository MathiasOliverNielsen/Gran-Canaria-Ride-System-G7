import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedRequest {
  user: {
    id: number;
    email: string;
  };
}

export async function authenticate(request: NextRequest): Promise<{ error?: NextResponse; user?: AuthenticatedRequest["user"] }> {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (!token) {
      return {
        error: NextResponse.json(
          {
            success: false,
            error: "No token provided",
          },
          { status: 401 },
        ),
      };
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (jwtError) {
      return {
        error: NextResponse.json(
          {
            success: false,
            error: "Invalid or expired token",
          },
          { status: 401 },
        ),
      };
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return {
        error: NextResponse.json(
          {
            success: false,
            error: "User not found or inactive",
          },
          { status: 404 },
        ),
      };
    }

    return { user };
  } catch (error) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: "Authentication failed",
        },
        { status: 500 },
      ),
    };
  }
}
