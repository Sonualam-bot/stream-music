"use client";

import {
  ChevronUp,
  ChevronDown,
  Play,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

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

interface MusicQueueProps {
  streams: Stream[];
  currentStream: Stream | null;
  onVote: (streamId: string, voteType: "upvote" | "downvote") => void;
  onSetCurrent: (stream: Stream) => void;
  currentUserName?: string;
}

export function MusicQueue({
  streams,
  currentStream,
  onVote,
  onSetCurrent,
  currentUserName = "Someone",
}: MusicQueueProps) {
  const [notifications, setNotifications] = useState<
    {
      id: string;
      message: string;
      type: "upvote" | "downvote";
      userName: string;
    }[]
  >([]);

  // Creative notification messages
  const upvoteMessages = [
    "🎵 Vibes approved!",
    "🔥 This slaps!",
    "✨ Added to the vibe check!",
    "🎶 Pure fire!",
    "🚀 This track is ascending!",
    "💫 Musical magic!",
    "🎤 Chef's kiss!",
    "🌟 Absolute banger!",
  ];

  const downvoteMessages = [
    "😔 Vibe check failed",
    "🎭 Not feeling this one",
    "🤷‍♂️ Skip to the next",
    "😅 Maybe next time",
    "🎪 Not my tempo",
    "🔄 Let's try another",
    "🤔 Pass on this one",
    "😴 Time for a different track",
  ];

  const showNotification = (type: "upvote" | "downvote") => {
    const messages = type === "upvote" ? upvoteMessages : downvoteMessages;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const id = Date.now().toString();

    setNotifications((prev) => [
      ...prev,
      { id, message: randomMessage, type, userName: currentUserName },
    ]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  const handleVote = async (
    streamId: string,
    voteType: "upvote" | "downvote"
  ) => {
    // Show notification immediately for better UX
    showNotification(voteType);

    // Then make the API call
    await onVote(streamId, voteType);
  };
  // Sort streams by upvote count descending
  const sortedStreams = [...streams].sort((a, b) => {
    const upvotesA = a?.upvotes?.length || 0;
    const upvotesB = b?.upvotes?.length || 0;
    return upvotesB - upvotesA;
  });

  if (streams?.length === 0) {
    return (
      <div className="h-full flex flex-col bg-slate-800">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">
            Queue ({streams?.length})
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Music in Queue
            </h3>
            <p className="text-slate-400 mb-4">Add some music to get started</p>
            <div className="bg-slate-700 rounded-lg p-4 text-left">
              <h4 className="text-sm font-medium text-white mb-2">
                🎵 How to add music:
              </h4>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>• Paste a YouTube or Spotify link in the form</li>
                <li>• Click &quot;Add to Queue&quot; to add it</li>
                <li>• Click the ▶️ button next to any track to play it</li>
                <li>• Vote on tracks to help others discover great music</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-800">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">
          Queue ({streams?.length})
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {sortedStreams?.map((stream, index) => {
            const upvoteCount = stream?.upvotes?.length || 0;
            const isCurrent = currentStream?.id === stream?.id;

            return (
              <div
                key={stream?.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  isCurrent
                    ? "bg-green-500/20 border border-green-500/30"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  <Image
                    src={
                      stream?.thumbnail ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4NCX5hnpEICczZPGfD8WVwU5-0OEJShnD5A&s"
                    }
                    alt={stream.title || "Music track"}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4NCX5hnpEICczZPGfD8WVwU5-0OEJShnD5A&s";
                    }}
                  />
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">
                    {stream?.title}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    {stream?.user?.name}
                  </p>
                </div>

                {/* Voting Buttons with Count in Middle */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleVote(stream?.id, "upvote")}
                    className="p-1 rounded text-green-400 hover:bg-green-400/20 transition-colors cursor-pointer"
                    title="Upvote"
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </button>

                  {/* Vote Count in Middle */}
                  <span className="text-xs font-medium text-slate-300 min-w-[20px] text-center">
                    {upvoteCount}
                  </span>

                  <button
                    onClick={() => handleVote(stream?.id, "downvote")}
                    className="p-1 rounded text-red-400 hover:bg-red-400/20 transition-colors cursor-pointer"
                    title="Downvote"
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Play Button */}
                {!isCurrent && (
                  <button
                    onClick={() => onSetCurrent(stream)}
                    className="p-1 rounded text-white hover:bg-white/20 transition-colors"
                    title="Play this track"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                )}

                {/* Current Playing Indicator */}
                {isCurrent && (
                  <div className="flex items-center space-x-1 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">Now</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-6 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in slide-in-from-top-5 duration-300 backdrop-blur-sm ${
                notification.type === "upvote"
                  ? "bg-green-500/95 text-white border border-green-400/30"
                  : "bg-red-500/95 text-white border border-red-400/30"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white/90">
                  {notification.userName}
                </span>
                <span className="text-white/80">•</span>
                <span>{notification.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
