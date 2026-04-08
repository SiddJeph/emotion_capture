# Candidate Journey Flow Diagram

## Simple Linear Flow

```mermaid
flowchart LR
    A[1. Register/Login] --> B[2. Browse Jobs]
    B --> C[3. Apply]
    C --> D[4. Round 1:<br/>Emotion Test]
    D --> E[5. Round 2:<br/>OCEAN Test]
    E --> F[6. ML Analysis]
    F --> G[7. Complete]
    G --> H[8. Dashboard]

    style A fill:#00d4ff,stroke:#fff,color:#000
    style B fill:#8338ec,stroke:#fff,color:#fff
    style C fill:#fb5607,stroke:#fff,color:#fff
    style D fill:#ff006e,stroke:#fff,color:#fff
    style E fill:#ff006e,stroke:#fff,color:#fff
    style F fill:#4ade80,stroke:#fff,color:#000
    style G fill:#4ade80,stroke:#fff,color:#000
    style H fill:#00d4ff,stroke:#fff,color:#000
```

---

## Detailed Vertical Flow

```mermaid
flowchart TB
    A["🔐 1. REGISTER / LOGIN<br/><small>Create account or sign in</small>"]
    B["🔍 2. BROWSE JOBS<br/><small>View jobs with AI match scores</small>"]
    C["📝 3. APPLY<br/><small>Submit application</small>"]
    
    subgraph ASSESSMENT["📋 ASSESSMENT"]
        D["🎥 4. ROUND 1: EMOTION TEST<br/><small>Watch video, emotions captured<br/>7 emotions • 200ms intervals</small>"]
        E["🧠 5. ROUND 2: OCEAN TEST<br/><small>Answer 25 personality questions<br/>5 traits measured</small>"]
    end
    
    F["⚙️ 6. ML ANALYSIS<br/><small>AI processes data<br/>EQ Score + OCEAN Percentiles</small>"]
    G["✅ 7. COMPLETE<br/><small>Results sent to admin</small>"]
    H["📊 8. DASHBOARD<br/><small>Track application status</small>"]

    A --> B --> C --> ASSESSMENT
    D --> E
    ASSESSMENT --> F --> G --> H

    style A fill:#0ea5e9,stroke:#fff,color:#fff
    style B fill:#8b5cf6,stroke:#fff,color:#fff
    style C fill:#f97316,stroke:#fff,color:#fff
    style D fill:#ec4899,stroke:#fff,color:#fff
    style E fill:#ec4899,stroke:#fff,color:#fff
    style F fill:#22c55e,stroke:#fff,color:#fff
    style G fill:#22c55e,stroke:#fff,color:#fff
    style H fill:#0ea5e9,stroke:#fff,color:#fff
    style ASSESSMENT fill:#1e1e2e,stroke:#ec4899,color:#fff
```

---

## Clean Version (For Slides)

```mermaid
flowchart TB
    A[1. Register/Login] --> B[2. Browse Jobs]
    B --> C[3. Apply to Job]
    C --> D[4. Emotion Assessment]
    D --> E[5. Personality Assessment]
    E --> F[6. ML Analysis]
    F --> G[7. Submit to Admin]
    G --> H[8. Track in Dashboard]

    subgraph Assessment Flow
        D
        E
        F
    end
```

---

## Horizontal with Icons (Best for Presentation)

```mermaid
flowchart LR
    subgraph Phase1["ONBOARDING"]
        A["1️⃣ Register<br/>Login"]
        B["2️⃣ Browse<br/>Jobs"]
        C["3️⃣ Apply"]
    end

    subgraph Phase2["ASSESSMENT"]
        D["4️⃣ Emotion<br/>Video Test"]
        E["5️⃣ OCEAN<br/>25 Questions"]
        F["6️⃣ ML<br/>Analysis"]
    end

    subgraph Phase3["COMPLETION"]
        G["7️⃣ Submit<br/>Results"]
        H["8️⃣ Track<br/>Status"]
    end

    A --> B --> C --> D --> E --> F --> G --> H

    style Phase1 fill:#1e3a5f,stroke:#0ea5e9,color:#fff
    style Phase2 fill:#3d1f5c,stroke:#ec4899,color:#fff
    style Phase3 fill:#1f4d3a,stroke:#22c55e,color:#fff
```

---

## With Data Flow Annotations

```mermaid
flowchart TB
    A["1. REGISTER/LOGIN<br/>━━━━━━━━━━━━━━<br/>Email + Password"]
    
    B["2. BROWSE JOBS<br/>━━━━━━━━━━━━━━<br/>View Match Scores"]
    
    C["3. APPLY<br/>━━━━━━━━━━━━━━<br/>Submit Application"]
    
    D["4. EMOTION TEST<br/>━━━━━━━━━━━━━━<br/>📹 Webcam Recording<br/>⏱️ 200ms Capture<br/>😊 7 Emotions"]
    
    E["5. OCEAN TEST<br/>━━━━━━━━━━━━━━<br/>📝 25 Questions<br/>⭐ 1-5 Scale<br/>🎯 5 Traits"]
    
    F["6. ML ANALYSIS<br/>━━━━━━━━━━━━━━<br/>🧮 Score Calculation<br/>📊 Percentiles<br/>🎯 Job Matching"]
    
    G["7. COMPLETE<br/>━━━━━━━━━━━━━━<br/>📤 Send to Admin"]
    
    H["8. DASHBOARD<br/>━━━━━━━━━━━━━━<br/>📈 Track Status<br/>🔔 Get Updates"]

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H

    style A fill:#0f172a,stroke:#0ea5e9,stroke-width:2px,color:#fff
    style B fill:#0f172a,stroke:#8b5cf6,stroke-width:2px,color:#fff
    style C fill:#0f172a,stroke:#f97316,stroke-width:2px,color:#fff
    style D fill:#0f172a,stroke:#ec4899,stroke-width:2px,color:#fff
    style E fill:#0f172a,stroke:#ec4899,stroke-width:2px,color:#fff
    style F fill:#0f172a,stroke:#22c55e,stroke-width:2px,color:#fff
    style G fill:#0f172a,stroke:#22c55e,stroke-width:2px,color:#fff
    style H fill:#0f172a,stroke:#0ea5e9,stroke-width:2px,color:#fff
```

---

## Simple Box Version (Copy for PPT)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CANDIDATE JOURNEY                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │1.REGISTER│───►│2. BROWSE │───►│ 3. APPLY │                   │
│  │  LOGIN   │    │   JOBS   │    │          │                   │
│  └──────────┘    └──────────┘    └────┬─────┘                   │
│                                       │                          │
│                                       ▼                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    ASSESSMENT                            │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │    │
│  │  │ 4. EMOTION │─►│ 5. OCEAN   │─►│ 6. ML      │         │    │
│  │  │    TEST    │  │   TEST     │  │  ANALYSIS  │         │    │
│  │  │  (Video)   │  │(25 Ques.)  │  │ (Scoring)  │         │    │
│  │  └────────────┘  └────────────┘  └────────────┘         │    │
│  └─────────────────────────────────────┬───────────────────┘    │
│                                        │                         │
│                                        ▼                         │
│  ┌──────────┐    ┌──────────────────────────┐                   │
│  │8.DASHBOARD│◄──│ 7. COMPLETE              │                   │
│  │  (Track)  │   │   (Results → Admin)      │                   │
│  └──────────┘    └──────────────────────────┘                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary Table

| Step | Action | Details |
|------|--------|---------|
| 1 | Register/Login | Create account with email/password |
| 2 | Browse Jobs | View listings with AI match scores |
| 3 | Apply | Submit application for position |
| 4 | Emotion Test | Watch video, 7 emotions captured |
| 5 | OCEAN Test | Answer 25 personality questions |
| 6 | ML Analysis | AI calculates EQ + OCEAN scores |
| 7 | Complete | Results sent to admin for review |
| 8 | Dashboard | Track application status |
