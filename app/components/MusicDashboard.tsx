"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Users } from "lucide-react";
import { MusicPlayer } from "./MusicPlayer";
import { MusicQueue } from "./MusicQueue";
import { AddMusicForm } from "./AddMusicForm";

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
}

export function MusicDashboard() {
  const { data: session } = useSession();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStreams = useCallback(async () => {
    try {
      const response = await fetch(`/api/streams`);
      if (response.ok) {
        const data = await response.json();
        setStreams(data);
        // Set the first active stream as current
        const activeStream = data.find((stream: Stream) => stream.active);
        if (activeStream) {
          setCurrentStream(activeStream);
        }
      }
    } catch (error) {
      console.error("Error fetching streams:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddMusic = async (url: string) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/streams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creatorId: session.user.id,
          url: url,
        }),
      });

      if (response.ok) {
        await fetchStreams(); // Refresh the list
      }
    } catch (error) {
      console.error("Error adding music:", error);
    }
  };

  const handleVote = async (
    streamId: string,
    voteType: "upvote" | "downvote"
  ) => {
    try {
      const response = await fetch(`/api/streams/${voteType}s`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          streamId: streamId,
        }),
      });

      if (response.ok) {
        await fetchStreams(); // Refresh to get updated vote counts
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  // Fetch all streams for everyone
  useEffect(() => {
    fetchStreams();
    const id = setInterval(fetchStreams, 15000);
    return () => clearInterval(id);
  }, [fetchStreams]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Welcome to Stream Music
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Sign in to start creating your music stream
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Your Music Stream
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Let your audience choose the music through voting
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Music Player - Takes up 2 columns on large screens */}
        <div className="lg:col-span-2">
          <MusicPlayer
            currentStream={currentStream}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            setIsPlaying={setIsPlaying}
          />
        </div>

        {/* Add Music Form */}
        <div className="lg:col-span-1">
          <AddMusicForm onAddMusic={handleAddMusic} />
        </div>
      </div>

      {/* Music Queue */}
      <div className="mt-8">
        <MusicQueue
          streams={streams}
          currentStream={currentStream}
          onVote={handleVote}
          onSetCurrent={(stream) => setCurrentStream(stream)}
          currentUserName={
            session?.user?.name || session?.user?.email || "Someone"
          }
        />
      </div>
    </div>
  );
}
