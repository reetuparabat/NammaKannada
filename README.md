# NammaConnect | ನಮ್ಮ ಕನೆಕ್ಟ್
> **Practical Everyday Kannada Learning & Communication Web Application**  
> *Developed for KSCST Student Project & Hackathons*  
> **Problem Statements:** *Kannada in Everyday Life* • *Kannada for Everyone*

---

## 📖 Executive Summary

**NammaConnect (ನಮ್ಮ ಕನೆಕ್ಟ್)** is a full-stack, responsive, context-aware web application designed to help non-Kannada speakers learn and communicate in real-world Karnataka situations.

Unlike generic translation tools or abstract flashcard apps, NammaConnect focuses on **task-oriented, situation-based communication**:
- 🚌 **Commuting & Transit:** Asking for tickets, bus stop inquiries, auto-rickshaw fare negotiations.
- 🛒 **Shopping & Markets:** Inquiring prices, bargaining politely, asking for quantities and UPI payments.
- 🎓 **Education & Campus Life:** Finding classrooms, library inquiries, speaking with professors and office staff.
- 🏥 **Healthcare & Clinics:** Explaining basic symptoms (fever, pain, dizziness), buying medicines at pharmacies, understanding dosage instructions.

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **Situation-Based Learning** | Explore 4 real-world categories and 12 realistic scenarios with contextual learning objectives. |
| **Linguistic Triad** | Every phrase presents: **Kannada Script** (readable font) + **English Meaning** + **Phonetic Transliteration** for effortless pronunciation. |
| **Native Audio Pronunciation** | One-tap native Kannada speech synthesis (`SpeechSynthesisUtterance` / `kn-IN`) for all phrases. |
| **Interactive Branching Practice** | Realistic turn-by-turn conversational dialogue player simulating interactions with bus conductors, shopkeepers, and doctors. |
| **Server-Scored Assessments** | Scenario-based quizzes with tamper-proof backend evaluation, immediate feedback, and pedagogical explanations. |
| **Progress Dashboard & Bookmarks** | Track completed conversations, quiz performance, and pin vital everyday phrases for quick access. |
| **Offline Phrasebook & PWA** | Custom Service Worker and cached phrasebook storage allowing travelers to access essential phrases even with zero network connectivity. |
| **Content Lifecycle & Admin Portal** | Editorial governance workflow supporting `Draft` &rarr; `Under Review` &rarr; `Approved` &rarr; `Published` &rarr; `Archived` transitions. |

---

## 🛠️ Technology Stack & Architecture

### Frontend
- **Framework:** Next.js 14 (App Router architecture)
- **Language:** TypeScript 5 with strict typing
- **Styling:** Tailwind CSS with custom dark mode and Kannada typography optimization
- **Icons:** Lucide React
- **Data Fetching:** SWR for reactive cache invalidation and revalidation
- **Audio:** Web Speech API (`SpeechSynthesis`) with `kn-IN` Kannada voice fallback
- **Offline / PWA:** Service Worker (`sw.js`), Web App Manifest (`manifest.json`), LocalStorage offline caching

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **ORM & Database:** SQLAlchemy 2.0 with SQLite (dev) / PostgreSQL-ready architecture
- **Database Migrations:** Alembic
- **Validation:** Pydantic v2 schemas for strict request/response data contracts
- **Security:** HTTP Basic Authentication with Bcrypt password hashing
- **Testing:** Pytest with FastAPI TestClient (20 automated tests)

---

## 📂 Project Structure

```text
c:\hackathon\
├── backend/
│   ├── app/
│   │   ├── models/            # SQLAlchemy ORM models (Category, Scenario, Phrase, Quiz, Conversation, Review)
│   │   ├── schemas/           # Pydantic v2 validation contracts
│   │   ├── routers/           # FastAPI endpoints (categories, scenarios, phrases, offline, admin)
│   │   ├── services/          # Business logic separation (category, phrase, conversation, quiz scoring)
│   │   ├── security/          # HTTP Basic Auth + Bcrypt password validation
│   │   ├── seed/              # Seed script with 4 categories, 12 scenarios, 63+ phrases
│   │   ├── config.py          # Environment settings
│   │   ├── database.py        # SQLAlchemy engine and session factory
│   │   └── main.py            # FastAPI entry point with CORS and error handlers
│   ├── alembic/               # Database schema versioning
│   ├── tests/                 # Automated Pytest suite (20 tests)
│   ├── requirements.txt       # Python dependencies
│   ├── pytest.ini             # Pytest configuration
│   └── .env                   # Backend environment configuration
├── frontend/
│   ├── app/                   # Next.js 14 App Router pages
│   │   ├── categories/[id]/   # Category explorer
│   │   ├── scenarios/[id]/    # Scenario detail & phrase listing
│   │   ├── phrases/[id]/      # Deep phrase focus & breakdown
│   │   ├── practice/[id]/     # Interactive conversation player
│   │   ├── quiz/[id]/         # Quiz examination & scoring
│   │   ├── progress/          # Learning progress dashboard
│   │   ├── saved/             # Bookmarked phrases collection
│   │   ├── offline/           # Offline phrasebook & sync tool
│   │   ├── admin/             # Editorial content governance portal
│   │   ├── layout.tsx         # Root layout with Header, Footer, PWA meta
│   │   └── page.tsx           # Home landing page with live search
│   ├── src/
│   │   ├── components/        # Reusable UI & Layout components
│   │   ├── hooks/             # Custom React hooks (useBookmarks)
│   │   ├── lib/               # API client, storage, offline utilities
│   │   └── types/             # TypeScript interfaces
│   ├── public/
│   │   ├── sw.js              # Service Worker for offline asset caching
│   │   └── manifest.json      # PWA application manifest
│   └── package.json           # Frontend dependencies
└── README.md                  # Comprehensive documentation
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Python 3.11+** installed
- **Node.js 18+** and **npm** installed

---

### 2. Backend Setup & Run

Open a terminal in `backend/`:

```bash
cd backend

# 1. Activate virtual environment (or create with python -m venv .venv)
.\.venv\Scripts\Activate.ps1    # On Windows PowerShell
# source .venv/bin/activate     # On Linux / macOS

# 2. Install dependencies
pip install -r requirements.txt

# 3. Seed database (creates nammaconnect.db with 4 categories, 12 scenarios, 63+ phrases)
python -m app.seed.seed_data

# 4. Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be accessible at:
- **API Root:** `http://localhost:8000`
- **Swagger Interactive Docs:** `http://localhost:8000/docs`
- **Health Check:** `http://localhost:8000/health`

---

### 3. Frontend Setup & Run

Open a second terminal in `frontend/`:

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Run Next.js in development mode
npm run dev
```

Frontend will be accessible at:
- **Web Application:** `http://localhost:3000`

---

## 🧪 Automated Testing

### Backend Unit & Integration Tests (Pytest)
Run the full test suite covering all routers, conversation state machines, quiz scoring, and admin authorization:

```bash
cd backend
.\.venv\Scripts\pytest -v
```

**Test Coverage Summary (20/20 PASSED):**
- `test_health_check` & `test_root_endpoint`: Health probe and service metadata.
- `test_list_categories`, `test_get_category_detail`, `test_get_category_not_found`: Category hierarchy.
- `test_list_category_scenarios`: Scenario lookup and learning objectives.
- `test_get_scenario_detail` & `test_get_scenario_phrases`: Published phrase filtering.
- `test_get_phrase_by_id`: Transliteration and contextual notes integrity.
- `test_search_phrases_empty` & `test_search_phrases_query`: Multi-field phrase search engine.
- `test_get_scenario_conversation`: Dialogue branching trees and speaker sequences.
- `test_get_scenario_quiz`: Concealment of correct answers before submission.
- `test_submit_quiz_scoring` & `test_submit_quiz_empty_answers`: Server-side answer scoring and explanation generation.
- `test_offline_manifest`: Cacheable JSON schema for client offline storage.
- `test_admin_content_unauthorized` & `test_admin_content_authorized`: HTTP Basic Auth role protection.
- `test_admin_phrase_lifecycle`: Complete state transitions (`Draft` &rarr; `Under Review` &rarr; `Approved` &rarr; `Published` &rarr; `Archived`).

---

## 🔑 Administrative Credentials (Demo)

For evaluating the Content Management & Editorial Workflow:
- **Portal URL:** `http://localhost:3000/admin`
- **Username:** `admin`
- **Password:** `admin123`

The admin dashboard allows creating new phrases in `Draft` state and stepping them through editorial review, approval, publishing, and archiving.

---

## 🌐 Offline Support & Resilience

1. **Service Worker (`public/sw.js`):** Intercepts navigation and static asset requests, serving cached pages when offline.
2. **Offline Phrasebook (`/offline`):** Users can tap "Download Phrasebook for Offline Use" to store all 63+ essential phrases with audio support directly in the browser.
3. **Resilient Speech:** Uses the local browser speech synthesizer, which functions seamlessly offline on supported devices.

---

## 👥 Contributors & Acknowledgements
- Developed for the **Karnataka State Council for Science and Technology (KSCST)** Student Project Programme & Hackathons.
- Built with a focus on practical linguistic integration, usability, and accessibility for everyone living, studying, and working in Karnataka.
- *ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ, ಸಿರಿಗನ್ನಡಂ ಬಾಳ್ಗೆ!*
