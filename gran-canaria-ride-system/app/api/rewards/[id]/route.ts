import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rewardId = Number(id);

    if (!Number.isInteger(rewardId) || rewardId <= 0) {
      return NextResponse.json({ error: "Invalid reward id" }, { status: 400 });
    }

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
      select: {
        id: true,
        title: true,
        description: true,
        cost: true,
        createdAt: true,
      },
    });

    if (!reward) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    return NextResponse.json(reward);
  } catch (error) {
    console.error("GET /api/rewards/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to fetch reward details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rewardId = Number(id);

    if (!Number.isInteger(rewardId) || rewardId <= 0) {
      return NextResponse.json({ error: "Invalid reward id" }, { status: 400 });
    }

    const body = await request.json();
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

    const updatedReward = await prisma.reward.update({
      where: { id: rewardId },
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

    return NextResponse.json(updatedReward);
  } catch (error) {
    console.error("PUT /api/rewards/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to update reward" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rewardId = Number(id);

    if (!Number.isInteger(rewardId) || rewardId <= 0) {
      return NextResponse.json({ error: "Invalid reward id" }, { status: 400 });
    }

    await prisma.reward.delete({
      where: { id: rewardId },
    });

    return NextResponse.json({ message: "Reward deleted" });
  } catch (error) {
    console.error("DELETE /api/rewards/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to delete reward" },
      { status: 500 }
    );
  }
}
