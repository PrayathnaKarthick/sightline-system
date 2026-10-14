import React from 'react';

interface HeaderProps {
  indexedFrames: number;
}

export const Header: React.FC<HeaderProps> = ({ indexedFrames }) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            SightLine <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">v1.0</span>
          </h1>
          <p className="text-xs text-zinc-400">Zero-shot multimodal semantic video retrieval</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          {indexedFrames > 0 ? `${indexedFrames} frames indexed` : 'System Ready'}
        </span>
      </div>
    </header>
  );
};