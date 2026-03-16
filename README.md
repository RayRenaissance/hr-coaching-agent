# 🤖 HR Coaching Agent — Agentic JSO (Phase 2)

> **Live Demo:** [https://hr-coaching-agent.vercel.app](https://hr-coaching-agent.vercel.app)  
> **Backend API:** [https://hr-coaching-agent.onrender.com](https://hr-coaching-agent.onrender.com)  
> **Assignment:** JSO Phase-2 — Agentic Career Intelligence Development  
> **Part B Task:** HR Coaching Agent for the HR Consultant Dashboard

---

## 📌 Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [API Reference](#api-reference)
- [Assignment Coverage](#assignment-coverage)
- [Ethical & Governance Considerations (Part C)](#ethical--governance-considerations-part-c)

---

## Overview

The **HR Coaching Agent** is a full-stack AI-powered application built for **JSO Phase-2: Agentic Career Intelligence Development**. It addresses the core problem identified in Part B of the assignment: HR consultants receive little to no structured feedback about their consultation performance.

This agent uses **Google Gemini 2.5 Flash** (multimodal) to analyze consultation sessions — whether provided as text transcripts, `.txt`/`.docx` files, or video/audio recordings — and returns structured, actionable coaching insights in real time.

---

## Problem Statement

> *"HR experts receive little feedback about their consultation performance."*
> — JSO Assignment Part B

In the current Phase-1 JSO system, HR consultants operate without any automated feedback loop. After each consultation:

- There is **no performance scoring** system
- Consultants receive **no empathy or clarity analysis**
- Coaching suggestions are **manually driven** or absent entirely
- Video/audio recordings go **unanalyzed**

This creates a skills gap over time, reduces candidate experience quality, and limits consultant growth within the platform.

---

## Live Demo

🌐 **[https://hr-coaching-agent.vercel.app](https://hr-coaching-agent.vercel.app)**

The dashboard is fully functional. You can:

1. Click **"Run AI Analysis"**
2. Choose a built-in demo script (Strong / Average / Needs Improvement) or paste your own transcript
3. Optionally upload a `.txt`, `.docx`, or video/audio file
4. Hit **"Analyse Now"** — scores and coaching tips update live

> ⚠️ The backend runs on Render's free tier. The first request may take 30–50 seconds to wake up.

---

## Features

- 🎯 **Empathy & Clarity Scoring** — AI-generated 0–100 scores per session
- 💡 **3 Personalised Coaching Tips** — prioritised, actionable improvement suggestions
- 📝 **Session Summary** — concise AI-written paragraph summarising consultant performance
- 📄 **Multi-format Input** — text transcript, `.txt`, `.docx`, `.mp4`, `.mp3`, `.wav`, `.webm`, and more
- 🎥 **Multimodal Analysis** — video/audio files are uploaded to Gemini Files API and transcribed automatically
- 📊 **Performance Dashboard** — live charts (Line + Radar) showing metric trends over 4 weeks
- 🧪 **Demo Scripts** — 3 built-in consultation scenarios for instant testing (Strong / Average / Poor)
- ✅ **Structured JSON Output** — Pydantic-validated responses guarantee consistent data shape

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **UI Components** | shadcn/ui, Radix UI |
| **Charts** | Recharts (LineChart + RadarChart) |
| **Backend** | Python, FastAPI |
| **AI Model** | Google Gemini 2.5 Flash (multimodal) |
| **File Handling** | Gemini Files API (video/audio), python-docx (.docx) |
| **Validation** | Pydantic v2 |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER (Browser)                       │
│              React + TypeScript + Vite                  │
│         hosted on Vercel (hr-coaching-agent.vercel.app) │
└──────────────────────┬──────────────────────────────────┘
                       │  REST API (JSON / multipart form)
                       ▼
┌─────────────────────────────────────────────────────────┐
│               FastAPI Backend (Python)                  │
│         hosted on Render (hr-coaching-agent.onrender.com)│
│                                                         │
│  POST /analyze-session   ← text transcript              │
│  POST /analyze-file      ← .txt / .docx / video / audio │
└──────────────────────┬──────────────────────────────────┘
                       │  Gemini API calls
                       ▼
┌─────────────────────────────────────────────────────────┐
│           Google Gemini 2.5 Flash (Multimodal)          │
│                                                         │
│  • Text input  → direct generate_content()              │
│  • File input  → Gemini Files API → poll → analyze      │
│  • Structured output via response_schema (Pydantic)     │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. User selects input mode (text / file / video) in the React dashboard
2. Frontend sends a `POST` request to the FastAPI backend
3. Backend builds a contextual prompt with the consultant's name
4. For media files: file is uploaded to **Gemini Files API**, polled until ready, then analyzed
5. Gemini returns a **structured JSON response** validated against the `CoachingResponse` Pydantic schema
6. Frontend updates scores, coaching tips, and summary in real time

---

## Project Structure

```
hr-coaching-agent/
├── main.py                  # FastAPI backend — all routes and AI logic
├── requirements.txt         # Python dependencies
├── start.sh                 # Render startup script
├── .env                     # (not committed) GEMINI_API_KEY
└── FrontEnd/
    ├── src/
    │   ├── Dashboard.tsx    # Main dashboard UI + all state management
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── index.css
    │   ├── lib/
    │   │   └── utils.ts     # cn() Tailwind utility
    │   └── components/
    │       └── ui/          # shadcn/ui components (Button, Card, Badge)
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

---

## Local Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### 1. Clone the repo

```bash
git clone https://github.com/RayRenaissance/hr-coaching-agent.git
cd hr-coaching-agent
```

### 2. Backend setup

```bash
# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```

Backend will be live at `http://localhost:8000`

### 3. Frontend setup

```bash
cd FrontEnd
npm install
npm run dev
```

Frontend will be live at `http://localhost:5173`

> To point the frontend at your local backend, update the fetch URLs in `Dashboard.tsx` from the Render URL to `http://localhost:8000`.

---

## API Reference

### `GET /`
Health check.
```json
{ "status": "Agent is Online", "model": "Gemini 2.5 Flash" }
```

### `POST /analyze-session`
Analyze a text transcript.

**Request body (JSON):**
```json
{
  "consultant_name": "Sarah",
  "transcript": "Sarah: Good morning! ..."
}
```

**Response:**
```json
{
  "empathy_score": 88,
  "clarity_score": 91,
  "coaching_tips": [
    "Continue using open-ended questions to build rapport...",
    "Consider summarising candidate responses to confirm understanding...",
    "Proactively share growth paths earlier in the conversation..."
  ],
  "summary": "Sarah demonstrated strong empathy and clear communication throughout the session..."
}
```

### `POST /analyze-file`
Analyze a `.txt`, `.docx`, or media file (video/audio).

**Request:** `multipart/form-data`
- `consultant_name` (string)
- `file` (`.txt` / `.docx` / `.mp4` / `.mp3` / `.wav` / `.webm` / `.mov` etc.)

**Response:** same shape as `/analyze-session`

---

## Assignment Coverage

### Part A — Core Questions

| Section | Coverage |
|---|---|
| Why AI agents for JSO | HR consultants lack structured feedback; manual coaching is unscalable |
| Inefficiencies in Phase-1 | No performance scoring, no automated analysis of recordings |
| Agent type | Reactive + proactive coaching agent with multimodal input support |
| Dashboard integration | HR Consultant Dashboard (primary focus) |
| Technical architecture | React + FastAPI + Gemini 2.5 Flash + Gemini Files API |
| Phase-1 integration | REST APIs over existing Node/Supabase stack; event trigger on session end |
| Timeline | Architecture: 1 week → Development: 3 weeks → Testing: 1 week → Deploy: 1 week |

### Part B — Main Task Execution

This entire project is the execution of Part B. The HR Coaching Agent:

- ✅ Analyzes HR consultation sessions (text, file, video/audio)
- ✅ Returns empathy score, clarity score, coaching tips, and a written summary
- ✅ Live deployed at [https://hr-coaching-agent.vercel.app](https://hr-coaching-agent.vercel.app)
- ✅ Demonstrates 3 realistic scenarios (Strong / Average / Poor session)

---

## Ethical & Governance Considerations (Part C)

### Governance & Transparency
- All AI scores are returned with accompanying **written summaries** explaining the reasoning — not black-box numbers
- The Gemini prompt explicitly instructs the model to base scores on **actual content**, not assumptions
- Every analysis is tied to a named consultant, creating an **auditable coaching record**

### Workers — Fairness to HR Professionals
- The agent is designed as a **coaching tool, not a surveillance or evaluation tool**
- Scores are framed as growth metrics, not performance ratings for HR purposes
- The system **never makes hiring or firing recommendations** about the consultant

### Community & Inclusion
- The agent's coaching tips are checked against diverse consultation styles
- Prompt design avoids penalising **cultural communication differences** in empathy expression

### Environment — Efficient Compute
- Uses **Gemini 2.5 Flash** (not Pro/Ultra) — optimised for cost and energy efficiency
- Media files are **deleted from Gemini Files API immediately after analysis** to minimise storage footprint
- Frontend is a static build on Vercel — no always-on server compute

### Customers — Data Privacy
- No consultation transcripts or recordings are **stored in any database**
- Files are processed in-memory and deleted after each request
- The API does not log request bodies — sensitive candidate/consultant data is ephemeral

### Sustainability
- Built to integrate with JSO's existing Supabase + AWS + Vercel stack — **no new infrastructure required**
- Coaching insights support **career development for underserved consultants** who lack access to expensive human coaching

---

## License

MIT © 2026 RayRenaissance
