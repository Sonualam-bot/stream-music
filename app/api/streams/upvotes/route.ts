import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getToken } from "next-auth/jwt";

const UpvoteSchema = z.object({
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

    // Allow creators to upvote their own streams
    // No need to check if it's their own stream

    // Use transaction to prevent race conditions
    await prismaClient.$transaction(async (tx) => {
      // Check if user has already voted (upvote or downvote)
      const existingUpvote = await tx.upvote.findUnique({
        where: {
          userId_streamId: {
            userId: userId,
            streamId: data.streamId,
          },
        },
      });

      if (existingUpvote) {
        // User already upvoted, remove the upvote (toggle off)
        await tx.upvote.delete({
          where: {
            userId_streamId: {
              userId: userId,
              streamId: data.streamId,
            },
          },
        });
      } else {
        // Create new upvote
        await tx.upvote.create({
          data: {
            userId: userId,
            streamId: data.streamId,
          },
        });
      }
    });

    return NextResponse.json(
      { message: "Stream upvoted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating upvote:", error);
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
