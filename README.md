# NammaKannada | ನಮ್ಮ ಕನ್ನಡ
> **Practical Everyday Kannada Learning & Communication Web Application**  
> *Developed for KSCST Student Project & Hackathons*  
> **Problem Statements:** *Kannada in Everyday Life* • *Kannada for Everyone*

---

## 📖 Executive Summary

**NammaKannada (ನಮ್ಮ ಕನ್ನಡ)** is a full-stack, responsive, context-aware web application designed to help non-Kannada speakers learn and communicate in real-world Karnataka situations.

Unlike generic translation tools or abstract flashcard apps, NammaKannada focuses on **task-oriented, situation-based communication**:
- 🚌 **Commuting & Transit:** Asking for tickets, bus stop inquiries, auto-rickshaw fare negotiations.
- 🛒 **Shopping & Markets:** Inquiring prices, bargaining politely, asking for quantities and UPI payments.
- 🎓 **Education & Campus Life:** Finding classrooms, library inquiries, speaking with professors and office staff.
- 🏥 **Healthcare & Clinics:** Explaining basic symptoms (fever, pain, dizziness), buying medicines at pharmacies, understanding dosage instructions.

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **Situation-Based Learning** | Explore **6 real-world categories** and **18 realistic scenarios** (114 verified everyday phrases) with contextual learning objectives. |
| **Linguistic Triad** | Every phrase presents: **Kannada Script** (high-contrast typography) + **English Meaning** + **Phonetic Transliteration** for effortless pronunciation. |
| **Native Audio Pronunciation** | One-tap native Kannada speech synthesis (`SpeechSynthesisUtterance` / `kn-IN`) with interactive Pronunciation Coach speed controls. |
| **Interactive Branching Practice** | Realistic turn-by-turn conversational dialogue player simulating interactions with bus conductors, shopkeepers, auto drivers, landlords, and doctors. |
| **Server-Scored Assessments** | Scenario-based quizzes with tamper-proof backend evaluation, immediate feedback, and pedagogical explanations. |
| **Progress Dashboard & Bookmarks** | Track completed conversations, quiz performance, and pin vital everyday phrases for quick access. |
| **Offline Phrasebook (IndexedDB + PWA)** | Custom Service Worker (`v2`) and asynchronous IndexedDB storage allowing travelers to access all essential phrases and audio offline. |
| **Content Lifecycle & Admin Portal** | Editorial governance workflow supporting `Draft` &rarr; `Under Review` &rarr; `Approved` &rarr; `Published` &rarr; `Archived` transitions with reviewer audit logging. |

---

## 🛠️ Technology Stack & Architecture

### Frontend
- **Framework:** Next.js 14 (App Router architecture)
- **Language:** TypeScript 5 with strict typing
- **Styling:** Tailwind CSS with accessible Dark / Light theme toggle and WCAG AA Kannada typography
- **Icons:** Lucide React
- **Data Fetching:** SWR for reactive cache invalidation and revalidation
- **Audio:** Web Speech API (`SpeechSynthesis`) with `kn-IN` voice synthesis and speech recognition
- **Offline / PWA:** Service Worker (`sw.js` v2), Web App Manifest (`manifest.json`), IndexedDB phrase storage (`indexedDb.ts`)
- **Testing:** Jest + React Testing Library (4 test suites, 7 tests)

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **ORM & Database:** SQLAlchemy 2.0 with SQLite (dev) / PostgreSQL-ready architecture
- **Database Migrations:** Alembic
- **Validation:** Pydantic v2 schemas for strict request/response data contracts
- **Security:** HTTP Basic Authentication with Bcrypt password hashing and production startup credential validation
- **Testing:** Pytest with in-memory SQLite isolation (23 automated tests)

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

# 3. Seed database (idempotent master seed creating 6 categories, 18 scenarios, 114 phrases, conversations, quizzes)
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

## 📱 Android App (Native APK & WebAPK)

NammaKannada is fully packaged and ready to run on Android devices via two flexible pathways:

### Option A: Native Android Studio Project (Capacitor)
A complete, pre-configured native Gradle project is located in [`frontend/android`](file:///c:/hackathon/frontend/android):
* **Package ID:** `com.nammakannada.app`
* **App Name:** NammaKannada (ನಮ್ಮ ಕನ್ನಡ)
* **Permissions Configured:** `INTERNET`, `ACCESS_NETWORK_STATE`, `RECORD_AUDIO` (for voice practice), and `usesCleartextTraffic="true"` (for local development backends).
* **Launcher Icons:** Full density mipmap suite (`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`) with round icon variants.

**To build the Android APK:**
1. Open **Android Studio**.
2. Select **File &rarr; Open** and choose `c:\hackathon\frontend\android`.
3. Let Gradle sync dependencies.
4. Select **Build &rarr; Build Bundle(s) / APK(s) &rarr; Build APK(s)** to generate `app-debug.apk`.
5. Connect your Android phone via USB debugging or start an Android Emulator, then click **Run 'app'**.

*Note: For testing against your computer's local dev server from an Android Emulator, the app connects to `http://10.0.2.2:8000` (FastAPI) and `http://10.0.2.2:3000` (Next.js).*

### Option B: Instant Android WebAPK (Zero-Install / One-Click)
1. Open `http://<YOUR_COMPUTER_IP>:3000` in Google Chrome or Edge on any Android smartphone.
2. Tap the **"Install Android App"** button in the top navigation bar (or Chrome's ⋮ menu &rarr; **Install App**).
3. Android will install the native **WebAPK** onto your home screen and app drawer with a full-screen standalone window, offline caching, and native app gestures.

---

## 🧪 Automated Testing

### 1. Backend Unit & Integration Tests (Pytest)
Run the full test suite with complete in-memory database isolation:

```bash
cd backend
.\.venv\Scripts\pytest -v
```

**Test Coverage Summary (23/23 PASSED):**
- `test_health_check` & `test_root_endpoint`: Health probe and service metadata.
- `test_list_categories`, `test_get_category_detail`, `test_get_category_not_found`: Category hierarchy across all 6 categories.
- `test_list_category_scenarios`: Scenario lookup and learning objectives across 18 scenarios.
- `test_get_scenario_detail` & `test_get_scenario_phrases`: Published phrase filtering.
- `test_get_phrase_by_id`: Transliteration, example sentences, and formality notes integrity.
- `test_search_phrases_empty` & `test_search_phrases_query`: Multi-field Kannada phrase search engine.
- `test_get_scenario_conversation`: Dialogue branching trees and speaker sequences.
- `test_get_scenario_quiz`: Concealment of correct answers before submission.
- `test_submit_quiz_scoring` & `test_submit_quiz_empty_answers`: Server-side answer scoring and explanation generation.
- `test_offline_manifest`: Cacheable JSON schema for client offline storage.
- `test_admin_content_unauthorized` & `test_admin_content_authorized`: HTTP Basic Auth role protection.
- `test_admin_phrase_lifecycle`: Complete state transitions (`Draft` &rarr; `Under Review` &rarr; `Approved` &rarr; `Published` &rarr; `Archived`).
- `test_unauthorized_user_cannot_approve_or_publish`: Security verification that unauthorized users cannot bypass review.
- `test_modifying_published_phrase_reverts_to_draft`: Re-review enforcement when modifying approved content.
- `test_draft_phrase_excluded_from_search_and_manifest`: Guarantees unpublished content never leaks to learners.

### 2. Frontend Unit & Component Tests (Jest + React Testing Library)
Run frontend UI and storage tests:

```bash
cd frontend
npm test -- --ci
```

**Test Coverage Summary (4/4 Test Suites, 7/7 PASSED):**
- `EmptyState.test.tsx`: Validates helpful empty and 404 in-development status states.
- `ErrorMessage.test.tsx`: Verifies error alerts and user retry triggers.
- `storage.test.ts`: Tests phrase bookmarking lifecycle and progress tracking without duplicate entries.
- `indexedDb.test.ts`: Tests IndexedDB manifest caching, offline phrase lookup, and localStorage fallback.

---

## 🔑 Administrative Access & Security

For evaluating the Content Management & Editorial Workflow:
- **Portal URL:** `http://localhost:3000/admin`
- **Default Development Credentials:** Configured in `backend/.env` (default username `admin`).
- **Production Security:** When running in production (`ENVIRONMENT=production`), the backend validates that strong, non-default credentials are provided on startup and rejects insecure defaults.

The admin dashboard provides a complete review workflow:
1. Contributors submit phrases in `Draft` state.
2. Reviewers inspect linguistic accuracy, pronunciation, and cultural context.
3. Once approved, phrases transition to `Published` and become accessible to learners.
4. Any linguistic modification to a published phrase automatically reverts it to `Draft` for verification.

---

## 🌐 Offline Support & IndexedDB Resilience

1. **Service Worker (`public/sw.js` v2):** Intercepts navigation and static asset requests, serving cached pages when offline. Administrative and authentication endpoints are strictly excluded.
2. **Offline Phrasebook (`/offline`):** Powered by IndexedDB (`indexedDb.ts`) with automatic fallback to localStorage, enabling travelers to access all 114 verified Kannada phrases even with zero mobile data.
3. **Resilient Speech:** Uses the local browser speech synthesizer, which functions seamlessly offline on supported devices.

---

## 👥 Contributors & Acknowledgements
- Developed for the **Karnataka State Council for Science and Technology (KSCST)** Student Project Programme & Hackathons.
- Built with a focus on practical linguistic integration, usability, and accessibility for everyone living, studying, and working in Karnataka.
- *ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ, ಸಿರಿಗನ್ನಡಂ ಬಾಳ್ಗೆ!*
