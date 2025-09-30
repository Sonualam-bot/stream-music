"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SimpleAudioPlayer } from "./SimpleAudioPlayer";

interface Vote {
  id: string;
  userId: string;
  streamId: string;
}

interface Stream {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  type: string;
  active: boolean;
  upvotes: Vote[];
  user: {
    name: string;
    email: string;
  };
  extractedId?: string | null;
}

interface MusicPlayerProps {
  currentStream: Stream | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  setIsPlaying: (playing: boolean) => void;
}

export function MusicPlayer({
  currentStream,
  isPlaying,
  onPlayPause,
  setIsPlaying,
}: MusicPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Extract audio URL when currentStream changes
  useEffect(() => {
    const fetchAudioUrl = async () => {
      if (
        currentStream?.type === "Youtube" &&
        (currentStream.extractedId || currentStream.url)
      ) {
        setIsLoading(true);
        try {
          const endpoint = currentStream.extractedId
            ? `/api/youtube-audio?id=${encodeURIComponent(
                currentStream.extractedId
              )}`
            : `/api/youtube-audio?url=${encodeURIComponent(currentStream.url)}`;
          const response = await fetch(endpoint);
          if (response.ok) {
            // We are proxy streaming, so we can use the same endpoint as src
            setAudioUrl(endpoint);
          } else {
            // Fallback to direct YouTube URL
            setAudioUrl(currentStream.url);
          }
        } catch (error) {
          console.error("Error fetching audio URL:", error);
          setAudioUrl(currentStream.url);
        } finally {
          setIsLoading(false);
        }
      } else if (currentStream?.url) {
        setAudioUrl(currentStream.url);
      }
    };

    fetchAudioUrl();
  }, [currentStream]);

  // Debug current stream (commented out in production)
  if (!currentStream) {
    return (
      <div className="bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-700">
        <div className="text-center">
          <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No Music Playing
          </h3>
          <p className="text-slate-400 mb-4">
            Add music to your queue to get started
          </p>
          <div className="bg-slate-700 rounded-lg p-4 text-left">
            <h4 className="text-sm font-medium text-white mb-2">
              🎵 How to play music:
            </h4>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• Add a YouTube or Spotify link in the form below</li>
              <li>• Click on any track in the queue to play it</li>
              <li>• Use the play/pause button to control playback</li>
              <li>• Vote on tracks to help others discover great music</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
      {/* Album Art */}
      <div className="flex flex-col items-center space-y-6 mb-8">
        <div className="flex-shrink-0">
          <Image
            src={currentStream?.thumbnail}
            alt={currentStream?.title}
            width={150}
            height={150}
            className="w-36 h-36 rounded-2xl object-cover shadow-2xl"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4NCX5hnpEICczZPGfD8WVwU5-0OEJShnD5A&s";
            }}
          />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-2">
            {currentStream?.title}
          </h3>
          <p className="text-slate-400 mb-4">
            {currentStream?.type} • Added by {currentStream?.user?.name}
          </p>
          <div className="flex items-center justify-center space-x-6">
            <span className="text-sm text-green-400 font-medium">
              ↑ {currentStream?.upvotes?.length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Player: YouTube uses video iframe, others use HTML5 audio */}
      {currentStream?.type === "Youtube" ? (
        currentStream?.url ? (
          <div className="w-full max-w-2xl mx-auto">
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-center mb-4">
                <p className="text-sm text-slate-400 mb-2">
                  🎵 YouTube Video Player
                </p>
                <p className="text-xs text-slate-500">
                  Click play to start the video (audio will play)
                </p>
              </div>

              {/* YouTube Video iframe */}
              <div className="w-full bg-black rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="300"
                  src={`https://www.youtube.com/embed/${
                    (
                      currentStream.url.match(
                        /(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
                      ) || [""]
                    ).pop() || ""
                  }?autoplay=0&rel=0&modestbranding=1&controls=1&showinfo=0&start=0&loop=0&enablejsapi=1`}
                  title={currentStream?.title || "YouTube video"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                />
              </div>

              <div className="mt-3 text-center">
                <p className="text-xs text-slate-500 mb-2">
                  💡 Use the YouTube player controls above to play/pause
                </p>
                <a
                  href={currentStream.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  🎵 Open in YouTube (if player doesn&apos;t work)
                </a>
              </div>
            </div>
          </div>
        ) : null
      ) : (
        audioUrl && (
          <SimpleAudioPlayer
            audioUrl={audioUrl}
            isPlaying={isPlaying}
            onPlayPause={onPlayPause}
            title={currentStream?.title || "Unknown Track"}
            artist={currentStream?.user?.name || "Unknown Artist"}
          />
        )
      )}
    </div>
  );
}
