import { GetListByKeyword } from "youtube-search-api";

export interface VideoDetails {
  title: string;
  thumbnail: string;
}

export async function getYouTubeVideoDetails(
  videoId: string
): Promise<VideoDetails | null> {
  try {
    // Search for the video using the video ID as a keyword
    const searchResults = await GetListByKeyword(videoId, false, 1);

    if (
      searchResults &&
      searchResults.items &&
      searchResults.items.length > 0
    ) {
      const video = searchResults.items[0];

      const title = video.title || "Unknown Title";
      // Use the first thumbnail URL from the thumbnails array
      const thumbnail = video.thumbnail?.thumbnails?.[0]?.url || "";

      return {
        title,
        thumbnail,
      };
    }

    return null;
  } catch (error) {
    console.error("❌ Error fetching YouTube video details:", error);
    return null;
  }
}

export async function getSpotifyTrackDetails(
  trackId: string
): Promise<VideoDetails | null> {
  try {
    // For Spotify, we'll use a placeholder approach since we need API credentials
    // In a real app, you'd use the Spotify Web API
    return {
      title: `Spotify Track ${trackId}`,
      thumbnail:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4NCX5hnpEICczZPGfD8WVwU5-0OEJShnD5A&s",
    };
  } catch (error) {
    console.error("Error fetching Spotify track details:", error);
    return null;
  }
}

export async function getVideoDetails(
  platform: string,
  extractedId: string
): Promise<VideoDetails | null> {
  if (platform === "YOUTUBE") {
    return await getYouTubeVideoDetails(extractedId);
  } else if (platform === "SPOTIFY") {
    return await getSpotifyTrackDetails(extractedId);
  }

  return null;
}
