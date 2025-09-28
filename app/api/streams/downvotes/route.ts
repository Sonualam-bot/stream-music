import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getToken } from "next-auth/jwt";

const DownvoteSchema = z.object({
  userId: z.string(),
  streamId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    // Check if user is logged in - try both methods
    const session = await getServerSession(authOptions);
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Try to get user ID from either session or token
    let userId = null;
    if (session?.user?.id) {
      userId = session.user.id;
    } else if (token?.sub) {
      userId = token.sub;
    }

    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const data = DownvoteSchema.parse(await req.json());

    // Use the userId we found above

    // Check if user has already upvoted (remove upvote if exists)
    const existingUpvote = await prismaClient.upvote.findUnique({
      where: {
        userId_streamId: {
          userId: userId,
          streamId: data.streamId,
        },
      },
    });

    if (existingUpvote) {
      // Remove the upvote
      await prismaClient.upvote.delete({
        where: {
          userId_streamId: {
            userId: userId,
            streamId: data.streamId,
          },
        },
      });
    }

    return NextResponse.json(
      { message: "Stream downvoted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing downvote:", error);
    return NextResponse.json(
      { message: "Error while downvoting stream" },
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

    // Get total upvotes for the stream
    const upvoteCount = await prismaClient.upvote.count({
      where: {
        streamId: streamId,
      },
    });

    return NextResponse.json({ upvoteCount }, { status: 200 });
  } catch (error) {
    console.error("Error fetching downvote info:", error);
    return NextResponse.json(
      { message: "Error fetching downvote info" },
      { status: 500 }
    );
  }
}
