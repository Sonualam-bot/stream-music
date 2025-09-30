import { NextRequest } from "next/server";
import ytdl from "ytdl-core";
import { Readable } from "stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");
    const id = req.nextUrl.searchParams.get("id");

    const videoUrl = id ? `https://www.youtube.com/watch?v=${id}` : url;
    if (!videoUrl) {
      return new Response("Missing url or id", { status: 400 });
    }

    // Validate URL/ID
    if (!(id ? ytdl.validateID(id) : ytdl.validateURL(videoUrl))) {
      return new Response("Invalid YouTube identifier", { status: 400 });
    }

    const info = await ytdl.getInfo(videoUrl);
    const audioFormat = ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
      filter: "audioonly",
    });

    if (!audioFormat || !audioFormat.url) {
      return new Response("No audio format found", { status: 500 });
    }

    // Proxy stream to avoid CORS and to support range requests in future
    const nodeReadable = ytdl(videoUrl, {
      quality: "highestaudio",
      filter: "audioonly",
      highWaterMark: 1 << 25,
    });

    const webReadable: ReadableStream<Uint8Array> = Readable.toWeb(
      nodeReadable
    ) as unknown as ReadableStream<Uint8Array>;

    return new Response(webReadable, {
      status: 200,
      headers: {
        "Content-Type": audioFormat.mimeType?.split(";")[0] || "audio/webm",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("/api/youtube-audio error", e);
    return new Response("Internal Server Error", { status: 500 });
  }
}
