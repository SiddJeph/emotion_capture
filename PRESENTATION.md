# Emotion Capture - AI Hiring Assessment Platform
## Presentation Slides Content

---

## Slide 1: Title Slide

**Project Title:** Emotion Capture - AI-Powered Hiring Assessment Platform

**Course:** Information Systems Project

**Group Members:**
- [Your Name]
- [Team Member 2]
- [Team Member 3]

**TA:** [TA Name]

**Date:** March 2026

---

## Slide 2: Problem Description

### The Challenge in Modern Hiring

**Current Problems:**
- Traditional hiring relies heavily on subjective resume screening
- Interviews fail to capture authentic emotional responses
- Personality assessments are often manipulated by candidates
- No objective way to measure emotional intelligence (EQ)
- Cultural fit assessment is inconsistent and biased
- High cost of bad hires (estimated 30% of first-year salary)

**Statistics:**
- 75% of employers say they've hired the wrong person
- 89% of hiring failures are due to attitude/personality, not skills
- Average interview only predicts 14% of job performance

---

## Slide 3: Our Solution

### Emotion Capture Platform

**A dual-assessment AI system that combines:**

1. **Real-time Emotion Detection (Round 1)**
   - Webcam captures facial expressions while watching stimulus video
   - Detects 7 emotions: Happy, Sad, Angry, Fearful, Disgusted, Surprised, Neutral
   - 5 captures per second (200ms intervals)
   - Calculates emotional stability, range, and authenticity

2. **OCEAN Personality Assessment (Round 2)**
   - 25 scientifically-validated questions
   - Measures Big Five traits: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
   - Percentile scoring with confidence intervals

3. **AI-Powered Job Matching**
   - Matches candidate profiles to job requirements
   - Calculates compatibility scores
   - Recommends best-fit positions

---

## Slide 4: Key Features

### For Candidates
| Feature | Description |
|---------|-------------|
| Dashboard | Track applications and assessment status |
| AI Job Matching | Get personalized job recommendations |
| Personality Profile | View your OCEAN trait scores |
| Application Tracking | Monitor progress through hiring stages |

### For Administrators/HR
| Feature | Description |
|---------|-------------|
| Job Management | Create jobs with ideal trait requirements |
| Candidate Review | View detailed assessment results |
| Emotion Analytics | Analyze emotional patterns and stability |
| Selection Tools | Select or reject candidates with data |

---

## Slide 5: System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│   │   Next.js    │    │  face-api.js │    │   Webcam     │  │
│   │   Frontend   │◄───│  (TensorFlow)│◄───│   Stream     │  │
│   └──────┬───────┘    └──────────────┘    └──────────────┘  │
│          │                                                   │
│          ▼                                                   │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              React Components                        │   │
│   │  • CalibrationScreen  • AssessmentEngine            │   │
│   │  • OceanQuestionnaire • AnalysisScreen              │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Next.js API)                      │
├─────────────────────────────────────────────────────────────┤
│   /api/responses    /api/jobs    /api/applications          │
│   /api/auth         /api/assessments                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│   ┌─────────────────┐    ┌─────────────────────────────┐    │
│   │    Supabase     │    │   Local JSON Storage        │    │
│   │   (PostgreSQL)  │    │   (Development/Fallback)    │    │
│   └─────────────────┘    └─────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Slide 6: ML Models - Emotion Analysis

### EMOTION-MARKOV-v1.3 Model

**Input:** Timeline of emotion data points (captured every 200ms)

**Processing Steps:**
1. **Confidence Filtering** - Remove low-confidence detections (<30%)
2. **Distribution Analysis** - Calculate emotion frequency distribution
3. **Markov Transitions** - Analyze emotion state changes
4. **Stability Score** - Measure emotional consistency
5. **Entropy Calculation** - Shannon entropy for emotional range
6. **Valence-Arousal Mapping** - Map to psychological dimensions

**Output Metrics:**
| Metric | Description |
|--------|-------------|
| EQ Score | Composite emotional intelligence (0-100) |
| Stability | Consistency of emotional state |
| Range | Diversity of emotions expressed |
| Dominant Emotion | Most frequent emotion |
| Transition Patterns | How emotions change over time |

---

## Slide 7: ML Models - Personality Scoring

### OCEAN-IRT-v2.1 Model

**Input:** 25 Likert-scale responses (1-5)

**Processing Steps:**
1. **Factor Loading** - Weight responses by trait
2. **Reverse Scoring** - Handle negatively-keyed items
3. **Z-Score Normalization** - Standardize against population norms
4. **Percentile Conversion** - Using error function (erf)
5. **Confidence Intervals** - Estimate measurement uncertainty
6. **Cronbach's Alpha** - Check internal consistency

**Mathematical Formula:**
```
Percentile = 50 × (1 + erf((rawScore - μ) / (σ × √2)))
```

**Output:**
- 5 trait percentiles (0-100)
- Confidence intervals
- Dominant trait classification
- Profile type (e.g., "Creative Leader", "Analytical Thinker")

---

## Slide 8: Job Matching Algorithm

### Compatibility Score Calculation

**Formula:**
```
MatchScore = Σ(weight_i × min(userScore_i / requiredScore_i, 1.2)) / Σ(weight_i) × 100
```

**Example:**
| Trait | Required | Weight | User Score | Contribution |
|-------|----------|--------|------------|--------------|
| Openness | 70% | 0.3 | 75% | 32.1% |
| Conscientiousness | 80% | 0.4 | 68% | 34% |
| Extraversion | 60% | 0.3 | 62% | 31% |
| **Total** | | **1.0** | | **97.1%** |

**Interpretation:**
- 90-100%: Excellent match
- 70-89%: Good match
- 50-69%: Moderate match
- <50%: Poor match

---

## Slide 9: Implementation Details

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14, React 18 | Server-side rendering, routing |
| Styling | Tailwind CSS | Utility-first CSS framework |
| Icons | Lucide React | Consistent iconography |
| AI/ML | face-api.js (TensorFlow.js) | Browser-based face detection |
| Backend | Next.js API Routes | Serverless API endpoints |
| Database | Supabase (PostgreSQL) | Production data storage |
| Auth | Custom JWT-based | User authentication |
| Deployment | Docker, Nginx | Containerized deployment |

### Face Detection Models
- **TinyFaceDetector** - Lightweight, ~20ms detection
- **FaceLandmark68Net** - 68-point facial landmarks
- **FaceExpressionNet** - 7-emotion classification

---

## Slide 10: Installation & Deployment

### Local Development
```bash
git clone https://github.com/SiddJeph/emotion_capture.git
cd emotion_capture
npm install
npm run dev
# Open http://localhost:3000
```

### Docker Deployment
```bash
# Build image
docker build -t emotion-capture:latest .

# Run container
docker run -d -p 3005:3005 emotion-capture:latest

# Push to Docker Hub
docker push siddjeph/emotion-capture:latest
```

### Production (Nginx + Docker)
- Deployed at: https://ecolab.iitkgp.ac.in/emotion-capture
- Base path configured for subdirectory hosting
- SSL/TLS encryption enabled

---

## Slide 11: AI Tools Usage

### Development Assistance

| Tool | Usage |
|------|-------|
| **Claude (Cursor AI)** | Code generation, architecture design, debugging |
| **face-api.js** | Pre-trained emotion detection models |
| **TensorFlow.js** | Browser-based ML inference |

### How AI Accelerated Development

1. **Code Generation**
   - Generated React components for assessment flow
   - Created ML scoring algorithms
   - Built API routes and data models

2. **Architecture Design**
   - Designed multi-round assessment flow
   - Created job matching algorithm
   - Structured database schema

3. **Debugging & Optimization**
   - Fixed TypeScript type errors
   - Optimized Docker configuration
   - Resolved deployment issues

4. **Documentation**
   - Generated README and technical docs
   - Created this presentation outline

---

## Slide 12: Data Collection & Generation

### Emotion Data
- **Source:** Real-time webcam capture during assessment
- **Format:** JSON timeline with timestamps
- **Frequency:** 5 samples per second (200ms intervals)
- **Storage:** PostgreSQL (Supabase) or local JSON files

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

### Personality Data
- **Source:** 25-question IPIP-NEO based questionnaire
- **Validation:** Scientifically validated Big Five inventory
- **Scoring:** Likert scale (1-5) normalized to percentiles

### Job Data
- **Sample Jobs:** 6 pre-configured job listings
- **Traits:** Each job has ideal OCEAN trait requirements
- **Weights:** Configurable importance per trait

---

## Slide 13: Demo - User Flow

### Candidate Journey

1. **Register/Login** → Create account or sign in
2. **Browse Jobs** → View all jobs with match scores
3. **Apply** → Submit application for desired position
4. **Assessment Round 1** → Watch video, emotions captured
5. **Assessment Round 2** → Answer 25 personality questions
6. **Analysis** → ML models process data (animated visualization)
7. **Complete** → Results sent to admin for review
8. **Dashboard** → Track application status

### Admin Journey

1. **Login** → Access admin portal
2. **Create Jobs** → Define positions with trait requirements
3. **Review Applications** → See all candidates
4. **View Assessment** → Detailed emotion + personality data
5. **Decision** → Select or reject candidates

---

## Slide 14: Demo Screenshots

### Landing Page
- Clean, modern interface
- Clear call-to-action buttons
- Feature highlights

### Assessment Flow
- Face calibration screen
- Video player with hidden emotion capture
- Animated question progression
- ML analysis visualization

### Admin Dashboard
- Statistics overview
- Job management
- Candidate review with detailed scores
- Selection/rejection actions

### (Include actual screenshots here)

---

## Slide 15: Results & Impact

### Platform Capabilities

| Metric | Value |
|--------|-------|
| Emotions Detected | 7 |
| Capture Rate | 5/second |
| Questions | 25 |
| OCEAN Traits | 5 |
| Processing Time | <2 seconds |

### Potential Impact

- **Reduced Bias:** Objective emotion and personality data
- **Better Matches:** AI-powered job compatibility scoring
- **Time Savings:** Automated initial screening
- **Data-Driven:** Decisions backed by quantitative metrics
- **Scalable:** Can assess thousands of candidates

---

## Slide 16: Future Enhancements

| Feature | Priority | Description |
|---------|----------|-------------|
| Video Library | High | Multiple stimulus videos for different roles |
| Interview Module | High | Live emotion tracking during video interviews |
| Team Analytics | Medium | Analyze team composition and dynamics |
| Mobile App | Medium | Native iOS/Android applications |
| API Integration | Medium | Connect with existing HR systems |
| Multi-language | Low | Support for non-English assessments |

---

## Slide 17: Conclusion

### Summary

- Built an AI-powered hiring assessment platform
- Combines emotion detection with personality assessment
- Provides objective, data-driven hiring insights
- Deployed using modern containerized architecture

### Key Achievements

- Real-time facial emotion detection in browser
- Scientifically-validated personality scoring
- AI-powered job matching algorithm
- Production-ready Docker deployment

### Links

- **GitHub:** https://github.com/SiddJeph/emotion_capture
- **Docker Hub:** https://hub.docker.com/r/siddjeph/emotion-capture
- **Live Demo:** https://ecolab.iitkgp.ac.in/emotion-capture

---

## Slide 18: Q&A

### Thank You!

**Questions?**

---

## Appendix: Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Candidate | (any email) | (any password - auto registers) |
| Admin | admin@emotionai.com | admin123 |
