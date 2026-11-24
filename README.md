# 🎓 ScholarMate AI
### *Your Personalized Scholarship Finder*

ScholarMate AI is an integrated, modern, and responsive web platform designed to bridge the gap between students and scholarship opportunities. Many students miss out on financial aid and merit rewards simply because navigating criteria across diverse universities and foundations is fragmented. ScholarMate AI eliminates guesswork by performing deterministic eligibility evaluation against real datasets, augmented with an AI advisor powered by Google Gemini.

---

## 🏗️ 1. Project Architecture & 5-Module Breakdown

Rather than creating isolated applications, **ScholarMate AI is engineered as one unified full-stack application** divided into five clearly bounded modules. Each module has explicit ownership and clear interfaces:

```
                                  [ User / Student ]
                                          │
                                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND LAYER (React + Vite)                                                    │
│                                                                                  │
│   ┌──────────────────────────────┐        ┌──────────────────────────────────┐   │
│   │ Module 1: Home & Landing     │        │ Module 2: Student Profile Form   │   │
│   │ • Hero banner & visual logo  │        │ • Strict 0.00 - 4.00 CGPA check  │   │
│   │ • Real-time stats counters   │───────▶│ • Department & Gender dropdowns  │   │
│   │ • Multilingual toggle (En/Bn)│        │ • Financial Need toggle          │   │
│   └──────────────────────────────┘        └─────────────────┬────────────────┘   │
│                                                             │                    │
│                                           Validated Student │ Profile            │
│                                                             ▼                    │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │ Module 5: Results Dashboard & Interactive Tools                          │   │
│   │ • Dual View: Responsive Cards & Detailed Data Table                      │   │
│   │ • Structured Filtering, Sorting (Deadline, Amount, CGPA)                 │   │
│   │ • "Almost Eligible" Tab with Missing Criteria Highlights                 │   │
│   │ • Interactive Application Checklist & Report Exporter (PDF/CSV/JSON)     │   │
│   └───────────────────────────────────▲──────────────────────────────────────┘   │
└───────────────────────────────────────┼──────────────────────────────────────────┘
                                        │ REST API (JSON)
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ BACKEND LAYER (Node.js + Express)                                                │
│                                                                                  │
│   ┌──────────────────────────────┐        ┌──────────────────────────────────┐   │
│   │ Module 3: Dataset Ingestion  │        │ Module 4: Backend API & AI       │   │
│   │ & Eligibility Engine         │───────▶│ Scholarship Advisor              │   │
│   │ • 136-record CSV Parser      │        │ • Express REST endpoints         │   │
│   │ • Deterministic Match Logic  │        │ • Google Gemini API Proxy        │   │
│   │ • Missing Criteria Detection │        │ • Graceful Fallback Generator    │   │
│   └──────────────────────────────┘        └──────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Module Responsibilities:

| Module | Name | Primary Responsibility | Key Files |
| :--- | :--- | :--- | :--- |
| **Module 1** | **Home & Landing Experience** | Branding, statistics counters, platform overview, layout shell, bilingual toggle (EN / BN). | `Navbar.jsx`, `HeroBanner.jsx`, `StatsCard.jsx`, `LanguageContext.jsx` |
| **Module 2** | **Student Profile & Validation** | Input capture (Name, CGPA 0-4, Dept, Gender, Need), validation errors, preset demo profiles. | `StudentProfileForm.jsx`, `validation.js`, `contracts.js` |
| **Module 3** | **Dataset & Eligibility Engine** | Ingesting 136 scholarships from CSV, multi-department splitting, strict deterministic matching. | `csvService.js`, `eligibilityService.js`, `scholarships.csv` |
| **Module 4** | **Backend API & AI Advisor** | Express server, Gemini API integration, prompt guardrails, zero-hallucination fallback engine. | `server.js`, `aiRoutes.js`, `geminiService.js`, `aiController.js` |
| **Module 5** | **Results Dashboard & Tools** | Card/Table views, sorting by deadline/amount, missing criteria display, checklist, report download. | `ResultsDashboard.jsx`, `ScholarshipCard.jsx`, `ApplicationChecklist.jsx`, `exporter.js` |

---

## 📁 2. Proposed Directory Structure

```text
scholarmate-ai/
├── data/
│   ├── scholarships.csv            # Original dataset with 136 verified records
│   └── schema.json                 # JSON schema definition
├── shared/
│   ├── contracts.json              # Data exchange specifications & types
│   └── contracts.js                # Shared constants, departments, & validators
├── backend/
│   ├── package.json
│   ├── .env.example                # Template for PORT, GEMINI_API_KEY, etc.
│   └── src/
│       ├── server.js               # Express application entry point
│       ├── routes/
│       │   ├── scholarshipRoutes.js # GET /api/scholarships, GET /api/stats
│       │   ├── matchRoutes.js       # POST /api/match
│       │   └── aiRoutes.js          # POST /api/ai-advisor
│       ├── controllers/
│       │   ├── scholarshipController.js
│       │   ├── matchController.js
│       │   └── aiController.js
│       ├── services/
│       │   ├── csvService.js        # Safe CSV parsing & memory caching
│       │   ├── eligibilityService.js# Deterministic eligibility & diff engine
│       │   └── geminiService.js     # Google Gemini SDK caller with fallback
│       └── utils/
│           └── parser.js            # Department semicolon parser & sanitizer
└── frontend/
    ├── package.json
    ├── vite.config.js              # Vite config with /api reverse proxy
    ├── index.html
    └── src/
        ├── App.jsx                 # Top-level view router and provider wrapper
        ├── main.jsx                # React DOM render root
        ├── index.css               # Clean responsive styling & design tokens
        ├── api/
        │   └── client.js           # Centralized API fetcher
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.jsx      # Navigation, logo, language selector
        │   │   └── Footer.jsx      # Footer & project metadata
        │   ├── home/
        │   │   ├── HeroBanner.jsx  # Hero introduction & CTA
        │   │   └── StatsCard.jsx   # Metrics: 136 scholarships, BDT aid pool
        │   ├── profile/
        │   │   └── StudentProfileForm.jsx # Input form, validation, presets
        │   ├── dashboard/
        │   │   ├── ResultsDashboard.jsx   # Tab switcher: Eligible vs Almost Eligible
        │   │   ├── ScholarshipCard.jsx    # Card with details & AI badge
        │   │   ├── ScholarshipTable.jsx   # Tabular comparison view
        │   │   ├── FilterSortBar.jsx      # Deadline & Amount sorting controls
        │   │   └── MissingCriteriaBadge.jsx # Clear missing requirement alert
        │   ├── checklist/
        │   │   └── ApplicationChecklist.jsx # Interactive checklist with progress
        │   └── common/
        │       ├── Badge.jsx
        │       ├── Button.jsx
        │       └── LoadingSpinner.jsx
        ├── context/
        │   ├── LanguageContext.jsx # English & Bangla localization state
        │   └── ScholarshipContext.jsx # Global student profile & match state
        └── utils/
            ├── eligibilityMatcher.js # Client-side matching logic
            ├── exporter.js          # PDF/CSV/JSON report generation
            └── i18n.js              # En / Bn string dictionaries
```

---

## 🔄 3. Inter-Module Communication Pipeline

To prevent tightly coupled spaghetti code, modules communicate via **unidirectional data flow and strict shared contracts**:

1. **Module 1 (Landing) ➡️ Module 2 (Profile)**:
   - User clicks **"Get Started"** or selects a demo profile preset, smoothly navigating the user to the Profile Form view.
2. **Module 2 (Profile) ➡️ Module 3 (Eligibility Matching)**:
   - When the user submits the profile, `StudentProfileForm` runs `validateStudentProfile()`.
   - On valid submission, the profile payload is sent to `POST /api/match` (or processed client-side through the identical matcher).
3. **Module 3 (Matching Engine) ➡️ Module 4 (AI Advisor)**:
   - The engine categorizes scholarships into:
     - `fullyEligible` (all requirements met: CGPA $\ge$ min_cgpa, Department matched, Gender matched, Financial need matched).
     - `almostEligible` (fails 1 or 2 requirements, computing the exact deficit, e.g. CGPA diff).
   - For eligible records, Module 4 creates contextual AI explanations via Google Gemini (or uses the built-in deterministic fallback if offline).
4. **Module 4 (AI Advisor) ➡️ Module 5 (Results Dashboard)**:
   - Module 5 receives the unified payload and populates the dashboard tabs, sorting by deadline or highest amount, providing checklist items, and enabling 1-click export.

---

## 📜 4. Shared Data Contracts

### Student Profile:
```typescript
interface StudentProfile {
  name: string;
  department: 'CSE' | 'EEE' | 'CE' | 'BBA' | 'English' | 'Other';
  cgpa: number; // 0.00 to 4.00
  gender: 'Male' | 'Female' | 'Other';
  needBased: boolean;
}
```

### Scholarship Record (From CSV):
```typescript
interface ScholarshipRecord {
  id: number;
  name: string;
  provider: string;
  min_cgpa: number;
  department: string; // e.g. "CSE;EEE;CE" or "All"
  need_based: 'yes' | 'no';
  gender: 'All' | 'Female' | 'Male';
  amount_bdt: number;
  deadline: string; // YYYY-MM-DD
  description: string;
}
```

### Match Result Item:
```typescript
interface MatchedScholarship {
  scholarship: ScholarshipRecord;
  status: 'ELIGIBLE' | 'ALMOST_ELIGIBLE';
  breakdown: {
    cgpaMet: boolean;
    departmentMet: boolean;
    needMet: boolean;
    genderMet: boolean;
    cgpaDiff?: number;
    missingReasons: string[];
    additionalCriteria: string[];
  };
  aiExplanation?: string;
}
```

---

## 🚦 5. Routing & View Plan

ScholarMate AI uses a clean tabbed view state model within `App.jsx`, providing quick instant navigation without page reload latency:
- `#home` / `view: 'home'`: Hero presentation, quick stats, feature overview.
- `#finder` / `view: 'finder'`: Interactive profile form with instant matching.
- `#results` / `view: 'results'`: Dual-tab results dashboard (Eligible / Almost Eligible), sort controls, AI counselor breakdown.
- `#checklist` / `view: 'checklist'`: Application readiness checklist with persistent checkboxes.

---

## 🚀 6. Getting Started

### Prerequisites:
- Node.js (v18+ or v20+)
- npm (v9+)

### Installation:
```bash
# 1. Install Backend Dependencies
cd backend
npm install

# 2. Setup Environment Variables
cp .env.example .env
# (Optional) Add your GEMINI_API_KEY to backend/.env

# 3. Install Frontend Dependencies
cd ../frontend
npm install
```

### Running the Application:
```bash
# Start Backend (Port 5000)
cd backend
npm start

# In a separate terminal, start Frontend (Port 5173)
cd frontend
npm run dev
```
Open your browser at `http://localhost:5173`.
