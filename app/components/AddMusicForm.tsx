"use client";

import { useState, useEffect } from "react";
import { Plus, Music, Link, Loader } from "lucide-react";
import Image from "next/image";

interface AddMusicFormProps {
  onAddMusic: (url: string) => void;
}

interface PreviewData {
  title: string;
  thumbnail: string;
  platform: string;
}

export function AddMusicForm({ onAddMusic }: AddMusicFormProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      await onAddMusic(url.trim());
      setUrl(""); // Clear form on success
      setPreview(null); // Clear preview on success
    } catch (error) {
      setError("Failed to add music. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    const spotifyRegex = /^(https?:\/\/)?(www\.)?(open\.)?spotify\.com\/.+/;
    return youtubeRegex.test(url) || spotifyRegex.test(url);
  };

  // Fetch preview when URL changes
  useEffect(() => {
    const fetchPreview = async () => {
      if (!url.trim() || !isValidUrl(url)) {
        setPreview(null);
        return;
      }

      setIsPreviewLoading(true);
      try {
        // Extract platform and ID from URL
        const platform = url.includes("youtube") ? "YOUTUBE" : "SPOTIFY";
        const extractedId =
          url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] ||
          url.match(/\/track\/([a-zA-Z0-9]+)/)?.[1];

        if (extractedId) {
          const response = await fetch(
            `/api/streams/preview?url=${encodeURIComponent(
              url
            )}&platform=${platform}&id=${extractedId}`
          );
          if (response.ok) {
            const data = await response.json();
            setPreview({
              title: data.title,
              thumbnail: data.thumbnail,
              platform: data.platform,
            });
          }
        }
      } catch (error) {
        console.error("Preview error:", error);
        // Fallback preview
        setPreview({
          title: "Preview Track",
          thumbnail:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4NCX5hnpEICczZPGfD8WVwU5-0OEJShnD5A&s",
          platform: url.includes("youtube") ? "YouTube" : "Spotify",
        });
      } finally {
        setIsPreviewLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchPreview, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [url]);

  return (
    <div className="bg-slate-700 rounded-xl p-4 shadow-lg">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
          <Plus className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Add Music</h3>
          <p className="text-xs text-slate-400">
            Share YouTube or Spotify links
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube or Spotify link..."
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                error
                  ? "border-red-500 bg-red-900/20"
                  : "border-slate-600 bg-slate-800"
              } text-white placeholder-slate-400 text-sm`}
              disabled={isLoading}
            />
          </div>
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={!url.trim() || isLoading || !isValidUrl(url)}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <Music className="w-4 h-4" />
              <span>Add to Queue</span>
            </>
          )}
        </button>
      </form>

      {/* Preview Section */}
      {(preview || isPreviewLoading) && (
        <div className="mt-6 pt-6 border-t border-slate-600">
          <h4 className="text-lg font-semibold text-white mb-4">Preview</h4>
          {isPreviewLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-green-400" />
              <span className="ml-3 text-base text-slate-400">
                Loading preview...
              </span>
            </div>
          ) : preview ? (
            <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Image
                    src={preview.thumbnail}
                    alt={preview.title}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-lg font-semibold text-white mb-2 truncate">
                    {preview.title}
                  </h5>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        preview.platform === "YouTube"
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                    ></div>
                    <p className="text-sm text-slate-400">{preview.platform}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Supported Platforms */}
      <div className="mt-4 pt-3 border-t border-slate-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs text-slate-400">YouTube</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-slate-400">Spotify</span>
          </div>
        </div>
      </div>
    </div>
  );
}
