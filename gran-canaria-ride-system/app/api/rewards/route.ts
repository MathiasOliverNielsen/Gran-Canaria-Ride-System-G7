import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rewards = await prisma.reward.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        cost: true,
        createdAt: true,
      },
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const cost = Number(body.cost);

    if (!title || !description || !Number.isInteger(cost) || cost <= 0) {
      return NextResponse.json(
        { error: "title, description and a positive integer cost are required" },
        { status: 400 }
      );
    }

    const reward = await prisma.reward.create({
      data: {
        title,
        description,
        cost,
      },
      select: {
        id: true,
        title: true,
        description: true,
        cost: true,
        createdAt: true,
      },
    });

    return NextResponse.json(reward, { status: 201 });
  } catch (error) {
    console.error("POST /api/rewards error:", error);

    return NextResponse.json(
      { error: "Failed to create reward" },
      { status: 500 }
    );
  }
}