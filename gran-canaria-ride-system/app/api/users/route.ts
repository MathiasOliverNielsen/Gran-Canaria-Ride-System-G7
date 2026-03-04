import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        fname: "John",
        lname: "Doe",
        email: "john.doe@example.com",
        password: "password123",
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Test user created successfully!",
      user: {
        id: user.id,
        name: `${user.fname} ${user.lname}`,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create user",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fname: true,
        lname: true,
        email: true,
        isActive: true,
        createdAt: true,
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
        error: error instanceof Error ? error.message : "Failed to fetch users",
      },
      { status: 500 },
    );
  }
}
