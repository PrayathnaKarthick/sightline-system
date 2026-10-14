export interface SearchResult {
  timestamp: number;
  frameIndex: number;
  thumbnailUrl?: string;
  similarity: number;
}

export interface VideoMetadata {
  videoId: string;
  filename: string;
  videoUrl: string;
  indexedFrames: number;
  duration: number;
}