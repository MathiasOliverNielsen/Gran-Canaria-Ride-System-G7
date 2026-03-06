import { prisma } from "../../../../lib/prisma";
import { authenticate } from "../../../../lib/auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";

// Validation schema for updating user
const updateUserSchema = z
  .object({
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

// GET /api/users/[id] - Get user by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const { error, user: authUser } = await authenticate(request);
    if (error) return error;

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        { status: 400 },
      );
    }

    // Check if user is requesting their own profile or admin access
    if (authUser!.id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied",
        },
        { status: 403 },
      );
    }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        points: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get user",
      },
      { status: 500 },
    );
  }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const { error, user: authUser } = await authenticate(request);
    if (error) return error;

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        { status: 400 },
      );
    }

    // Check if user is updating their own profile
    if (authUser!.id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = updateUserSchema.parse(body);

    // Prepare update data
    const updateData: any = {};

    if (validatedData.email) {
      // Check if email is already taken by another user
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          {
            success: false,
            error: "Email already in use",
          },
          { status: 400 },
        );
      }

      updateData.email = validatedData.email;
    }

    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 12);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        points: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/users/[id] - Soft delete user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const { error, user: authUser } = await authenticate(request);
    if (error) return error;

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        { status: 400 },
      );
    }

    // Check if user is deleting their own profile
    if (authUser!.id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied",
        },
        { status: 403 },
      );
    }

    // Soft delete user
    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        deletedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User account deactivated successfully",
      user: deletedUser,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
      },
      { status: 500 },
    );
  }
}
