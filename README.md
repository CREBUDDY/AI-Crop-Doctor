# 🌾 AI Crop Doctor

> AI-Powered Smart Crop Health & Disease Prediction Platform

**Version:** 1.0 | **Status:** MVP Development

---

## Architecture

```
React Frontend (PWA)
       │
       ▼
FastAPI Backend
       │
 ┌─────┴──────────────┐
 │                    │
 ▼                    ▼
AI Service      Recommendation Service
 │                    │
 ▼                    ▼
Gemini API      Verified Knowledge DB (PostgreSQL)
       │
       ▼
Weather Service (OpenWeatherMap)
       │
       ▼
PostgreSQL / Firebase (Auth + Storage + FCM)
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Tailwind CSS + Vite (PWA) |
| Backend | FastAPI (Python 3.12+) |
| AI Service | Gemini Vision API (→ YOLOv11/EfficientNet future) |
| Recommendation | PostgreSQL seeded with ICAR/KVK verified data |
| Weather | OpenWeatherMap API (provider-agnostic interface) |
| Auth | Firebase Authentication |
| Storage | Firebase Storage |
| Push | Firebase Cloud Messaging |
| ORM | SQLAlchemy + Alembic |

## Project Structure

```
AI CROP DOCTOR/
├── frontend/          # React PWA
├── backend/           # FastAPI Python
├── database/          # Seed data (ICAR verified)
├── docs/              # Architecture docs
├── .env.example       # Environment template
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.12+
- PostgreSQL 15+
- Firebase project
- Gemini API key
- OpenWeatherMap API key

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env   # Fill in your values
alembic upgrade head
python -m app.scripts.seed_database
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local  # Fill in your values
npm run dev
```

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

## Safety Notice

Medicine and treatment recommendations are sourced exclusively from verified agricultural databases (ICAR, KVK, State Agriculture Universities). AI predictions with confidence below 80% trigger low-confidence warnings and recommend consultation with the nearest Krishi Vigyan Kendra.

---

*Empowering every farmer with an AI-powered digital crop doctor.*
