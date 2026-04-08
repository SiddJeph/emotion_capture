# Product Design: Architecture and Design

## 1. System Architecture Overview

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        UI["Next.js Frontend<br/>React 18 + TypeScript"]
        CAM["Webcam API"]
        ML_C["face-api.js<br/>TensorFlow.js"]
    end

    subgraph Server["Server Layer"]
        API["API Routes"]
        AUTH["Auth Service"]
        ML_S["ML Scoring"]
    end

    subgraph Data["Data Layer"]
        DB[("PostgreSQL")]
        CACHE[("JSON Cache")]
    end

    CAM --> ML_C --> UI
    UI <--> API
    API <--> AUTH
    API <--> ML_S
    API <--> DB
    API <--> CACHE
```

### Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend Framework | Next.js 14 | SSR, API routes, file-based routing |
| ML Runtime | TensorFlow.js | Browser-based, no server GPU needed |
| Database | PostgreSQL | Relational, JSONB support, Supabase |
| Deployment | Docker | Portable, consistent environments |
| Styling | Tailwind CSS | Rapid development, utility-first |

---

## 2. Application Layers

### Layer 1: Presentation Layer
```
┌─────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                      │
├─────────────────────────────────────────────────────────┤
│  Pages:                                                  │
│  • / (Landing)           • /login                       │
│  • /dashboard            • /jobs                        │
│  • /assessment           • /admin/*                     │
├─────────────────────────────────────────────────────────┤
│  Components:                                             │
│  • CalibrationScreen     • AssessmentEngine             │
│  • OceanQuestionnaire    • AnalysisScreen               │
│  • ModelLoader           • ResultsScreen                │
└─────────────────────────────────────────────────────────┘
```

### Layer 2: Business Logic Layer
```
┌─────────────────────────────────────────────────────────┐
│                 BUSINESS LOGIC LAYER                     │
├─────────────────────────────────────────────────────────┤
│  ML Models:                                              │
│  • emotion-model.ts      → EMOTION-MARKOV-v1.3          │
│  • personality-model.ts  → OCEAN-IRT-v2.1               │
│  • Job Matching          → Weighted scoring algorithm   │
├─────────────────────────────────────────────────────────┤
│  Services:                                               │
│  • Face Detection        • Score Calculation            │
│  • Authentication        • Job Matching                 │
└─────────────────────────────────────────────────────────┘
```

### Layer 3: Data Access Layer
```
┌─────────────────────────────────────────────────────────┐
│                  DATA ACCESS LAYER                       │
├─────────────────────────────────────────────────────────┤
│  API Endpoints:                                          │
│  • POST /api/auth/login      • POST /api/auth/register  │
│  • GET/POST /api/responses   • GET/POST /api/jobs       │
│  • GET/POST /api/applications • GET /api/assessments    │
├─────────────────────────────────────────────────────────┤
│  Storage:                                                │
│  • Supabase (PostgreSQL)     • Local JSON (fallback)    │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Database Design

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ APPLICATIONS : submits
    USERS ||--o{ RESPONSES : creates
    JOBS ||--o{ APPLICATIONS : receives
    APPLICATIONS ||--o| RESPONSES : has

    USERS {
        uuid id PK
        string email
        string name
        string role
        timestamp created_at
    }

    JOBS {
        uuid id PK
        string title
        string company
        string location
        json ideal_traits
        timestamp deadline
    }

    APPLICATIONS {
        uuid id PK
        uuid user_id FK
        uuid job_id FK
        string status
        int match_score
        timestamp applied_at
    }

    RESPONSES {
        uuid id PK
        uuid user_id FK
        string video_id
        json raw_timeline
        json summary
        timestamp created_at
    }
```

### Database Schema

| Table | Columns | Purpose |
|-------|---------|---------|
| `users` | id, email, name, role, password_hash | User accounts |
| `jobs` | id, title, company, ideal_traits, deadline | Job listings |
| `applications` | id, user_id, job_id, status, match_score | Job applications |
| `responses` | id, user_id, raw_timeline, summary | Assessment results |

---

## 4. Component Design

### Frontend Component Hierarchy

```mermaid
flowchart TB
    APP[App Layout]
    APP --> AUTH[AuthProvider]
    
    AUTH --> PAGES[Pages]
    
    PAGES --> LAND[Landing Page]
    PAGES --> LOGIN[Login Page]
    PAGES --> DASH[Dashboard]
    PAGES --> JOBS[Jobs Page]
    PAGES --> ASSESS[Assessment Page]
    PAGES --> ADMIN[Admin Pages]
    
    ASSESS --> LOADER[ModelLoader]
    ASSESS --> CALIB[CalibrationScreen]
    ASSESS --> ENGINE[AssessmentEngine]
    ASSESS --> OCEAN[OceanQuestionnaire]
    ASSESS --> ANALYSIS[AnalysisScreen]
    ASSESS --> RESULTS[CombinedResults]
```

### Key Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `ModelLoader` | Load face-api models | Progress bar, async loading |
| `CalibrationScreen` | Verify face detection | Webcam preview, stability check |
| `AssessmentEngine` | Capture emotions | Video sync, 200ms capture |
| `OceanQuestionnaire` | Personality test | 25 questions, Likert scale |
| `AnalysisScreen` | Show ML processing | Animated steps, progress |

---

## 5. ML Pipeline Design

### Emotion Detection Pipeline

```mermaid
flowchart LR
    A[Video Frame] --> B[TinyFaceDetector]
    B --> C[FaceLandmark68Net]
    C --> D[FaceExpressionNet]
    D --> E{7 Emotions}
    E --> F[Timeline Array]
    F --> G[MARKOV Analysis]
    G --> H[EQ Score]
```

### Personality Scoring Pipeline

```mermaid
flowchart LR
    A[25 Answers] --> B[Factor Loading]
    B --> C[Reverse Scoring]
    C --> D[Z-Normalization]
    D --> E[Percentile Conversion]
    E --> F[5 OCEAN Scores]
    F --> G[Profile Classification]
```

### Job Matching Pipeline

```mermaid
flowchart LR
    A[OCEAN Scores] --> C[Matching Algorithm]
    B[Job Requirements] --> C
    C --> D[Weighted Scoring]
    D --> E[Match Percentage]
```

---

## 6. UI/UX Design

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Simplicity** | Clean layouts, minimal distractions |
| **Guidance** | Step-by-step assessment flow |
| **Feedback** | Real-time progress indicators |
| **Accessibility** | High contrast, keyboard navigation |

### Color Palette

```
Primary:    #00d4ff (Electric Blue)  - CTAs, highlights
Secondary:  #8338ec (Purple)         - Accents, admin
Warning:    #fb5607 (Orange)         - Alerts, pending
Success:    #4ade80 (Green)          - Completed, selected
Error:      #f87171 (Red)            - Errors, rejected
Background: #0f0f1a (Dark)           - Main background
```

### User Flow Design

```
┌─────────────────────────────────────────────────────────┐
│                    CANDIDATE FLOW                        │
└─────────────────────────────────────────────────────────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    ▼                      ▼                      ▼
┌────────┐          ┌────────────┐          ┌─────────┐
│Register│ ───────► │ Dashboard  │ ───────► │Browse   │
│/Login  │          │            │          │Jobs     │
└────────┘          └────────────┘          └────┬────┘
                                                 │
                                                 ▼
                                           ┌─────────┐
                                           │ Apply   │
                                           └────┬────┘
                                                │
                    ┌───────────────────────────┘
                    ▼
    ┌─────────────────────────────────────────────────┐
    │              ASSESSMENT FLOW                     │
    │  ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐         │
    │  │Load │──►│Calib│──►│Video│──►│OCEAN│──►Done  │
    │  │Model│   │Face │   │Test │   │Test │         │
    │  └─────┘   └─────┘   └─────┘   └─────┘         │
    └─────────────────────────────────────────────────┘
```

---

## 7. API Design

### RESTful Endpoints

```
Authentication:
  POST   /api/auth/login      → Login user
  POST   /api/auth/register   → Register candidate

Jobs:
  GET    /api/jobs            → List all jobs
  POST   /api/jobs            → Create job (admin)
  PATCH  /api/jobs            → Update job (admin)
  DELETE /api/jobs?id=xxx     → Delete job (admin)

Applications:
  GET    /api/applications    → Get applications
  POST   /api/applications    → Submit application
  PATCH  /api/applications    → Update status

Assessments:
  GET    /api/assessments     → Get assessment results
  POST   /api/responses       → Save assessment data
```

### API Response Format

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "storage": "supabase" | "local"
}
```

---

## 8. Security Design

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database

    U->>F: Enter credentials
    F->>A: POST /api/auth/login
    A->>D: Validate user
    D-->>A: User data
    A-->>F: JWT token + user
    F->>F: Store in localStorage
    F-->>U: Redirect to dashboard
```

### Security Measures

| Measure | Implementation |
|---------|----------------|
| Password Hashing | Simple hash (demo), bcrypt (production) |
| Role-based Access | Admin vs Candidate routes |
| Input Validation | Server-side validation |
| HTTPS | SSL/TLS in production |

---

## 9. Deployment Architecture

```mermaid
flowchart TB
    subgraph Internet
        USER[User Browser]
    end

    subgraph Server["Lab Server"]
        NGINX[Nginx Reverse Proxy<br/>SSL Termination]
        DOCKER[Docker Container<br/>Port 3005]
        APP[Next.js Application]
    end

    subgraph External
        SUPA[Supabase Cloud]
        GH[GitHub]
        DH[Docker Hub]
    end

    USER -->|HTTPS| NGINX
    NGINX -->|HTTP| DOCKER
    DOCKER --> APP
    APP <-->|API| SUPA
    GH -->|CI/CD| DH
    DH -->|Pull| DOCKER
```

### Deployment Configuration

| Component | Configuration |
|-----------|---------------|
| Container Port | 3005 |
| Base Path | /emotion-capture |
| Nginx | Reverse proxy to container |
| SSL | Let's Encrypt / Institution cert |
| Docker Image | siddjeph/emotion-capture |

---

## 10. Design Summary

### Key Design Decisions

1. **Client-side ML** - No server GPU needed, privacy-friendly
2. **Serverless API** - Next.js API routes, easy deployment
3. **Dual Storage** - Supabase + local fallback for reliability
4. **Docker** - Consistent deployment across environments
5. **Modular Components** - Reusable, testable UI components

### Technology Stack Summary

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND          │  BACKEND           │  DATA         │
├────────────────────┼────────────────────┼───────────────┤
│  Next.js 14        │  Next.js API       │  PostgreSQL   │
│  React 18          │  Node.js 18        │  Supabase     │
│  TypeScript        │  JWT Auth          │  JSON Files   │
│  Tailwind CSS      │  REST API          │               │
│  face-api.js       │                    │               │
│  TensorFlow.js     │                    │               │
└────────────────────┴────────────────────┴───────────────┘
```
