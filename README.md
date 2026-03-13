<<<<<<< HEAD
# 🧠 AI Emotional Intelligence Assessment Platform

An AI-powered hiring assistance platform that combines **facial emotion detection** and **OCEAN personality assessment** to help companies make better hiring decisions and candidates find their perfect job match.

![Platform Overview](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![face-api.js](https://img.shields.io/badge/face--api.js-AI-orange?style=flat-square)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Core Modules](#-core-modules)
- [User Flows](#-user-flows)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Future Enhancements](#-future-enhancements)

---

## 🎯 Overview

### The Problem

Traditional hiring processes often rely on subjective evaluations and can miss important aspects of a candidate's personality and emotional intelligence. Companies struggle to:

- Assess cultural fit objectively
- Evaluate emotional intelligence at scale
- Match candidates to roles based on personality traits
- Reduce unconscious bias in hiring

### Our Solution

This platform uses **AI-driven assessments** to provide objective insights into candidates' emotional responses and personality traits, helping both:

- **Companies**: Make data-driven hiring decisions based on emotional intelligence and personality fit
- **Candidates**: Find roles that match their personality profile and receive AI-powered job recommendations

---

## ✨ Key Features

### For Candidates

| Feature | Description |
|---------|-------------|
| 🎭 **Emotion Detection** | Real-time facial emotion analysis while watching stimulus videos |
| 🧠 **OCEAN Personality Test** | 25-question Big Five personality assessment |
| 📊 **Personal Dashboard** | View assessment results, application status, and personality profile |
| 💼 **AI Job Matching** | Get job recommendations based on your personality scores |
| 📝 **Application Tracking** | Track your applications through each hiring stage |

### For Admins/Companies

| Feature | Description |
|---------|-------------|
| 📋 **Job Management** | Create, edit, and delete job postings |
| 🎯 **Trait Requirements** | Define ideal OCEAN personality traits for each role |
| 👥 **Application Review** | Review candidate assessments and make hiring decisions |
| ✅ **Select/Reject** | Direct candidate selection without interview scheduling |
| 📈 **Analytics Dashboard** | View hiring metrics, match scores, and pipeline stats |

---

## 🛠 Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router for server-side rendering and API routes |
| **TypeScript** | Type-safe JavaScript for better developer experience and fewer bugs |
| **Tailwind CSS** | Utility-first CSS framework for rapid UI development |
| **Lucide React** | Beautiful, consistent icon library |

### AI & Machine Learning

| Technology | Purpose |
|------------|---------|
| **face-api.js** | Browser-based face detection and expression recognition using TensorFlow.js |
| **TinyFaceDetector** | Lightweight face detection model optimized for real-time performance |
| **FaceExpressionNet** | Neural network for classifying 7 emotions (happy, sad, angry, fearful, disgusted, surprised, neutral) |

### Backend & Data

| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Serverless API endpoints for data operations |
| **Supabase** | PostgreSQL database with authentication (optional) |
| **Local JSON Storage** | File-based storage for development/demo mode |
| **UUID** | Unique identifier generation for records |

### Media & Processing

| Technology | Purpose |
|------------|---------|
| **WebRTC/getUserMedia** | Browser webcam access for video capture |
| **Canvas API** | Real-time face detection overlay rendering |
| **HTML5 Video** | Stimulus video playback with timeline synchronization |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Next.js   │  │  face-api   │  │      Webcam Stream      │  │
│  │   App       │◄─┤   Models    │◄─┤   (getUserMedia API)    │  │
│  │   Router    │  │             │  │                         │  │
│  └──────┬──────┘  └─────────────┘  └─────────────────────────┘  │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    React Components                          │ │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌────────────────┐  │ │
│  │  │Calibra- │ │Assessment│ │   OCEAN   │ │   Combined     │  │ │
│  │  │tion     │ │ Engine   │ │Questionnai│ │   Results      │  │ │
│  │  │Screen   │ │          │ │re         │ │                │  │ │
│  │  └─────────┘ └──────────┘ └───────────┘ └────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVER (Next.js API)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐    │
│  │ /api/responses│  │  /api/jobs    │  │ /api/applications │    │
│  │               │  │               │  │                   │    │
│  │ POST: Save    │  │ GET: List     │  │ POST: Apply       │    │
│  │ GET: Fetch    │  │ POST: Create  │  │ PATCH: Update     │    │
│  │               │  │ PATCH: Update │  │ GET: List         │    │
│  │               │  │ DELETE: Remove│  │                   │    │
│  └───────┬───────┘  └───────┬───────┘  └─────────┬─────────┘    │
│          │                  │                    │               │
│          └──────────────────┴────────────────────┘               │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Storage Layer                             │ │
│  │  ┌─────────────────────┐  ┌──────────────────────────────┐  │ │
│  │  │   Supabase          │  │   Local JSON Storage         │  │ │
│  │  │   (PostgreSQL)      │  │   (Development Mode)         │  │ │
│  │  │                     │  │   /data/responses.json       │  │ │
│  │  │   - Production DB   │  │   /data/applications.json    │  │ │
│  │  │   - Auth            │  │   /data/jobs.json            │  │ │
│  │  └─────────────────────┘  └──────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern browser with webcam support (Chrome, Firefox, Edge)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd emotion_capture

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables (Optional)

For Supabase integration, create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note**: The app works without Supabase using local JSON file storage for development.

### Access the Application

- **Candidate Portal**: http://localhost:3000/login
- **Admin Portal**: http://localhost:3000/admin/login

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Candidate | Any email | Any password (auto-registers) |
| Admin | admin@emotionai.com | admin123 |

---

## 📁 Project Structure

```
emotion_capture/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Landing page
│   │   ├── layout.tsx                # Root layout with AuthProvider
│   │   ├── globals.css               # Global styles + Tailwind
│   │   │
│   │   ├── login/                    # Candidate authentication
│   │   │   └── page.tsx
│   │   │
│   │   ├── assessment/               # Main assessment flow
│   │   │   └── page.tsx              # Orchestrates all assessment screens
│   │   │
│   │   ├── dashboard/                # Candidate dashboard
│   │   │   └── page.tsx
│   │   │
│   │   ├── jobs/                     # Job listings for candidates
│   │   │   └── page.tsx
│   │   │
│   │   ├── admin/                    # Admin portal
│   │   │   ├── login/page.tsx        # Admin authentication
│   │   │   ├── dashboard/page.tsx    # Admin overview
│   │   │   ├── jobs/page.tsx         # Job management
│   │   │   └── applications/page.tsx # Application review
│   │   │
│   │   └── api/                      # API Routes
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   └── register/route.ts
│   │       ├── responses/route.ts    # Assessment results
│   │       ├── jobs/route.ts         # Job CRUD
│   │       └── applications/route.ts # Application management
│   │
│   ├── components/                   # React Components
│   │   ├── LandingScreen.tsx         # Video selection
│   │   ├── ModelLoader.tsx           # AI model loading
│   │   ├── CalibrationScreen.tsx     # Webcam setup & face detection
│   │   ├── AssessmentEngine.tsx      # Emotion capture during video
│   │   ├── OceanQuestionnaire.tsx    # Personality assessment
│   │   └── CombinedResults.tsx       # Final results display
│   │
│   └── lib/                          # Utilities & Types
│       ├── auth/
│       │   ├── context.tsx           # Auth React Context
│       │   ├── store.ts              # User storage
│       │   └── types.ts              # User types
│       │
│       ├── face-api/
│       │   ├── loader.ts             # Model loading logic
│       │   └── detector.ts           # Face detection utilities
│       │
│       ├── ocean/
│       │   └── types.ts              # OCEAN questions & scoring
│       │
│       ├── jobs/
│       │   ├── types.ts              # Job & Application types
│       │   ├── data.ts               # Sample job data
│       │   └── storage.ts            # Job/Application storage
│       │
│       ├── storage/
│       │   └── local.ts              # Local file storage
│       │
│       └── supabase/
│           ├── client.ts             # Supabase client
│           ├── types.ts              # Database types
│           └── schema.sql            # Database schema
│
├── public/
│   └── models/                       # face-api.js model files
│       ├── tiny_face_detector_model-*
│       └── face_expression_model-*
│
├── data/                             # Local JSON storage (gitignored)
│   ├── responses.json
│   ├── applications.json
│   ├── jobs.json
│   └── users.json
│
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🔧 Core Modules

### 1. Model Loader (`ModelLoader.tsx`)

Loads the face-api.js neural network models required for face detection and expression recognition.

```typescript
// Models loaded:
- TinyFaceDetectorModel  // Fast face detection
- FaceExpressionModel    // Emotion classification
```

**Why TinyFaceDetector?** It's optimized for real-time browser performance, detecting faces in ~20-30ms compared to ~200ms for SSD MobileNet.

### 2. Calibration Screen (`CalibrationScreen.tsx`)

Face calibration ensuring:
- Webcam permissions granted
- Camera stream active
- Face successfully detected
- 10 consecutive face detections required to proceed

**Why 10 detections?** Ensures stable face detection before assessment begins, reducing false starts.

### 3. Assessment Engine (`AssessmentEngine.tsx`)

The core emotion capture module:

```typescript
// Capture loop (every 200ms):
setInterval(() => {
  const emotions = await detectFace(webcamRef.current)
  const dataPoint = {
    time: videoRef.current.currentTime,
    emotion: getDominantEmotion(emotions),
    confidence: getConfidence(emotions),
    expressions: emotions // All 7 emotion scores
  }
  timeline.push(dataPoint)
}, 200)
```

**Why 200ms interval?** Balances data granularity with performance. 5 samples/second captures emotional transitions without overwhelming the browser.

### 4. OCEAN Questionnaire (`OceanQuestionnaire.tsx`)

25-question Big Five personality assessment:

| Trait | Description | Questions |
|-------|-------------|-----------|
| **O**penness | Creativity, curiosity | 5 |
| **C**onscientiousness | Organization, dependability | 5 |
| **E**xtraversion | Sociability, assertiveness | 5 |
| **A**greeableness | Cooperation, trust | 5 |
| **N**euroticism | Emotional instability | 5 |

**Scoring**: 5-point Likert scale (Strongly Disagree to Strongly Agree), reverse-coded where needed, normalized to 0-100%.

### 5. Job Matching Algorithm

```typescript
function calculateJobMatch(job: Job, userScores: OceanScores): number {
  let totalWeight = 0
  let weightedScore = 0

  for (const requirement of job.idealTraits) {
    const userScore = userScores[requirement.trait]
    const matchRatio = Math.min(userScore / requirement.minScore, 1.2)
    weightedScore += matchRatio * requirement.weight * 100
    totalWeight += requirement.weight
  }

  return Math.round(weightedScore / totalWeight)
}
```

---

## 👤 User Flows

### Candidate Flow

```
Login/Register
      │
      ▼
  Dashboard ──────────────────────────────────┐
      │                                       │
      ▼                                       ▼
  Jobs Page                            Assessment
      │                                       │
      ▼                                       │
  Apply to Job ──────────────────────────────┘
      │                                       │
      ▼                                       │
  Take Assessment ◄───────────────────────────┘
      │
      ├─► Round 1: Emotion Detection
      │   • Watch stimulus video
      │   • Webcam captures emotions
      │   • ~30-60 seconds
      │
      └─► Round 2: OCEAN Personality
          • 25 questions
          • 5-point scale
          • ~5-10 minutes
      │
      ▼
  View Combined Results
      │
      ▼
  Dashboard (Application Updated)
```

### Admin Flow

```
Admin Login
      │
      ▼
  Dashboard
      │
      ├─► View Stats (Jobs, Applications, Selections)
      │
      ├─► Manage Jobs
      │   • Create new job
      │   • Set OCEAN requirements
      │   • Edit/Delete jobs
      │
      └─► Review Applications
          │
          ├─► View Candidate Details
          │   • Emotion analysis
          │   • OCEAN profile
          │   • Match score
          │
          └─► Make Decision
              • ✅ Select Candidate
              • ❌ Reject Candidate
```

---

## 📡 API Reference

### Assessment Responses

```http
POST /api/responses
Content-Type: application/json

{
  "videoId": "nature-scene",
  "timeline": [
    { "time": 0.2, "emotion": "neutral", "confidence": 0.85, "expressions": {...} }
  ],
  "summary": {
    "dominantEmotion": "happy",
    "averageConfidence": 0.82,
    "duration": 30.5,
    "oceanScores": {
      "openness": 75,
      "conscientiousness": 68,
      "extraversion": 55,
      "agreeableness": 80,
      "neuroticism": 35
    }
  },
  "userId": "user-123",
  "jobApplicationId": "app-456"
}
```

### Jobs

```http
GET /api/jobs                        # List all jobs
GET /api/jobs?withStats=true         # Include application stats
GET /api/jobs?withScores={...}       # Get with match scores
POST /api/jobs                       # Create job (admin)
PATCH /api/jobs                      # Update job (admin)
DELETE /api/jobs?id=job-123          # Delete job (admin)
```

### Applications

```http
GET /api/applications?userId=...     # User's applications
GET /api/applications?admin=true     # All applications (admin)
POST /api/applications               # Apply to job
PATCH /api/applications              # Update status
```

---

## 💾 Database Schema

### candidate_responses

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Reference to user |
| video_id | VARCHAR | Video identifier |
| raw_timeline | JSONB | Array of emotion data points |
| summary | JSONB | Aggregated results + OCEAN scores |
| created_at | TIMESTAMP | Assessment timestamp |

### jobs

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR | Primary key |
| title | VARCHAR | Job title |
| company | VARCHAR | Company name |
| description | TEXT | Job description |
| ideal_traits | JSONB | OCEAN requirements |
| posted_at | TIMESTAMP | Post date |

### applications

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| job_id | VARCHAR | Reference to job |
| user_id | UUID | Reference to user |
| status | ENUM | Application status |
| match_score | INT | Calculated match % |
| assessment_id | UUID | Link to assessment |

---

## 🎨 UI/UX Design

### Design System

- **Color Palette**: Dark theme with electric blue (#3b82f6), calm teal (#06b6d4), warm amber (#f59e0b), pulse red (#ef4444)
- **Typography**: System font stack with geometric sans-serif headings
- **Components**: Glass morphism cards, gradient CTAs, subtle animations
- **Responsive**: Mobile-first design with breakpoints at sm/md/lg/xl

### Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- High contrast text
- Focus indicators

---

## 🔮 Future Enhancements

| Feature | Priority | Description |
|---------|----------|-------------|
| Video Library | High | More stimulus videos for different emotions |
| Team Collaboration | High | Multiple admins per company |
| Interview Scheduling | Medium | Optional interview step |
| Email Notifications | Medium | Status updates for candidates |
| Analytics Dashboard | Medium | Detailed hiring funnel analytics |
| Multi-language | Low | i18n support |
| Mobile App | Low | Native iOS/Android apps |
| Video Interviews | Low | Live emotion analysis during video calls |

---

## 📄 License

This project is part of an Information Systems academic project.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

For questions or issues, please open a GitHub issue or contact the project maintainers.

---

<p align="center">
  Built with ❤️ using Next.js, TypeScript, and AI
</p>
=======
# AI Powered Hiring Platform

A web-based hiring assistance tool that uses facial emotion detection and OCEAN personality assessment to match candidates with jobs.

## What it does

- Captures emotional reactions while candidates watch a stimulus video
- Runs a 25-question Big Five personality test (OCEAN)
- Calculates job match scores based on personality traits
- Provides admin dashboard for reviewing candidates

## Tech Stack

- Next.js 15 (React)
- TypeScript
- Tailwind CSS
- face-api.js for emotion detection
- Local JSON storage (Supabase optional)

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Login

**Candidates**: Go to `/login` - register with any email/password

**Admin**: Go to `/admin/login`
- Email: admin@emotionai.com
- Password: admin123

## Project Structure

```
src/
├── app/                 # Pages and API routes
│   ├── assessment/      # Assessment flow
│   ├── dashboard/       # Candidate dashboard
│   ├── jobs/            # Job listings
│   └── admin/           # Admin portal
├── components/          # React components
└── lib/                 # Utilities
    ├── face-api/        # Face detection
    ├── ml/              # Scoring models
    ├── ocean/           # Personality questions
    └── jobs/            # Job matching
```

## How Assessment Works

1. **Face Calibration** - Verify webcam and face detection
2. **Round 1** - Watch video while emotions are captured (every 200ms)
3. **Round 2** - Answer 25 personality questions
4. **Analysis** - ML models score the responses
5. **Done** - Results visible to admin only

## Scoring

The scoring uses two models:
- `emotion-model.ts` - Analyzes emotional patterns, stability, transitions
- `personality-model.ts` - Calculates OCEAN percentiles with confidence intervals

Job matching compares candidate OCEAN scores against job requirements.

## Environment Variables (Optional)

For Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

Without Supabase, data is stored in `data/*.json` files.

## Notes

- Requires webcam access
- Works best in Chrome/Firefox
- face-api models are in `public/models/`

---

Information Systems Project
>>>>>>> e82f9f15c478eff18ab898bb2c570e9407ecfed7
