# System Architecture

## High-Level Architecture

```mermaid
flowchart TB
    subgraph Client["Client (Browser)"]
        UI[Next.js Frontend]
        CAM[Webcam Stream]
        FACE[face-api.js<br/>TensorFlow.js]
    end

    subgraph Server["Server (Next.js API)"]
        API[API Routes]
        AUTH[Authentication]
        ML[ML Scoring Engine]
    end

    subgraph Database["Data Layer"]
        SUPA[(Supabase<br/>PostgreSQL)]
        LOCAL[(Local JSON<br/>Storage)]
    end

    CAM --> FACE
    FACE --> UI
    UI <--> API
    API <--> AUTH
    API <--> ML
    API <--> SUPA
    API <--> LOCAL

    style Client fill:#1a1a2e,stroke:#00d4ff,color:#fff
    style Server fill:#1a1a2e,stroke:#8338ec,color:#fff
    style Database fill:#1a1a2e,stroke:#4ade80,color:#fff
```

## Assessment Flow

```mermaid
flowchart LR
    A[Start] --> B[Face Calibration]
    B --> C[Round 1:<br/>Emotion Detection]
    C --> D[Round 2:<br/>OCEAN Questions]
    D --> E[ML Analysis]
    E --> F[Results to Admin]

    style A fill:#00d4ff,stroke:#fff,color:#000
    style B fill:#8338ec,stroke:#fff,color:#fff
    style C fill:#ff006e,stroke:#fff,color:#fff
    style D fill:#fb5607,stroke:#fff,color:#fff
    style E fill:#4ade80,stroke:#fff,color:#000
    style F fill:#00d4ff,stroke:#fff,color:#000
```

## Component Architecture

```mermaid
flowchart TB
    subgraph Frontend["Frontend Components"]
        LAND[LandingScreen]
        LOADER[ModelLoader]
        CALIB[CalibrationScreen]
        ENGINE[AssessmentEngine]
        OCEAN[OceanQuestionnaire]
        ANALYSIS[AnalysisScreen]
        RESULTS[CombinedResults]
    end

    subgraph API["API Routes"]
        R1[/api/auth]
        R2[/api/responses]
        R3[/api/jobs]
        R4[/api/applications]
        R5[/api/assessments]
    end

    subgraph ML["ML Models"]
        EM[Emotion Model<br/>MARKOV-v1.3]
        PM[Personality Model<br/>OCEAN-IRT-v2.1]
        JM[Job Matching<br/>Algorithm]
    end

    LAND --> LOADER --> CALIB --> ENGINE --> OCEAN --> ANALYSIS --> RESULTS
    ENGINE --> R2
    OCEAN --> R2
    ANALYSIS --> EM
    ANALYSIS --> PM
    R3 --> JM

    style Frontend fill:#0f0f1a,stroke:#00d4ff,color:#fff
    style API fill:#0f0f1a,stroke:#8338ec,color:#fff
    style ML fill:#0f0f1a,stroke:#4ade80,color:#fff
```

## User Roles Flow

```mermaid
flowchart TB
    subgraph Candidate["Candidate Flow"]
        C1[Register/Login] --> C2[Browse Jobs]
        C2 --> C3[Apply]
        C3 --> C4[Take Assessment]
        C4 --> C5[View Dashboard]
    end

    subgraph Admin["Admin Flow"]
        A1[Login] --> A2[Create Jobs]
        A2 --> A3[Review Applications]
        A3 --> A4[View Assessments]
        A4 --> A5[Select/Reject]
    end

    C4 --> A3

    style Candidate fill:#1a1a2e,stroke:#00d4ff,color:#fff
    style Admin fill:#1a1a2e,stroke:#ff006e,color:#fff
```

## Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant M as ML Engine
    participant D as Database

    U->>F: Start Assessment
    F->>F: Capture Emotions (200ms)
    F->>F: Collect OCEAN Answers
    F->>A: Submit Data
    A->>M: Process Emotions
    M-->>A: EQ Score
    A->>M: Process Personality
    M-->>A: OCEAN Scores
    A->>D: Save Results
    A-->>F: Assessment Complete
    F-->>U: Show Confirmation
```

## Deployment Architecture

```mermaid
flowchart TB
    subgraph Cloud["Production Environment"]
        NGINX[Nginx Reverse Proxy]
        DOCKER[Docker Container<br/>Port 3005]
        APP[Next.js App]
    end

    subgraph External["External Services"]
        GH[GitHub]
        DH[Docker Hub]
        SUPA[(Supabase)]
    end

    USER[User Browser] --> NGINX
    NGINX --> DOCKER
    DOCKER --> APP
    APP <--> SUPA
    GH --> DH
    DH --> DOCKER

    style Cloud fill:#1a1a2e,stroke:#00d4ff,color:#fff
    style External fill:#1a1a2e,stroke:#8338ec,color:#fff
```
