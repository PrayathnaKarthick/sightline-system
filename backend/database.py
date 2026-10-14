import sqlite3
from typing import List, Dict, Any

DB_PATH = "sightline.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Video metadata table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS videos (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            fps REAL,
            duration REAL,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Frame embeddings table with thumbnail path
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS frame_embeddings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id TEXT NOT NULL,
            timestamp REAL NOT NULL,
            frame_index INTEGER NOT NULL,
            thumbnail_path TEXT,
            embedding BLOB NOT NULL,
            FOREIGN KEY (video_id) REFERENCES videos (id) ON DELETE CASCADE
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_video_id ON frame_embeddings(video_id)")
    conn.commit()
    conn.close()

def save_video_metadata(video_id: str, filename: str, filepath: str, fps: float, duration: float):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT OR REPLACE INTO videos (id, filename, filepath, fps, duration) VALUES (?, ?, ?, ?, ?)",
        (video_id, filename, filepath, fps, duration)
    )
    conn.commit()
    conn.close()

def save_frame_embeddings(records: List[tuple]):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.executemany(
        "INSERT INTO frame_embeddings (video_id, timestamp, frame_index, thumbnail_path, embedding) VALUES (?, ?, ?, ?, ?)",
        records
    )
    conn.commit()
    conn.close()

def get_frames_by_video(video_id: str) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, timestamp, frame_index, thumbnail_path, embedding FROM frame_embeddings WHERE video_id = ? ORDER BY timestamp ASC",
        (video_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": r[0],
            "timestamp": r[1],
            "frame_index": r[2],
            "thumbnail_path": r[3],
            "embedding": r[4]
        }
        for r in rows
    ]