import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getToken } from "next-auth/jwt";

const UpvoteSchema = z.object({
  userId: z.string(),
  streamId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    // Check if user is logged in - try both methods
    const session = await getServerSession(authOptions);
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    console.log("🔍 Session debug:", {
      session: session,
      hasSession: !!session,
      hasUser: !!session?.user,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id,
    });

    console.log("🔍 Token debug:", {
      token: token,
      hasToken: !!token,
      tokenSub: token?.sub,
    });

    // Try to get user ID from either session or token
    let userId = null;
    if (session?.user?.id) {
      userId = session.user.id;
      console.log("✅ Using session user ID:", userId);
    } else if (token?.sub) {
      userId = token.sub;
      console.log("✅ Using token sub as user ID:", userId);
    }

    if (!userId) {
      console.log("❌ No user ID found, returning 401");
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const data = UpvoteSchema.parse(await req.json());

    // Use the userId we found above

    // Check if user is trying to upvote their own stream
    const stream = await prismaClient.stream.findUnique({
      where: { id: data.streamId },
      select: { userId: true },
    });

    if (stream && stream.userId === userId) {
      return NextResponse.json(
        { message: "You cannot upvote your own stream" },
        { status: 400 }
      );
    }

    // Use transaction to prevent race conditions
    await prismaClient.$transaction(async (tx) => {
      // Check if upvote already exists
      const existingUpvote = await tx.upvote.findUnique({
        where: {
          userId_streamId: {
            userId: userId,
            streamId: data.streamId,
          },
        },
      });

      if (existingUpvote) {
        throw new Error("User has already upvoted this stream");
      }

      // Create upvote
      return await tx.upvote.create({
        data: {
          userId: userId,
          streamId: data.streamId,
        },
      });
    });

    return NextResponse.json(
      { message: "Stream upvoted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating upvote:", error);

    // Handle specific error cases
    if (
      error instanceof Error &&
      error.message === "User has already upvoted this stream"
    ) {
      return NextResponse.json(
        { message: "User has already upvoted this stream" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Error while upvoting stream" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const streamId = req.nextUrl.searchParams.get("streamId");

    if (!streamId) {
      return NextResponse.json(
        { message: "Stream ID is required" },
        { status: 400 }
      );
    }

    const upvotes = await prismaClient.upvote.findMany({
      where: {
        streamId: streamId,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(upvotes, { status: 200 });
  } catch (error) {
    console.error("Error fetching upvotes:", error);
    return NextResponse.json(
      { message: "Error fetching upvotes" },
      { status: 500 }
    );
  }
}
