"use client";

import {
  Pause as PauseIcon,
  Play as PlayIcon,
  Volume2 as VolumeIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  audioUrl: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  title: string;
  artist?: string;
}

export function SimpleAudioPlayer({
  audioUrl,
  isPlaying,
  onPlayPause,
  title,
  artist,
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying, audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTime = () => setCurrentTime(audio.currentTime);
    const handleLoaded = () => setDuration(audio.duration || 0);
    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("loadedmetadata", handleLoaded);
    return () => {
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("loadedmetadata", handleLoaded);
    };
  }, [audioUrl]);

  const format = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${`${s}`.padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-700 rounded-xl p-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-white font-medium truncate">{title}</div>
          {artist ? (
            <div className="text-slate-400 text-sm truncate">{artist}</div>
          ) : null}
        </div>
        <button
          onClick={onPlayPause}
          className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors"
        >
          {isPlaying ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={(e) => {
            const t = Number(e.target.value);
            setCurrentTime(t);
            if (audioRef.current) audioRef.current.currentTime = t;
          }}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>{format(currentTime)}</span>
          <span>{format(duration || 0)}</span>
        </div>
      </div>

      <div className="flex items-center space-x-3 mt-3">
        <VolumeIcon className="w-4 h-4 text-slate-400" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-xs text-slate-400">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
}
