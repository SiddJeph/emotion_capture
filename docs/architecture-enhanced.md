# Enhanced System Architecture

## Detailed Architecture Diagram

```mermaid
flowchart TB
    subgraph Client["🖥️ Client Layer (Browser)"]
        direction TB
        CAM["📷 Webcam Stream<br/><small>getUserMedia API</small>"]
        FACE["🧠 face-api.js<br/><small>TensorFlow.js Runtime</small><br/><small>• TinyFaceDetector</small><br/><small>• FaceExpressionNet</small><br/><small>• FaceLandmark68Net</small>"]
        UI["⚛️ Next.js 14 Frontend<br/><small>React 18 + TypeScript</small><br/><small>Tailwind CSS</small>"]
        
        CAM -->|"Video Frames<br/>30 FPS"| FACE
        FACE -->|"Emotion Data<br/>Every 200ms"| UI
    end

    subgraph Server["⚙️ Server Layer (Next.js API Routes)"]
        direction TB
        API["🔌 REST API<br/><small>/api/responses</small><br/><small>/api/jobs</small><br/><small>/api/applications</small><br/><small>/api/assessments</small>"]
        AUTH["🔐 Authentication<br/><small>JWT Tokens</small><br/><small>Role-based Access</small>"]
        ML["📊 ML Scoring Engine<br/><small>• EMOTION-MARKOV-v1.3</small><br/><small>• OCEAN-IRT-v2.1</small><br/><small>• Job Matching Algorithm</small>"]
    end

    subgraph Data["💾 Data Layer"]
        direction LR
        SUPA[("🐘 Supabase<br/>PostgreSQL<br/><small>Production DB</small>")]
        LOCAL[("📁 Local JSON<br/>File Storage<br/><small>Development</small>")]
    end

    UI <-->|"HTTPS<br/>JSON"| API
    API <--> AUTH
    API <-->|"Score<br/>Calculation"| ML
    API <-->|"CRUD<br/>Operations"| SUPA
    API <-->|"Fallback"| LOCAL

    style Client fill:#e8f4f8,stroke:#0ea5e9,stroke-width:2px
    style Server fill:#fef3c7,stroke:#f59e0b,stroke-width:2px
    style Data fill:#d1fae5,stroke:#10b981,stroke-width:2px
```

## What to Add to Your Slide:

### 1. Add Technology Labels (Versions)
- Next.js **14** + React **18**
- TensorFlow.js **4.x**
- PostgreSQL **15**
- Node.js **18**

### 2. Add Data Flow Annotations
Show what data flows between components:
- Webcam → face-api: **Video frames (30 FPS)**
- face-api → Frontend: **Emotion JSON (every 200ms)**
- Frontend → API: **Assessment payload**
- API → ML: **Raw data for scoring**
- ML → API: **Calculated scores**

### 3. Add Component Counts/Stats
- **7** emotions detected
- **25** personality questions
- **5** OCEAN traits
- **6** API endpoints

### 4. Add Key Features per Layer

**Client Layer:**
- Real-time face detection
- Emotion classification
- Responsive UI

**Server Layer:**
- RESTful API design
- JWT authentication
- ML model inference

**Data Layer:**
- Persistent storage
- Query optimization
- Fallback support

---

## Alternative: Horizontal Layout

```mermaid
flowchart LR
    subgraph Input["📥 Input"]
        CAM[Webcam]
        FORM[Forms]
    end

    subgraph Processing["⚙️ Processing"]
        FACE[face-api.js<br/>Emotion Detection]
        OCEAN[OCEAN<br/>Questionnaire]
        ML[ML Engine<br/>Scoring]
    end

    subgraph Output["📤 Output"]
        DASH[Dashboard]
        ADMIN[Admin Panel]
        DB[(Database)]
    end

    CAM --> FACE
    FORM --> OCEAN
    FACE --> ML
    OCEAN --> ML
    ML --> DASH
    ML --> ADMIN
    ML --> DB

    style Input fill:#dbeafe,stroke:#3b82f6
    style Processing fill:#fef9c3,stroke:#eab308
    style Output fill:#dcfce7,stroke:#22c55e
```

---

## Suggested Slide Layout:

```
┌─────────────────────────────────────────────────────────────┐
│  SYSTEM ARCHITECTURE                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                [DIAGRAM HERE]                        │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ CLIENT       │ │ SERVER       │ │ DATABASE     │        │
│  │ • Next.js 14 │ │ • API Routes │ │ • PostgreSQL │        │
│  │ • React 18   │ │ • JWT Auth   │ │ • Supabase   │        │
│  │ • face-api   │ │ • ML Engine  │ │ • JSON Files │        │
│  │ • TailwindCSS│ │ • TypeScript │ │              │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
│  Key: 7 Emotions | 25 Questions | 5 Traits | <2s Analysis  │
└─────────────────────────────────────────────────────────────┘
```

---

## Simple Version for Slides (Copy This)

```mermaid
flowchart TB
    subgraph Client["Client (Browser)"]
        CAM[Webcam Stream]
        FACE["face-api.js + TensorFlow.js<br/>7 Emotion Detection"]
        UI["Next.js 14 + React 18<br/>Tailwind CSS"]
    end

    subgraph Server["Server (Next.js API)"]
        API[REST API Endpoints]
        AUTH[JWT Authentication]
        ML["ML Scoring Engine<br/>EQ + OCEAN + Job Match"]
    end

    subgraph Data["Data Layer"]
        DB[("PostgreSQL<br/>(Supabase)")]
        JSON[("JSON Files<br/>(Fallback)")]
    end

    CAM --> FACE --> UI
    UI <--> API
    API <--> AUTH
    API <--> ML
    API <--> DB
    API <--> JSON
```

## Add These Bullet Points Below Diagram:

**Technologies:**
- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS
- AI/ML: face-api.js, TensorFlow.js (browser-based)
- Backend: Next.js API Routes, JWT Authentication
- Database: Supabase (PostgreSQL), Local JSON fallback
- Deployment: Docker, Nginx, Port 3005
