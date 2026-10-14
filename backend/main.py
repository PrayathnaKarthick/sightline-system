import os
import uuid
import traceback
import cv2
from PIL import Image
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import init_db, save_video_metadata, save_frame_embeddings, get_frames_by_video
from embeddings import encode_image, encode_text, compute_cosine_similarity

# Initialize database tables on startup
init_db()

UPLOAD_DIR = "uploads"
THUMBNAIL_DIR = os.path.join(UPLOAD_DIR, "thumbnails")
os.makedirs(THUMBNAIL_DIR, exist_ok=True)

app = FastAPI(title="SightLine API")

# Allow requests from the React/Vite development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve video files and generated thumbnails directly to the frontend
app.mount("/media", StaticFiles(directory=UPLOAD_DIR), name="media")


@app.get("/health")
def health():
    return {"status": "online", "system": "SightLine - Video Retrieval System"}


@app.post("/api/upload")
async def upload_video(file: UploadFile = File(...)):
    try:
        video_id = str(uuid.uuid4())[:8]
        original_name = file.filename or "video.mp4"
        ext = os.path.splitext(original_name)[1] or ".mp4"
        saved_filename = f"{video_id}{ext}"
        filepath = os.path.join(UPLOAD_DIR, saved_filename)

        # Write uploaded file to disk
        contents = await file.read()
        with open(filepath, "wb") as f:
            f.write(contents)

        # Inspect video properties via OpenCV
        cap = cv2.VideoCapture(filepath)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="OpenCV failed to open the uploaded video file.")

        fps = cap.get(cv2.CAP_PROP_FPS) or 24.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps

        save_video_metadata(video_id, original_name, filepath, fps, duration)

        # Sample 1 frame every 2 seconds for faster CPU/GPU processing
        sample_interval = int(round(fps * 2)) if int(round(fps * 2)) > 0 else 1
        current_frame = 0
        records_to_insert = []

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if current_frame % sample_interval == 0:
                timestamp = round(current_frame / fps, 2)

                # 1. Generate and save low-res thumbnail
                thumb_filename = f"{video_id}_{int(timestamp)}.jpg"
                thumb_path = os.path.join(THUMBNAIL_DIR, thumb_filename)
                small_frame = cv2.resize(frame, (320, 180), interpolation=cv2.INTER_AREA)
                cv2.imwrite(thumb_path, small_frame, [cv2.IMWRITE_JPEG_QUALITY, 75])

                # 2. Convert frame from BGR to RGB PIL image for CLIP
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pil_img = Image.fromarray(rgb_frame)

                # 3. Encode into vector bytes
                emb_blob = encode_image(pil_img)

                records_to_insert.append((
                    video_id,
                    timestamp,
                    current_frame,
                    f"thumbnails/{thumb_filename}",
                    emb_blob
                ))

            current_frame += 1

        cap.release()

        # Persist vectors and metadata in SQLite
        save_frame_embeddings(records_to_insert)

        return {
            "videoId": video_id,
            "filename": original_name,
            "videoUrl": f"http://127.0.0.1:8000/media/{saved_filename}",
            "indexedFrames": len(records_to_insert),
            "duration": round(duration, 2)
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/search")
def search_moments(video_id: str = Form(...), query: str = Form(...), top_k: int = Form(5)):
    try:
        frames = get_frames_by_video(video_id)
        if not frames:
            raise HTTPException(status_code=404, detail="No indexed data found for this video.")

        # Compute query vector
        query_vector = encode_text(query)

        scored_results = []
        for f in frames:
            sim = compute_cosine_similarity(query_vector, f["embedding"])
            scored_results.append({
                "timestamp": f["timestamp"],
                "frameIndex": f["frame_index"],
                "thumbnailUrl": f"http://127.0.0.1:8000/media/{f['thumbnail_path']}" if f.get("thumbnail_path") else None,
                "similarity": round(float(sim), 4)
            })

        # Sort descending by similarity
        scored_results.sort(key=lambda x: x["similarity"], reverse=True)
        return {"results": scored_results[:top_k]}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))