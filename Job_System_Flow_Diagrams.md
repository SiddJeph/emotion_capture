# Job System Flow Diagrams
## Visual Reference Guide

---

## 1. Complete Job Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         JOB LIFECYCLE                            │
└─────────────────────────────────────────────────────────────────┘

ADMIN SIDE:
┌──────────┐
│  Admin   │
│  Login   │
└────┬─────┘
     │
     ▼
┌──────────────┐
│ Create Job   │
│ - Basic Info │
│ - OCEAN      │
│ - Traits     │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Job Stored   │
│ (jobs.json)  │
└────┬─────────┘
     │
     │
USER SIDE:
     │
     ▼
┌──────────────┐
│ User Views   │
│ Jobs         │
└────┬─────────┘
     │
     ▼
┌─────────────────────┐
│ System Calculates   │
│ Match Scores        │
│ (if OCEAN scores    │
│  available)         │
└────┬────────────────┘
     │
     ▼
┌──────────────┐
│ User Applies │
│ to Job       │
└────┬─────────┘
     │
     ▼
┌──────────────────────┐
│ Application Created  │
│ Status:              │
│ assessment_pending   │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ User Completes       │
│ Assessment           │
│ - Emotion Detection  │
│ - OCEAN Questionnaire│
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Match Score          │
│ Calculated           │
│ Status Updated:      │
│ assessment_completed │
└────┬─────────────────┘
     │
     │
ADMIN REVIEW:
     │
     ▼
┌──────────────────────┐
│ Admin Reviews        │
│ Application          │
│ - Sees Match Score   │
│ - Reviews Traits     │
│ - Checks Assessment  │
└────┬─────────────────┘
     │
     ├──────────────┬──────────────┐
     ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Selected │  │ Rejected │  │ Review   │
└──────────┘  └──────────┘  └──────────┘
```

---

## 2. Match Score Calculation Flow

```
┌─────────────────────────────────────────────────────────────┐
│              MATCH SCORE CALCULATION PROCESS                 │
└─────────────────────────────────────────────────────────────┘

INPUT:
┌──────────────┐         ┌──────────────┐
│ Job          │         │ User OCEAN    │
│ Requirements │         │ Scores        │
│              │         │              │
│ idealTraits: │         │ openness: 75 │
│ - openness   │         │ conscientious:│
│   (w:0.4,    │         │   60         │
│    min:70)   │         │ extraversion: │
│ - conscien-  │         │   45         │
│   tiousness  │         │ ...          │
│   (w:0.35,   │         └──────────────┘
│    min:65)   │
│ ...          │
└──────┬───────┘
       │
       │ For each trait requirement:
       │
       ▼
┌─────────────────────────────────────┐
│ 1. Get user score for trait         │
│    userScore = oceanScores[trait]   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 2. Compare with minimum requirement │
│    if userScore >= minScore:        │
│       score = 100                   │
│    else:                            │
│       score = (userScore/minScore)  │
│              × 100                  │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ 3. Apply weight                     │
│    weightedScore += weight × score   │
│    totalWeight += weight             │
└──────┬──────────────────────────────┘
       │
       │ Repeat for all traits
       │
       ▼
┌─────────────────────────────────────┐
│ 4. Calculate final match            │
│    matchScore = weightedScore /      │
│                  totalWeight         │
│    Return: Math.round(matchScore)    │
└──────┬──────────────────────────────┘
       │
       ▼
┌──────────────┐
│ Match Score  │
│ (0-100%)     │
└──────────────┘
```

---

## 3. Application Status State Machine

```
┌─────────────────────────────────────────────────────────────┐
│              APPLICATION STATUS TRANSITIONS                 │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   applied    │ (Deprecated)
                    └──────┬───────┘
                           │
                           │ Auto-transition
                           ▼
              ┌────────────────────────┐
              │ assessment_pending      │
              │                        │
              │ User must complete     │
              │ assessment             │
              └──────┬─────────────────┘
                     │
                     │ User completes
                     │ assessment
                     ▼
        ┌────────────────────────────┐
        │ assessment_completed       │
        │                            │
        │ - Match score calculated   │
        │ - Assessment linked        │
        │ - Ready for admin review   │
        └──────┬─────────────────────┘
               │
               │ Admin action
               ▼
    ┌──────────────────────────────┐
    │ under_review                 │
    │                              │
    │ Admin actively reviewing     │
    │ candidate                    │
    └──────┬───────────────────────┘
           │
           ├──────────────┬──────────────┐
           ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ selected │  │ rejected │  │ withdrawn│
    │          │  │          │  │          │
    │ FINAL    │  │ FINAL    │  │ FINAL    │
    └──────────┘  └──────────┘  └──────────┘
```

---

## 4. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA FLOW DIAGRAM                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐
│   Admin     │──┐
│  Portal     │  │ Creates/Updates
└─────────────┘  │
                 ▼
         ┌──────────────┐
         │  jobs.json   │
         │              │
         │ - Job data   │
         │ - OCEAN reqs │
         └──────┬───────┘
                │
                │ Read
                ▼
         ┌──────────────┐
         │  User Portal │
         │              │
         │ Views jobs   │
         │ Applies      │
         └──────┬───────┘
                │
                │ Creates
                ▼
         ┌──────────────────┐
         │applications.json │
         │                  │
         │ - Application    │
         │ - Status         │
         │ - Match score    │
         └──────┬───────────┘
                │
                │ Links to
                ▼
         ┌──────────────────┐
         │ Assessment Data  │
         │                  │
         │ - OCEAN scores   │
         │ - Emotion data   │
         │ - EQ score       │
         └──────┬───────────┘
                │
                │ Used for
                ▼
         ┌──────────────────┐
         │ Match Score      │
         │ Calculation      │
         └──────────────────┘
```

---

## 5. Recommendation Algorithm Flow

```
┌─────────────────────────────────────────────────────────────┐
│            JOB RECOMMENDATION PROCESS                        │
└─────────────────────────────────────────────────────────────┘

START:
┌──────────────┐
│ User logged  │
│ in           │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Check: Does user     │
│ have OCEAN scores?   │
└──────┬───────────────┘
       │
       ├─── NO ───────────────┐
       │                      │
       ▼                      ▼
┌──────────────┐    ┌──────────────────┐
│ Show all     │    │ Fetch user's     │
│ jobs without │    │ OCEAN scores     │
│ match scores │    │ from assessment  │
└──────────────┘    └──────┬────────────┘
                           │
                           │ YES
                           ▼
                  ┌──────────────────┐
                  │ For each job:    │
                  │ Calculate match  │
                  │ score using      │
                  │ formula          │
                  └──────┬───────────┘
                         │
                         ▼
                  ┌──────────────────┐
                  │ Sort jobs by     │
                  │ match score      │
                  │ (descending)     │
                  └──────┬───────────┘
                         │
                         ▼
                  ┌──────────────────┐
                  │ Filter: Show     │
                  │ jobs with match  │
                  │ ≥ 60% as         │
                  │ "Recommended"    │
                  └──────┬───────────┘
                         │
                         ▼
                  ┌──────────────────┐
                  │ Display jobs     │
                  │ with match       │
                  │ indicators       │
                  └──────────────────┘
```

---

## 6. Admin Review Process

```
┌─────────────────────────────────────────────────────────────┐
│              ADMIN REVIEW WORKFLOW                          │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐
│ Admin Login  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ View Applications    │
│ Page                 │
└──────┬───────────────┘
       │
       │ Filter/Search
       ▼
┌──────────────────────┐
│ Select Application   │
│ to Review            │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ View Application Details:            │
│                                      │
│ 1. Applicant Info                    │
│    - User ID                         │
│    - Applied date                    │
│                                      │
│ 2. Assessment Results                │
│    - OCEAN scores                    │
│    - EQ score                        │
│    - Emotion distribution            │
│                                      │
│ 3. Match Analysis                   │
│    - Match score                     │
│    - Trait-by-trait comparison       │
│    - Requirements met/not met        │
│                                      │
│ 4. Job Requirements                  │
│    - Listed requirements             │
└──────┬───────────────────────────────┘
       │
       │ Admin evaluates
       ▼
┌──────────────────────┐
│ Make Decision:      │
│                      │
│ [Select] [Reject]    │
│ [Review]             │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Update Status        │
│ via API              │
└──────────────────────┘
```

---

## 7. Formula Breakdown Example

```
┌─────────────────────────────────────────────────────────────┐
│              MATCH SCORE CALCULATION EXAMPLE                │
└─────────────────────────────────────────────────────────────┘

JOB REQUIREMENTS:
┌─────────────────────────────────────────────────────────────┐
│ Trait          │ Weight │ Min Score │ User Score │ Status  │
├────────────────┼────────┼───────────┼────────────┼─────────┤
│ Openness       │  0.40  │    70     │    75      │  ✓ Met  │
│ Conscientious  │  0.35  │    65     │    60      │  ✗ Below│
│ Extraversion   │  0.15  │    40     │    45      │  ✓ Met  │
│ Agreeableness  │  0.10  │    50     │    55      │  ✓ Met  │
└────────────────┴────────┴───────────┴────────────┴─────────┘

CALCULATION:

1. Openness:
   userScore (75) ≥ minScore (70) → Score = 100
   Weighted: 0.40 × 100 = 40.0

2. Conscientiousness:
   userScore (60) < minScore (65) → Score = (60/65) × 100 = 92.31
   Weighted: 0.35 × 92.31 = 32.31

3. Extraversion:
   userScore (45) ≥ minScore (40) → Score = 100
   Weighted: 0.15 × 100 = 15.0

4. Agreeableness:
   userScore (55) ≥ minScore (50) → Score = 100
   Weighted: 0.10 × 100 = 10.0

FINAL CALCULATION:
Total Weighted Score = 40.0 + 32.31 + 15.0 + 10.0 = 97.31
Total Weight = 0.40 + 0.35 + 0.15 + 0.10 = 1.0

Match Score = 97.31 / 1.0 = 97.31% → Rounded: 97%

RESULT: Excellent Match! 🟢
```

---

## 8. API Request/Response Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  API INTERACTION FLOW                        │
└─────────────────────────────────────────────────────────────┘

USER APPLIES:
┌──────────────┐
│ POST /api/   │
│ applications │
│              │
│ Body:        │
│ {            │
│   jobId:     │
│   userId:    │
│ }            │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Response:    │
│ {            │
│   success:   │
│   true,      │
│   data: {    │
│     id,      │
│     status:  │
│     "assess- │
│     ment_    │
│     pending" │
│   }          │
│ }            │
└──────────────┘

GET MATCHED JOBS:
┌──────────────┐
│ GET /api/    │
│ jobs?        │
│ withScores=  │
│ {oceanScores}│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Response:    │
│ {            │
│   success:   │
│   true,      │
│   data: [    │
│     {        │
│       job,   │
│       match- │
│       Score: │
│       87,    │
│       match- │
│       ing-   │
│       Traits │
│     }        │
│   ]          │
│ }            │
└──────────────┘

ADMIN UPDATES STATUS:
┌──────────────┐
│ PATCH /api/  │
│ applications │
│              │
│ Body:        │
│ {            │
│   applica-   │
│   tionId,    │
│   status:    │
│   "selected" │
│ }            │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Response:    │
│ {            │
│   success:   │
│   true,      │
│   data: {    │
│     ...      │
│     status:  │
│     "selected"│
│   }          │
│ }            │
└──────────────┘
```

---

## 9. Status Color Coding

```
┌─────────────────────────────────────────────────────────────┐
│              STATUS VISUAL INDICATORS                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────┬──────────┬──────────┬──────────────┐
│ Status              │ Color    │ Icon     │ Meaning       │
├─────────────────────┼──────────┼──────────┼──────────────┤
│ assessment_pending  │ 🟡 Yellow│ ⏳       │ Waiting for  │
│                     │          │          │ assessment   │
├─────────────────────┼──────────┼──────────┼──────────────┤
│ assessment_completed│ 🟢 Green │ ✅       │ Assessment   │
│                     │          │          │ done         │
├─────────────────────┼──────────┼──────────┼──────────────┤
│ under_review        │ 🟣 Purple│ 👀      │ Admin        │
│                     │          │          │ reviewing    │
├─────────────────────┼──────────┼──────────┼──────────────┤
│ selected            │ 🟢 Green │ 🎉       │ Candidate    │
│                     │          │          │ chosen       │
├─────────────────────┼──────────┼──────────┼──────────────┤
│ rejected            │ 🔴 Red   │ ❌       │ Not selected │
├─────────────────────┼──────────┼──────────┼──────────────┤
│ withdrawn           │ ⚪ Gray  │ ↩️       │ User withdrew│
└─────────────────────┴──────────┴──────────┴──────────────┘

MATCH SCORE COLORS:
┌─────────────┬──────────┬──────────────────┐
│ Score Range │ Color    │ Interpretation   │
├─────────────┼──────────┼──────────────────┤
│ 80-100%     │ 🟢 Green │ Excellent Match  │
├─────────────┼──────────┼──────────────────┤
│ 60-79%      │ 🟡 Yellow│ Good Match       │
├─────────────┼──────────┼──────────────────┤
│ 40-59%      │ 🟠 Orange│ Moderate Match   │
├─────────────┼──────────┼──────────────────┤
│ <40%        │ 🔴 Red   │ Low Match        │
└─────────────┴──────────┴──────────────────┘
```

---

## 10. Quick Reference: Key Functions

```
┌─────────────────────────────────────────────────────────────┐
│                    KEY FUNCTIONS                            │
└─────────────────────────────────────────────────────────────┘

1. calculateJobMatch(job, oceanScores)
   └─> Returns: number (0-100)
   └─> Calculates weighted match score

2. getMatchingTraits(job, oceanScores)
   └─> Returns: Array of trait comparisons
   └─> Shows which traits match/not match

3. createApplication(jobId, userId)
   └─> Returns: JobApplication
   └─> Creates new application with status 'assessment_pending'

4. updateApplicationStatus(id, status, assessmentId?, matchScore?)
   └─> Returns: JobApplication | null
   └─> Updates application status and links assessment

5. getAllJobs()
   └─> Returns: Job[]
   └─> Fetches all available jobs

6. getUserApplications(userId)
   └─> Returns: JobApplication[]
   └─> Gets all applications for a user
```

---
