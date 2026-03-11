# Job Management System - Presentation Deck
## Emotion Capture & AI-Powered Job Matching Platform

---

## Slide 1: Title Slide
# Job Management System
## Complete Flow Analysis

**Emotion Capture Platform**  
*AI-Powered Job Matching & Recruitment*

---

## Slide 2: System Overview
# System Architecture

## Core Components:
1. **Job Creation & Management** (Admin Portal)
2. **AI-Powered Job Recommendation** (User Portal)
3. **Application Lifecycle Management**
4. **Assessment Integration**
5. **Selection & Rejection Workflow**

---

## Slide 3: Job Creation Flow
# 1. Job Creation Process

## Admin Workflow:
```
Admin Login → Job Management → Create New Job
```

### Job Data Structure:
- **Basic Info**: Title, Company, Location, Type, Salary
- **Description & Requirements**: Text fields
- **OCEAN Personality Traits**: 
  - Trait selection (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)
  - Weight (0-1): Importance of trait
  - Minimum Score (0-100): Required threshold
- **Tags**: Skills, technologies, keywords
- **Deadline**: Application deadline

### Storage:
- Jobs stored in `data/jobs.json`
- Unique ID generated: `job-{uuid}`

---

## Slide 4: Job Recommendation Algorithm
# 2. AI-Powered Job Recommendation

## Matching Formula:

### **Job Match Score Calculation**

```javascript
calculateJobMatch(job, oceanScores) {
  if (!oceanScores || job.idealTraits.length === 0) {
    return 50  // Default neutral match
  }

  let totalWeight = 0
  let weightedScore = 0

  for (const requirement of job.idealTraits) {
    const userScore = oceanScores[requirement.trait]
    const weight = requirement.weight
    totalWeight += weight

    if (userScore >= requirement.minScore) {
      // Full match: 100 points
      weightedScore += weight * 100
    } else {
      // Partial match: scaled by ratio
      const ratio = userScore / requirement.minScore
      weightedScore += weight * ratio * 100
    }
  }

  return Math.round(weightedScore / totalWeight)
}
```

### **Key Formula:**
```
Match Score = Σ(Weight × Score) / Σ(Weight)

Where:
- Score = 100 if userScore ≥ minScore
- Score = (userScore / minScore) × 100 if userScore < minScore
```

---

## Slide 5: Job Recommendation Flow
# 2. Job Recommendation Process

## User Journey:
```
User Login → View Jobs → System Calculates Matches
```

### Recommendation Logic:
1. **Fetch User's OCEAN Scores** (from completed assessment)
2. **Calculate Match Score** for each job using formula
3. **Sort Jobs** by match score (descending)
4. **Filter Recommendations**: Show jobs with match ≥ 60%

### Display Categories:
- **All Jobs**: Complete job listing
- **Recommended**: Top matches (score ≥ 60%)
- **Applied**: User's applications

### Match Score Indicators:
- **80-100%**: Excellent Match (Green/Electric)
- **60-79%**: Good Match (Blue/Calm)
- **<60%**: Lower Match (Gray)

---

## Slide 6: Application Creation Flow
# 3. Job Application Process

## Application States:
```
applied → assessment_pending → assessment_completed → 
under_review → selected/rejected
```

### Initial Application:
1. User clicks "Apply Now" on job
2. System checks: Has user already applied?
3. If not, create new application:
   ```javascript
   {
     id: uuid(),
     jobId: string,
     userId: string,
     status: 'assessment_pending',
     appliedAt: timestamp
   }
   ```
4. Status set to `assessment_pending` (requires assessment)

### Storage:
- Applications stored in `data/applications.json`
- Linked to job via `jobId`
- Linked to user via `userId`

---

## Slide 7: Assessment Integration
# 4. Assessment → Application Link

## Assessment Flow:
```
Apply → Assessment Required → Complete Assessment → 
Update Application Status
```

### Assessment Completion:
1. User completes emotion detection (Round 1)
2. User completes OCEAN questionnaire (Round 2)
3. System calculates:
   - OCEAN personality scores
   - Emotional Intelligence (EQ) score
   - Job match score
4. **Update Application**:
   ```javascript
   updateApplicationStatus(applicationId, {
     status: 'assessment_completed',
     assessmentId: assessmentId,
     matchScore: calculatedMatchScore
   })
   ```

### Match Score Calculation:
- Uses `calculateJobMatch()` function
- Compares user's OCEAN scores with job requirements
- Stores match percentage in application record

---

## Slide 8: Application Status Flow
# 5. Application Status Lifecycle

## Complete State Machine:

```
┌─────────────┐
│   applied   │ (Initial state - deprecated)
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ assessment_pending  │ ← User applies, assessment required
└──────┬──────────────┘
       │
       │ User completes assessment
       ▼
┌──────────────────────┐
│ assessment_completed │ ← Assessment done, match score calculated
└──────┬───────────────┘
       │
       │ Admin reviews
       ▼
┌───────────────┐
│ under_review  │ ← Admin reviewing candidate
└──────┬────────┘
       │
       ├─────────────┬─────────────┐
       ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ selected │  │ rejected │  │ withdrawn│
└──────────┘  └──────────┘  └──────────┘
```

---

## Slide 9: Selection & Rejection Process
# 6. Admin Selection/Rejection Workflow

## Admin Review Process:

### View Applications:
1. Admin navigates to Applications page
2. Views all applications with filters:
   - By Job
   - By Status
   - Search by applicant/job

### Review Candidate:
1. Click application to view details
2. See assessment results:
   - OCEAN personality scores
   - EQ score
   - Emotion distribution
   - Match score vs job requirements
3. Review job requirements alignment

### Decision Actions:
- **Select**: Change status to `selected`
- **Reject**: Change status to `rejected`
- **Review**: Change status to `under_review`

### Status Update API:
```javascript
PATCH /api/applications
{
  applicationId: string,
  status: 'selected' | 'rejected' | 'under_review'
}
```

---

## Slide 10: Key Formulas & Algorithms
# Core Mathematical Models

## 1. Job Match Score Formula

**Weighted Trait Matching:**
```
Match Score = (Σ Weight_i × Score_i) / Σ Weight_i

Where:
- Weight_i = Importance weight of trait i (0-1)
- Score_i = Match score for trait i (0-100)
  - If userScore ≥ minScore: Score_i = 100
  - Else: Score_i = (userScore / minScore) × 100
```

**Example:**
```
Job requires:
- Openness: weight=0.4, minScore=70
- Conscientiousness: weight=0.35, minScore=65
- Extraversion: weight=0.15, minScore=40

User scores:
- Openness: 75 (≥70) → Score = 100
- Conscientiousness: 60 (<65) → Score = (60/65)×100 = 92.3
- Extraversion: 45 (≥40) → Score = 100

Match = (0.4×100 + 0.35×92.3 + 0.15×100) / (0.4+0.35+0.15)
     = (40 + 32.3 + 15) / 0.9
     = 97%
```

---

## Slide 11: Trait Matching Algorithm
# 2. OCEAN Trait Matching Logic

## Trait Comparison:

```javascript
getMatchingTraits(job, oceanScores) {
  return job.idealTraits.map(req => ({
    trait: req.trait,
    userScore: oceanScores[req.trait],
    requiredScore: req.minScore,
    matched: oceanScores[req.trait] >= req.minScore
  }))
}
```

### Matching Rules:
- **Full Match**: `userScore ≥ minScore` → 100 points
- **Partial Match**: `userScore < minScore` → Proportional score
- **Weighted Average**: Final score considers trait importance

### Visual Indicators:
- ✅ Green: Trait requirement met
- ⚠️ Yellow: Partial match
- ❌ Red: Requirement not met

---

## Slide 12: Data Flow Architecture
# System Data Flow

## Complete Flow Diagram:

```
┌─────────────┐
│   Admin     │
│  Creates    │
│    Job      │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│  Job Store   │────▶│  User Views  │
│ (jobs.json)  │     │    Jobs      │
└─────────────┘     └──────┬───────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ User Applies │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Application  │
                    │   Created    │
                    │ (status:     │
                    │  pending)    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Assessment   │
                    │  Completed   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Match Score  │
                    │  Calculated  │
                    │ Status:      │
                    │ completed    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Admin Reviews │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    ▼              ▼
            ┌──────────┐    ┌──────────┐
            │ Selected │    │ Rejected │
            └──────────┘    └──────────┘
```

---

## Slide 13: API Endpoints
# Key API Routes

## Job Management:
- `GET /api/jobs` - Fetch all jobs
  - Query: `?withScores={oceanScores}` - Get matched jobs
  - Query: `?withStats=true` - Include application stats
- `POST /api/jobs` - Create new job (Admin)
- `PATCH /api/jobs` - Update job (Admin)
- `DELETE /api/jobs?id={jobId}` - Delete job (Admin)

## Application Management:
- `GET /api/applications?userId={id}` - User's applications
- `GET /api/applications?admin=true` - All applications (Admin)
- `POST /api/applications` - Create application
  - Body: `{ jobId, userId }`
- `PATCH /api/applications` - Update status
  - Body: `{ applicationId, status, matchScore? }`

## Assessment:
- `GET /api/assessments?userId={id}` - Get assessment results

---

## Slide 14: Storage Structure
# Data Storage Architecture

## File-Based Storage:

### `data/jobs.json`:
```json
[
  {
    "id": "job-001",
    "title": "Senior Software Engineer",
    "company": "TechVision AI",
    "idealTraits": [
      {
        "trait": "openness",
        "weight": 0.4,
        "minScore": 70
      }
    ],
    ...
  }
]
```

### `data/applications.json`:
```json
[
  {
    "id": "app-uuid",
    "jobId": "job-001",
    "userId": "user-id",
    "status": "assessment_completed",
    "appliedAt": "2026-02-12T...",
    "assessmentId": "assessment-id",
    "matchScore": 87
  }
]
```

---

## Slide 15: Status Definitions
# Application Status Reference

| Status | Description | Next Actions |
|--------|-------------|--------------|
| `applied` | Initial application (deprecated) | Auto-transition to `assessment_pending` |
| `assessment_pending` | Waiting for user to complete assessment | User takes assessment |
| `assessment_completed` | Assessment done, match score calculated | Admin can review |
| `under_review` | Admin actively reviewing | Admin selects/rejects |
| `selected` | Candidate chosen | Final state |
| `rejected` | Candidate not selected | Final state |
| `withdrawn` | User withdrew application | Final state |

---

## Slide 16: Match Score Interpretation
# Understanding Match Scores

## Score Ranges:

### **80-100%**: Excellent Match 🟢
- User meets or exceeds most job requirements
- High probability of success
- Recommended for priority review

### **60-79%**: Good Match 🟡
- User meets core requirements
- Some traits may be below ideal
- Worth reviewing

### **40-59%**: Moderate Match 🟠
- Partial alignment with requirements
- May need additional evaluation
- Consider other factors

### **<40%**: Low Match 🔴
- Significant gaps in requirements
- May not be ideal fit
- Consider for different roles

---

## Slide 17: Admin Dashboard Metrics
# Key Performance Indicators

## Job Statistics:
- **Total Jobs**: Count of all active jobs
- **Total Applications**: Sum across all jobs
- **Assessments Completed**: Applications with completed assessments
- **Selection Rate**: Selected / Total Applications

## Application Statistics (per Job):
- Total Applications
- Pending Assessments
- Completed Assessments
- Under Review
- Selected
- Rejected

## Average Match Score:
- Calculated from all applications with match scores
- Formula: `Σ(matchScore) / count(applications with matchScore)`

---

## Slide 18: User Experience Flow
# Complete User Journey

## Step-by-Step:

1. **Login** → User authenticates
2. **View Jobs** → Browse available positions
3. **See Recommendations** → AI shows matched jobs (if assessment completed)
4. **Apply** → Click "Apply Now" on job
5. **Assessment Required** → System prompts for assessment
6. **Complete Assessment**:
   - Round 1: Emotion detection (video)
   - Round 2: OCEAN questionnaire
7. **View Results** → See match score and personality profile
8. **Track Application** → Monitor status in "Applied" tab
9. **Receive Update** → Status changes (selected/rejected)

---

## Slide 19: Admin Experience Flow
# Complete Admin Journey

## Step-by-Step:

1. **Admin Login** → Authenticate as admin
2. **Create Jobs** → Add new job postings with OCEAN requirements
3. **View Applications** → See all candidate applications
4. **Filter & Search** → Find specific applications
5. **Review Candidate**:
   - View assessment results
   - Check OCEAN scores vs requirements
   - Review match score
   - See emotion analysis
6. **Make Decision**:
   - Select candidate → Status: `selected`
   - Reject candidate → Status: `rejected`
   - Request review → Status: `under_review`
7. **Monitor Metrics** → Track KPIs on dashboard

---

## Slide 20: Key Features Summary
# System Highlights

## ✅ Intelligent Matching
- AI-powered job recommendations based on personality
- Weighted trait matching algorithm
- Real-time match score calculation

## ✅ Complete Lifecycle Management
- Application tracking from apply to decision
- Status-based workflow
- Assessment integration

## ✅ Admin Control
- Full job CRUD operations
- Application review interface
- Comprehensive statistics

## ✅ User-Friendly
- Personalized recommendations
- Clear application status
- Visual match indicators

---

## Slide 21: Technical Implementation
# Technology Stack

## Frontend:
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Backend:
- **Next.js API Routes** - Serverless functions
- **File-based storage** - JSON files
- **UUID** - Unique identifiers

## AI/ML:
- **OCEAN Model** - Personality assessment
- **Emotion Detection** - Face API integration
- **Match Algorithm** - Custom scoring system

---

## Slide 22: Formulas Summary
# Key Mathematical Formulas

## 1. Job Match Score:
```
Match = Σ(Weight_i × Score_i) / Σ(Weight_i)

Score_i = {
  100,                    if userScore ≥ minScore
  (userScore/minScore)×100, if userScore < minScore
}
```

## 2. Trait Matching:
```
Matched = userScore ≥ minScore
Partial Score = (userScore / minScore) × 100
```

## 3. Average Match Score:
```
Avg Match = Σ(matchScores) / count(applications)
```

---

## Slide 23: Questions & Answers
# Common Questions

## Q: How is the match score calculated?
**A:** Weighted average of trait matches, where each trait contributes based on its importance weight.

## Q: What happens if a user hasn't completed assessment?
**A:** Default match score of 50% is assigned, or jobs shown without scores.

## Q: Can admins see why a candidate matched?
**A:** Yes, detailed trait-by-trait comparison is shown in application review.

## Q: How are jobs recommended?
**A:** Jobs are sorted by match score (descending), and those ≥60% are shown as "Recommended".

## Q: What triggers status changes?
**A:** 
- User action: Apply → `assessment_pending`
- Assessment completion → `assessment_completed`
- Admin action: Review → `under_review`, Select/Reject → final status

---

## Slide 24: Conclusion
# Summary

## Complete Job Management System:
✅ **Job Creation** - Admin creates jobs with OCEAN requirements  
✅ **AI Recommendation** - Intelligent matching algorithm  
✅ **Application Flow** - Complete lifecycle management  
✅ **Assessment Integration** - Seamless connection  
✅ **Selection/Rejection** - Admin decision workflow  

## Key Innovation:
**AI-powered personality-based job matching** using OCEAN model and weighted trait analysis.

---

## Thank You!
# Questions?

**Emotion Capture Platform**  
*AI-Powered Job Matching & Recruitment*

---
