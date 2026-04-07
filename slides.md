---
marp: true
theme: default
paginate: true
backgroundColor: #1a1a2e
color: #ffffff
style: |
  section {
    font-family: 'Segoe UI', sans-serif;
  }
  h1 {
    color: #00d4ff;
  }
  h2 {
    color: #8338ec;
  }
  table {
    font-size: 0.8em;
  }
  code {
    background: #2d2d44;
  }
  a {
    color: #00d4ff;
  }
---

<!-- _class: lead -->
<!-- _backgroundColor: #0f0f1a -->

# Emotion Capture
## AI-Powered Hiring Assessment Platform

**Information Systems Project**

**Group Members:** [Your Names]
**TA:** [TA Name]

March 2026

---

# Problem Description

## The Challenge in Modern Hiring

- **Subjective Evaluations** - Resume screening is inconsistent
- **Limited Insight** - Interviews miss authentic emotional responses  
- **Manipulation** - Candidates game personality tests
- **No EQ Measurement** - Emotional intelligence is ignored
- **Bias** - Cultural fit assessment is subjective

### Statistics
- 75% of employers have hired the wrong person
- 89% of hiring failures are due to personality, not skills
- Interviews predict only 14% of job performance

---

# Our Solution

## Dual-Assessment AI System

### Round 1: Emotion Detection
- Webcam captures facial expressions during video
- Detects 7 emotions in real-time
- 5 captures per second (200ms intervals)

### Round 2: OCEAN Personality Assessment  
- 25 scientifically-validated questions
- Big Five traits measurement
- Percentile scoring with confidence intervals

### AI Job Matching
- Matches profiles to job requirements
- Calculates compatibility scores

---

# Key Features

## For Candidates

| Feature | Description |
|---------|-------------|
| Dashboard | Track applications and status |
| AI Matching | Personalized job recommendations |
| Profile | View OCEAN trait scores |

## For Administrators

| Feature | Description |
|---------|-------------|
| Job Management | Create jobs with trait requirements |
| Candidate Review | Detailed assessment results |
| Analytics | Emotion patterns and stability |
| Selection | Data-driven hiring decisions |

---

# System Architecture

```
┌────────────────────────────────────────────┐
│              CLIENT (Browser)               │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Next.js │  │face-api.js│  │  Webcam  │  │
│  │ React   │◄─│TensorFlow │◄─│  Stream  │  │
│  └────┬────┘  └──────────┘  └──────────┘  │
└───────┼────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────┐
│           SERVER (Next.js API)              │
│  /api/responses  /api/jobs  /api/auth      │
└───────┬────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────┐
│              DATA LAYER                     │
│  Supabase (PostgreSQL) / Local JSON        │
└────────────────────────────────────────────┘
```

---

# ML Model: Emotion Analysis

## EMOTION-MARKOV-v1.3

**Processing Pipeline:**

1. **Confidence Filtering** - Remove detections < 30%
2. **Distribution Analysis** - Emotion frequency
3. **Markov Transitions** - State change patterns
4. **Stability Score** - Emotional consistency
5. **Entropy Calculation** - Emotional range

**Output Metrics:**

| Metric | Description |
|--------|-------------|
| EQ Score | Emotional intelligence (0-100) |
| Stability | Consistency of state |
| Range | Diversity of emotions |
| Transitions | How emotions change |

---

# ML Model: Personality Scoring

## OCEAN-IRT-v2.1

**Big Five Traits:**
- **O**penness - Creativity, curiosity
- **C**onscientiousness - Organization, discipline
- **E**xtraversion - Sociability, energy
- **A**greeableness - Cooperation, trust
- **N**euroticism - Emotional sensitivity

**Scoring Formula:**
```
Percentile = 50 × (1 + erf((rawScore - μ) / (σ × √2)))
```

**Output:** 5 trait percentiles + confidence intervals

---

# Job Matching Algorithm

## Compatibility Score

```
MatchScore = Σ(weight × min(userScore/required, 1.2)) / Σ(weight) × 100
```

**Example Calculation:**

| Trait | Required | Weight | User | Score |
|-------|----------|--------|------|-------|
| Openness | 70% | 0.3 | 75% | 32% |
| Conscientiousness | 80% | 0.4 | 68% | 34% |
| Extraversion | 60% | 0.3 | 62% | 31% |
| **Total** | | **1.0** | | **97%** |

**90-100%** = Excellent | **70-89%** = Good | **<70%** = Moderate

---

# Implementation Details

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| AI/ML | face-api.js (TensorFlow.js) |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Auth | Custom JWT-based |
| Deployment | Docker, Nginx |

## Face Detection Models
- **TinyFaceDetector** - ~20ms detection
- **FaceLandmark68Net** - 68 facial points
- **FaceExpressionNet** - 7-emotion classifier

---

# Installation & Deployment

## Local Development
```bash
git clone https://github.com/SiddJeph/emotion_capture.git
cd emotion_capture
npm install
npm run dev
```

## Docker Deployment
```bash
docker build -t emotion-capture:latest .
docker run -d -p 3005:3005 emotion-capture:latest
```

## Production
- **URL:** https://ecolab.iitkgp.ac.in/emotion-capture
- **Docker Hub:** siddjeph/emotion-capture

---

# AI Tools Usage

## How AI Accelerated Development

| Tool | Usage |
|------|-------|
| **Claude (Cursor AI)** | Code generation, architecture, debugging |
| **face-api.js** | Pre-trained emotion models |
| **TensorFlow.js** | Browser ML inference |

### AI Contributions:
- Generated React components & ML algorithms
- Designed system architecture
- Fixed TypeScript errors & deployment issues
- Created documentation & presentation

**Estimated time saved:** 60-70%

---

# Data Collection

## Emotion Data
```json
{
  "time": 1.2,
  "emotion": "happy",
  "confidence": 0.88,
  "allEmotions": {
    "happy": 0.88,
    "neutral": 0.10,
    "surprised": 0.02
  }
}
```
- **Source:** Real-time webcam capture
- **Frequency:** 5 samples/second

## Personality Data
- 25 IPIP-NEO validated questions
- Likert scale (1-5) responses

---

# Demo: User Flow

## Candidate Journey

```
Register → Browse Jobs → Apply → Assessment
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              Round 1:         Round 2:        Analysis
           Emotion Video    25 Questions     ML Processing
                    │               │               │
                    └───────────────┴───────────────┘
                                    │
                                    ▼
                            Dashboard: Track Status
```

## Admin Journey

```
Login → Create Jobs → Review Applications → Select/Reject
```

---

# Demo Screenshots

## Landing Page
![bg right:40% 80%](https://via.placeholder.com/400x300?text=Landing+Page)

- Clean, modern interface
- Clear call-to-action
- Feature highlights

## Assessment Flow
- Face calibration
- Video player
- Personality questions
- ML analysis animation

*(Add actual screenshots)*

---

# Results & Impact

## Platform Metrics

| Metric | Value |
|--------|-------|
| Emotions Detected | 7 |
| Capture Rate | 5/second |
| OCEAN Traits | 5 |
| Processing Time | < 2 seconds |

## Potential Impact

- **Reduced Bias** - Objective data-driven decisions
- **Better Matches** - AI compatibility scoring
- **Time Savings** - Automated screening
- **Scalable** - Assess thousands of candidates

---

# Future Enhancements

| Feature | Priority |
|---------|----------|
| Video Library | High |
| Live Interview Analysis | High |
| Team Analytics | Medium |
| Mobile App | Medium |
| HR System Integration | Medium |
| Multi-language Support | Low |

---

<!-- _class: lead -->
<!-- _backgroundColor: #0f0f1a -->

# Conclusion

## Key Achievements

- Real-time emotion detection in browser
- Scientifically-validated personality scoring  
- AI-powered job matching algorithm
- Production-ready Docker deployment

### Links

- **GitHub:** github.com/SiddJeph/emotion_capture
- **Docker:** siddjeph/emotion-capture
- **Live:** ecolab.iitkgp.ac.in/emotion-capture

---

<!-- _class: lead -->
<!-- _backgroundColor: #8338ec -->

# Thank You!

## Questions?

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Candidate | any email | any password |
| Admin | admin@emotionai.com | admin123 |
