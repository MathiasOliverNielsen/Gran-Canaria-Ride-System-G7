import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const rewards = await prisma.reward.findMany();

  return NextResponse.json(rewards);
}