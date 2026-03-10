import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

interface AuthUser {
  id: number;
  email: string;
  isAdmin?: boolean;
}

interface AuthResult {
  error?: NextResponse;
  user?: AuthUser;
}

export async function authenticate(request: NextRequest): Promise<AuthResult> {
  try {
    // Try cookie first, fallback to Authorization header for API compatibility
    const cookieToken = request.cookies.get("auth-token")?.value;
    const authHeader = request.headers.get("authorization");
    const token = cookieToken || (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null);

    if (!token) {
      return {
        error: NextResponse.json({ success: false, error: "No token provided" }, { status: 401 }),
      };
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        isAdmin: true,
      },
    });

    if (!user) {
      return {
        error: NextResponse.json({ success: false, error: "User not found or inactive" }, { status: 401 }),
      };
    }

    return { user };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      error: NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 }),
    };
  }
}
