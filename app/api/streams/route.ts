import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  isValidMusicUrl,
  getPlatformFromUrl,
  extractIdFromUrl,
} from "@/lib/urlPatterns";
import { getVideoDetails } from "@/lib/videoDetails";

const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const data = CreateStreamSchema.parse(await req.json());

    // Validate URL using patterns
    if (!isValidMusicUrl(data.url)) {
      return NextResponse.json(
        {
          message:
            "Invalid URL. Please provide a valid YouTube or Spotify URL.",
        },
        { status: 400 }
      );
    }

    const platform = getPlatformFromUrl(data.url);
    const extractedId = extractIdFromUrl(data.url);

    if (!platform) {
      return NextResponse.json(
        { message: "Unable to determine platform from URL." },
        { status: 400 }
      );
    }

    // Fetch video details
    let title = "";
    let thumbnail = "";

    if (extractedId) {
      const videoDetails = await getVideoDetails(platform, extractedId);

      if (videoDetails) {
        title = videoDetails.title;
        thumbnail = videoDetails.thumbnail;
      } else {
        title = platform === "YOUTUBE" ? "YouTube Video" : "Spotify Track";
        thumbnail =
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4NCX5hnpEICczZPGfD8WVwU5-0OEJShnD5A&s";
      }
    }

    // Create stream
    await prismaClient.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId: extractedId,
        type: platform === "YOUTUBE" ? "Youtube" : "Spotify",
        active: true,
        title: title,
        thumbnail: thumbnail,
      },
    });

    return NextResponse.json(
      { message: "Stream added successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating stream:", error);
    return NextResponse.json(
      { message: "Error while adding a stream" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const creatorId = req.nextUrl.searchParams.get("creatorId");

    const where = creatorId ? { userId: creatorId } : undefined;

    const streams = await prismaClient.stream.findMany({
      where,
      include: {
        upvotes: true,
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(streams, { status: 200 });
  } catch (error) {
    console.error("Error fetching streams:", error);
    return NextResponse.json(
      { message: "Error fetching streams" },
      { status: 500 }
    );
  }
}
