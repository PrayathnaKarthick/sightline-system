import React, { useRef, useEffect, useState } from 'react';
import { SearchResult } from '../types';

interface VideoPlayerProps {
  videoUrl: string | null;
  seekTime: number | null;
  duration: number;
  results: SearchResult[];
  onSeek: (time: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, seekTime, duration, results, onSeek }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    if (seekTime !== null && videoRef.current) {
      videoRef.current.currentTime = seekTime;
      videoRef.current.play().catch(() => {});
    }
  }, [seekTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="relative aspect-video bg-black flex items-center justify-center">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-zinc-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <p className="text-zinc-300 font-medium">No video loaded</p>
            <p className="text-xs text-zinc-500 mt-1">Upload an MP4 clip to begin temporal vector search</p>
          </div>
        )}
      </div>

      {/* Interactive Match Timeline Scrubber */}
      {videoUrl && duration > 0 && (
        <div className="p-4 bg-zinc-950 border-t border-zinc-800/80">
          <div className="flex justify-between text-xs text-zinc-400 font-mono mb-2">
            <span>{formatTime(currentTime)}</span>
            <span className="text-zinc-500">Matched Moments Timeline</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="relative w-full h-3 bg-zinc-800 rounded-full cursor-pointer overflow-visible">
            {/* Playhead progress */}
            <div
              className="absolute top-0 left-0 h-full bg-zinc-600 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />

            {/* Match Markers */}
            {results.map((res, idx) => {
              const posPercent = Math.min(100, Math.max(0, (res.timestamp / duration) * 100));
              return (
                <button
                  key={idx}
                  title={`Match at ${res.timestamp}s (${Math.round(res.similarity * 100)}%)`}
                  onClick={() => onSeek(res.timestamp)}
                  style={{ left: `${posPercent}%` }}
                  className="group absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-cyan-400 hover:scale-150 transition-all z-20 flex items-center justify-center border-2 border-zinc-950 shadow-md shadow-cyan-400/50"
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-8 px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-cyan-300 font-mono border border-zinc-700 whitespace-nowrap transition-opacity pointer-events-none">
                    {res.timestamp}s
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};