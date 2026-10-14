import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, disabled }) => {
  const [query, setQuery] = useState('');

  const suggestions = [
    'a red car',
    'person walking',
    'night city lights',
    'close up face',
    'outdoor landscape'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  const handleChipClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
  };

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          disabled={disabled || isLoading}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={disabled ? 'Upload a video to activate search...' : 'Describe any scene, action, or object (e.g. "a person turning left")...'}
          className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 pl-11 text-sm text-zinc-100 placeholder-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed outline-none transition-all shadow-inner"
        />
        <svg
          className="w-5 h-5 text-zinc-500 absolute left-3.5 top-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <button
          type="submit"
          disabled={disabled || isLoading || !query.trim()}
          className="absolute right-2 top-2 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-zinc-950 font-semibold text-xs rounded-lg disabled:opacity-40 disabled:hover:bg-cyan-500 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
              Scanning...
            </span>
          ) : (
            'Retrieve'
          )}
        </button>
      </form>

      {/* Suggestion Chips */}
      {!disabled && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium text-zinc-500">Quick Prompts:</span>
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(s)}
              className="text-xs px-2.5 py-1 rounded-md bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-cyan-300 border border-zinc-800/80 hover:border-cyan-500/40 transition-all font-mono"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};