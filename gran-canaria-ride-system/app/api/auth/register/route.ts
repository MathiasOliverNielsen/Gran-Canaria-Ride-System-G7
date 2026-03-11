import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { secureEmailSchema, securePasswordSchema, secureNameSchema, checkRateLimit, SECURITY_HEADERS } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimit = checkRateLimit(`register_${clientIP}`, 5);

    if (!rateLimit.allowed) {
      return NextResponse.json({ success: false, error: "Too many attempts. Try again later." }, { status: 429, headers: SECURITY_HEADERS });
    }

    const body = await request.json();

    // Secure validation
    const nameResult = secureNameSchema.safeParse(body.name);
    const emailResult = secureEmailSchema.safeParse(body.email);
    const passwordResult = securePasswordSchema.safeParse(body.password);

    if (!nameResult.success) {
      return NextResponse.json({ success: false, error: nameResult.error.issues[0].message }, { status: 400, headers: SECURITY_HEADERS });
    }

    if (!emailResult.success) {
      return NextResponse.json({ success: false, error: emailResult.error.issues[0].message }, { status: 400, headers: SECURITY_HEADERS });
    }

    if (!passwordResult.success) {
      return NextResponse.json({ success: false, error: passwordResult.error.issues[0].message }, { status: 400, headers: SECURITY_HEADERS });
    }

    const { name, email, password } = {
      name: nameResult.data,
      email: emailResult.data,
      password: passwordResult.data,
    };

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User already exists with this email",
        },
        { status: 400, headers: SECURITY_HEADERS },
      );
    }

    // Hash password with strong hashing
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        points: 0,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user,
      },
      { status: 201, headers: SECURITY_HEADERS },
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user",
      },
      { status: 500, headers: SECURITY_HEADERS },
    );
  }
}
