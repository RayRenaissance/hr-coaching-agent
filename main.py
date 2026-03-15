# ============================================================
# HR Coaching Agent - Backend
# Supports: text transcript, .txt/.docx file, video/audio file
# Model: Gemini 2.5 Flash (multimodal)
# ============================================================

# 1. IMPORTS
import os
import time
import tempfile
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# 2. ENV + CLIENT
load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# 3. FASTAPI APP
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. MODELS
class SessionData(BaseModel):
    transcript: str
    consultant_name: str

class CoachingResponse(BaseModel):
    empathy_score: int
    clarity_score: int
    coaching_tips: List[str]
    summary: str

# 5. HEALTH CHECK
@app.get("/")
def read_root():
    return {"status": "Agent is Online", "model": "Gemini 2.5 Flash"}

# ─── HELPER: build prompt ────────────────────────────────────────────────────
def build_prompt(consultant_name: str) -> str:
    return f"""
You are an expert HR coaching AI.
Analyze the consultation session for HR consultant: {consultant_name}.

If given a video or audio file, first transcribe the relevant parts then analyze.
If given a text transcript, analyze it directly.

Return a JSON object with EXACTLY these fields:
- empathy_score  (integer 0-100): how empathetic the consultant was
- clarity_score  (integer 0-100): how clearly they communicated
- coaching_tips  (list of exactly 3 strings): specific, actionable improvement tips
- summary        (string): a short 2-3 sentence paragraph summarizing performance

Be specific and constructive. Base scores on actual content, not assumptions.
"""

# ─── ROUTE 1: Text transcript ─────────────────────────────────────────────────
@app.post("/analyze-session", response_model=CoachingResponse)
async def analyze_session(data: SessionData):
    prompt = build_prompt(data.consultant_name) + f"\n\nTranscript:\n{data.transcript}"
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": CoachingResponse,
        }
    )
    return response.parsed

# ─── ROUTE 2: File upload (.txt, .docx, .mp4, .mp3, .wav, .webm, etc.) ───────
@app.post("/analyze-file", response_model=CoachingResponse)
async def analyze_file(
    consultant_name: str = Form(...),
    file: UploadFile = File(...)
):
    suffix = os.path.splitext(file.filename)[1].lower()

    # Save to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        # ── Plain text ─────────────────────────────────────────────────────
        if suffix == ".txt":
            text = contents.decode("utf-8", errors="ignore")
            prompt = build_prompt(consultant_name) + f"\n\nTranscript:\n{text}"
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"response_mime_type": "application/json", "response_schema": CoachingResponse}
            )
            return response.parsed

        # ── Word document ──────────────────────────────────────────────────
        if suffix == ".docx":
            try:
                import docx as python_docx
                doc = python_docx.Document(tmp_path)
                text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
            except Exception:
                text = contents.decode("utf-8", errors="ignore")
            prompt = build_prompt(consultant_name) + f"\n\nTranscript:\n{text}"
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"response_mime_type": "application/json", "response_schema": CoachingResponse}
            )
            return response.parsed

        # ── Video / Audio → Gemini Files API (multimodal) ─────────────────
        mime = file.content_type or _guess_mime(suffix)
        print(f"Uploading {file.filename} ({mime}) to Gemini Files API...")

        uploaded = client.files.upload(
            file=tmp_path,
            config=types.UploadFileConfig(mime_type=mime, display_name=file.filename)
        )

        # Poll until ready
        while uploaded.state.name == "PROCESSING":
            time.sleep(3)
            uploaded = client.files.get(name=uploaded.name)

        if uploaded.state.name == "FAILED":
            raise ValueError("Gemini file processing failed.")

        print(f"File ready: {uploaded.uri}")

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_uri(file_uri=uploaded.uri, mime_type=mime),
                types.Part.from_text(build_prompt(consultant_name))
            ],
            config={"response_mime_type": "application/json", "response_schema": CoachingResponse}
        )

        # Cleanup from Gemini storage
        client.files.delete(name=uploaded.name)
        return response.parsed

    finally:
        os.unlink(tmp_path)

# ─── MIME helper ──────────────────────────────────────────────────────────────
def _guess_mime(suffix: str) -> str:
    return {
        ".mp4": "video/mp4", ".mov": "video/quicktime",
        ".avi": "video/x-msvideo", ".webm": "video/webm",
        ".mp3": "audio/mpeg", ".wav": "audio/wav",
        ".m4a": "audio/mp4", ".ogg": "audio/ogg",
        ".txt": "text/plain",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }.get(suffix, "application/octet-stream")