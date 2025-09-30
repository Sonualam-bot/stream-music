"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Users, Music, Plus, Play, Pause } from "lucide-react";
import Image from "next/image";
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

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export function SpotifyLayout() {
  const { data: session } = useSession();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [showAddMusic, setShowAddMusic] = useState(false);

  const fetchStreams = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/streams?creatorId=${session?.user?.id}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("🎵 SpotifyLayout - Fetched streams:", data);
        setStreams(data);
        // Set the first active stream as current
        const activeStream = data.find((stream: Stream) => stream.active);
        if (activeStream) {
          console.log(
            "🎵 SpotifyLayout - Setting active stream:",
            activeStream
          );
          setCurrentStream(activeStream);
        } else {
          console.log(
            "🎵 SpotifyLayout - No active stream found, user needs to select one"
          );
        }
      }
    } catch (error) {
      console.error("Error fetching streams:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
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
        await fetchStreams();
        setShowAddMusic(false);
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
        await fetchStreams();
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  // Fetch data
  useEffect(() => {
    if (session?.user?.id) {
      fetchStreams();
      fetchUsers();
    } else {
      // If no session, stop loading immediately
      setIsLoading(false);
    }
  }, [session, fetchStreams, fetchUsers]);

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        {/* Simple Appbar */}
        <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
          <h1 className="text-xl font-bold">Stream Music</h1>
          <button
            onClick={() => signIn("google")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors"
            title="Let's Jam!"
          >
            Let&apos;s Jam!
          </button>
        </div>

        {/* Hero */}
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Share the Aux. Vote the Vibes.
            </h2>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Add YouTube links, build a live queue, and let everyone upvote the
              next track.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => signIn("google")}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium transition-colors"
              >
                Lets Jam!
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 text-white flex">
      {/* Left Sidebar - Users */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Listeners ({users.length})
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-3">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || user.email || "User"}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {(user.name || user.email || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">
                    {user.name || user.email || "Unknown"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {user.email || "No email"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
          <h1 className="text-xl font-bold">Stream Music</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddMusic(!showAddMusic)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Music</span>
            </button>
            {session?.user ? (
              <button
                onClick={() => signOut()}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-full transition-colors"
                title="Logout"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors"
                title="Lets Jam!"
              >
                Lets Jam!
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Now Playing Section */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-slate-600 rounded-lg flex items-center justify-center">
                  {currentStream?.thumbnail ? (
                    <Image
                      src={currentStream.thumbnail}
                      alt={currentStream.title}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <Music className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {currentStream?.title || "No music playing"}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {currentStream?.user?.name || "Select a track to start"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-400 font-medium">
                    ↑ {currentStream?.upvotes?.length || 0}
                  </span>
                </div>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg transition-all duration-200"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Center - Add Music Form */}
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="w-full max-w-2xl">
                <AddMusicForm onAddMusic={handleAddMusic} />
              </div>
            </div>

            {/* Right Sidebar - Music Queue */}
            <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
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
        </div>
      </div>
    </div>
  );
}
