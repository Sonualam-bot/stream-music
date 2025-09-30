import { NextResponse } from "next/server";
import { prismaClient } from "@/app/lib/db";

export async function GET() {
  try {
    const users = await prismaClient.user.findMany({
      select: { id: true, email: true, name: true, image: true },
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Error fetching users" },
      { status: 500 }
    );
  }
}
