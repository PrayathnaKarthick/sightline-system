import torch
import clip
from PIL import Image
import numpy as np

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"[SightLine] Initializing ViT-B/32 on {device}...")
model, preprocess = clip.load("ViT-B/32", device=device)

def encode_image(pil_img: Image.Image) -> bytes:
    image_input = preprocess(pil_img).unsqueeze(0).to(device)
    with torch.no_grad():
        image_features = model.encode_image(image_input)
        image_features /= image_features.norm(dim=-1, keepdim=True)
    # Convert PyTorch tensor -> float32 NumPy array -> raw bytes for SQLite
    return image_features.cpu().numpy().astype(np.float32).tobytes()

def encode_text(text: str) -> np.ndarray:
    text_token = clip.tokenize([text]).to(device)
    with torch.no_grad():
        text_features = model.encode_text(text_token)
        text_features /= text_features.norm(dim=-1, keepdim=True)
    return text_features.cpu().numpy().astype(np.float32)

def compute_cosine_similarity(text_emb: np.ndarray, frame_emb_blob: bytes) -> float:
    # Deserialize blob back to float32 NumPy array
    frame_emb = np.frombuffer(frame_emb_blob, dtype=np.float32).reshape(1, -1)
    similarity = np.dot(text_emb, frame_emb.T)[0][0]
    return float(similarity)