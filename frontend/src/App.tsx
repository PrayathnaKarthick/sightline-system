import React, { useState } from 'react';
import axios from 'axios';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { SearchBar } from './components/SearchBar';
import { ResultsSidebar } from './components/ResultsSidebar';
import { SearchResult, VideoMetadata } from './types';

const API_BASE = 'http://127.0.0.1:8000';

export const App: React.FC = () => {
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadStatus('Uploading video to SightLine backend...');
      setTimeout(() => setUploadStatus('Sampling frames with OpenCV...'), 1200);
      setTimeout(() => setUploadStatus('Computing ViT-B/32 multimodal embeddings...'), 2400);

      const res = await axios.post<VideoMetadata>(`${API_BASE}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setVideoData(res.data);
      setResults([]);
      setSeekTime(null);
      setUploadStatus(null);
    } catch (err) {
      console.error(err);
      setUploadStatus('Upload or vectorization failed. Verify backend logs.');
    }
  };

  const handleSearch = async (query: string) => {
    if (!videoData) return;
    setIsSearching(true);

    try {
      const formData = new FormData();
      formData.append('video_id', videoData.videoId);
      formData.append('query', query);
      formData.append('top_k', '6');

      const res = await axios.post<{ results: SearchResult[] }>(`${API_BASE}/api/search`, formData);
      setResults(res.data.results);

      // Auto-seek to the top match if found
      if (res.data.results.length > 0) {
        setSeekTime(res.data.results[0].timestamp);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Header indexedFrames={videoData ? videoData.indexedFrames : 0} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Player & Search */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Upload card */}
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white rounded-xl text-xs font-semibold border border-zinc-700 transition-all">
                Select MP4 Video
                <input
                  type="file"
                  accept="video/mp4,video/mkv,video/webm"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-zinc-400">
                {videoData ? videoData.filename : 'No video selected'}
              </span>
            </div>

            {uploadStatus && (
              <span className="text-xs text-cyan-400 font-mono animate-pulse">
                {uploadStatus}
              </span>
            )}
          </div>

          <VideoPlayer
            videoUrl={videoData?.videoUrl || null}
            seekTime={seekTime}
            duration={videoData?.duration || 0}
            results={results}
            onSeek={(t) => setSeekTime(t)}
          />

          <SearchBar
            onSearch={handleSearch}
            isLoading={isSearching}
            disabled={!videoData}
          />
        </div>

        {/* Right Column: Search Results */}
        <div className="lg:col-span-1">
          <ResultsSidebar
            results={results}
            onSelectTimestamp={(t) => setSeekTime(t)}
            activeTimestamp={seekTime}
          />
        </div>
      </main>
    </div>
  );
};

export default App;