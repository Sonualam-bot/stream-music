import { NextRequest, NextResponse } from "next/server";
import { getVideoDetails } from "@/lib/videoDetails";
import { getPlatformFromUrl, extractIdFromUrl } from "@/lib/urlPatterns";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");
    const platform = req.nextUrl.searchParams.get("platform");
    const id = req.nextUrl.searchParams.get("id");

    if (!url || !platform || !id) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Fetch video details
    const videoDetails = await getVideoDetails(
      platform as "YOUTUBE" | "SPOTIFY",
      id
    );

    if (videoDetails) {
      return NextResponse.json({
        title: videoDetails.title,
        thumbnail: videoDetails.thumbnail,
        platform: platform === "YOUTUBE" ? "YouTube" : "Spotify",
      });
    } else {
      // Fallback
      return NextResponse.json({
        title: "Unknown Track",
        thumbnail:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4NCX5hnpEICczZPGfD8WVwU5-0OEJShnD5A&s",
        platform: platform === "YOUTUBE" ? "YouTube" : "Spotify",
      });
    }
  } catch (error) {
    console.error("Error fetching preview:", error);
    return NextResponse.json(
      { message: "Error fetching preview" },
      { status: 500 }
    );
  }
}
