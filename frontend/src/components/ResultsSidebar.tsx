import React from 'react';
import { SearchResult } from '../types';

interface ResultsSidebarProps {
  results: SearchResult[];
  onSelectTimestamp: (secs: number) => void;
  activeTimestamp: number | null;
}

export const ResultsSidebar: React.FC<ResultsSidebarProps> = ({ results, onSelectTimestamp, activeTimestamp }) => {
  const getBadgeStyle = (score: number) => {
    if (score >= 0.28) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    } else if (score >= 0.22) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    } else {
      return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.28) return 'High Confidence';
    if (score >= 0.22) return 'Medium';
    return 'Low';
  };

  return (
    <div className="flex flex-col bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 h-full">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h2 className="font-semibold text-white text-sm">Indexed Moments</h2>
          <p className="text-xs text-zinc-500">Ranked by CLIP cosine similarity</p>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
          {results.length} found
        </span>
      </div>

      <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
        {results.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <svg className="w-10 h-10 mb-2 stroke-1 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-xs">No moments matched yet</p>
            <p className="text-[11px] text-zinc-600 mt-1">Enter a query to calculate multimodal distances</p>
          </div>
        ) : (
          results.map((res, index) => {
            const isSelected = activeTimestamp === res.timestamp;
            return (
              <div
                key={index}
                onClick={() => onSelectTimestamp(res.timestamp)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-center ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                    : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'
                }`}
              >
                {/* Visual Keyframe Thumbnail */}
                <div className="relative w-24 h-14 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-800">
                  {res.thumbnailUrl ? (
                    <img
                      src={res.thumbnailUrl}
                      alt={`Timestamp ${res.timestamp}s`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-600 font-mono">
                      No Frame
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[10px] font-mono text-zinc-300">
                    {res.timestamp}s
                  </span>
                </div>

                {/* Score & Timestamp Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${getBadgeStyle(res.similarity)}`}>
                      {getConfidenceLabel(res.similarity)}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      Score: {(res.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 truncate">
                    Moment at <strong className="text-cyan-400 font-mono">{res.timestamp}s</strong> (frame #{res.frameIndex})
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};