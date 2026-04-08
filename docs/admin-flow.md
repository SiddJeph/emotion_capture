# Admin Journey Flow Diagram

## Simple Linear Flow

```mermaid
flowchart LR
    A[1. Login] --> B[2. Create Jobs]
    B --> C[3. Review Applications]
    C --> D[4. View Assessment]
    D --> E[5. Decision]

    style A fill:#8338ec,stroke:#fff,color:#fff
    style B fill:#00d4ff,stroke:#fff,color:#000
    style C fill:#fb5607,stroke:#fff,color:#fff
    style D fill:#ff006e,stroke:#fff,color:#fff
    style E fill:#4ade80,stroke:#fff,color:#000
```

---

## Detailed Vertical Flow

```mermaid
flowchart TB
    A["🔐 1. LOGIN<br/><small>Access admin portal</small>"]
    B["📝 2. CREATE JOBS<br/><small>Define positions<br/>Set OCEAN trait requirements</small>"]
    C["👥 3. REVIEW APPLICATIONS<br/><small>See all candidates<br/>Filter by job/status</small>"]
    D["📊 4. VIEW ASSESSMENT<br/><small>Emotion analysis<br/>Personality scores<br/>Match percentage</small>"]
    E["✅ 5. DECISION<br/><small>Select or Reject</small>"]

    A --> B --> C --> D --> E

    style A fill:#8338ec,stroke:#fff,color:#fff
    style B fill:#0ea5e9,stroke:#fff,color:#fff
    style C fill:#f97316,stroke:#fff,color:#fff
    style D fill:#ec4899,stroke:#fff,color:#fff
    style E fill:#22c55e,stroke:#fff,color:#fff
```

---

## With Details (Best for Slides)

```mermaid
flowchart TB
    A["1. ADMIN LOGIN<br/>━━━━━━━━━━━━━━━━━━<br/>🔐 Secure access<br/>📧 admin@emotionai.com"]
    
    B["2. CREATE JOBS<br/>━━━━━━━━━━━━━━━━━━<br/>📋 Job title & description<br/>🎯 Set ideal OCEAN traits<br/>⚖️ Define trait weights"]
    
    C["3. REVIEW APPLICATIONS<br/>━━━━━━━━━━━━━━━━━━<br/>👥 View all candidates<br/>🔍 Filter by job/status<br/>📈 See match scores"]
    
    D["4. VIEW ASSESSMENT<br/>━━━━━━━━━━━━━━━━━━<br/>😊 Emotion timeline<br/>🧠 OCEAN percentiles<br/>📊 EQ score<br/>🎯 Job match %"]
    
    E["5. MAKE DECISION<br/>━━━━━━━━━━━━━━━━━━<br/>✅ Select candidate<br/>❌ Reject candidate"]

    A --> B --> C --> D --> E

    style A fill:#1e1b4b,stroke:#8338ec,stroke-width:2px,color:#fff
    style B fill:#0c4a6e,stroke:#0ea5e9,stroke-width:2px,color:#fff
    style C fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#fff
    style D fill:#831843,stroke:#ec4899,stroke-width:2px,color:#fff
    style E fill:#14532d,stroke:#22c55e,stroke-width:2px,color:#fff
```

---

## Horizontal with Phases

```mermaid
flowchart LR
    subgraph Access["ACCESS"]
        A["1️⃣ Login"]
    end

    subgraph Manage["MANAGE"]
        B["2️⃣ Create<br/>Jobs"]
    end

    subgraph Review["REVIEW"]
        C["3️⃣ View<br/>Applications"]
        D["4️⃣ Assessment<br/>Details"]
    end

    subgraph Action["ACTION"]
        E["5️⃣ Select /<br/>Reject"]
    end

    A --> B --> C --> D --> E

    style Access fill:#4c1d95,stroke:#8b5cf6,color:#fff
    style Manage fill:#1e3a5f,stroke:#0ea5e9,color:#fff
    style Review fill:#7c2d12,stroke:#f97316,color:#fff
    style Action fill:#14532d,stroke:#22c55e,color:#fff
```

---

## Decision Flow with Branches

```mermaid
flowchart TB
    A[1. Admin Login] --> B[2. Create Jobs]
    B --> C[3. Review Applications]
    C --> D[4. View Assessment]
    
    D --> E{5. Decision}
    
    E -->|"✅ Good Match"| F[SELECT]
    E -->|"❌ Poor Match"| G[REJECT]
    
    F --> H[Candidate Notified]
    G --> H

    style A fill:#8338ec,stroke:#fff,color:#fff
    style B fill:#0ea5e9,stroke:#fff,color:#fff
    style C fill:#f97316,stroke:#fff,color:#fff
    style D fill:#ec4899,stroke:#fff,color:#fff
    style E fill:#fbbf24,stroke:#fff,color:#000
    style F fill:#22c55e,stroke:#fff,color:#fff
    style G fill:#ef4444,stroke:#fff,color:#fff
    style H fill:#64748b,stroke:#fff,color:#fff
```

---

## Admin Dashboard Overview

```mermaid
flowchart TB
    subgraph Dashboard["ADMIN DASHBOARD"]
        STATS["📊 Statistics<br/>Jobs • Applications • Selections"]
        
        subgraph Actions["Quick Actions"]
            A1["Create Job"]
            A2["Review Candidates"]
            A3["View Analytics"]
        end
    end

    subgraph Flow["Hiring Flow"]
        F1["Create Job<br/>+ Requirements"]
        F2["Candidates<br/>Apply"]
        F3["Review<br/>Assessments"]
        F4["Make<br/>Decision"]
    end

    Dashboard --> Flow
    F1 --> F2 --> F3 --> F4

    style Dashboard fill:#1e1b4b,stroke:#8338ec,color:#fff
    style Flow fill:#0f172a,stroke:#0ea5e9,color:#fff
```

---

## ASCII Box Version (For PPT)

```
┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN JOURNEY                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │ 1. LOGIN     │────────►│ 2. CREATE    │                      │
│  │              │         │    JOBS      │                      │
│  │ Admin portal │         │ • Title      │                      │
│  │              │         │ • OCEAN reqs │                      │
│  └──────────────┘         └──────┬───────┘                      │
│                                  │                               │
│                                  ▼                               │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │ 3. REVIEW    │◄────────│ Candidates   │                      │
│  │ APPLICATIONS │         │ Apply        │                      │
│  │              │         │              │                      │
│  │ • All users  │         └──────────────┘                      │
│  │ • Filter     │                                               │
│  │ • Match %    │                                               │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │ 4. VIEW      │────────►│ 5. DECISION  │                      │
│  │ ASSESSMENT   │         │              │                      │
│  │              │         │ ┌──────────┐ │                      │
│  │ • Emotions   │         │ │ ✅ SELECT │ │                      │
│  │ • OCEAN      │         │ └──────────┘ │                      │
│  │ • EQ Score   │         │ ┌──────────┐ │                      │
│  │ • Match %    │         │ │ ❌ REJECT │ │                      │
│  └──────────────┘         │ └──────────┘ │                      │
│                           └──────────────┘                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary Table

| Step | Action | Details |
|------|--------|---------|
| 1 | Login | Access admin portal with credentials |
| 2 | Create Jobs | Define positions, set OCEAN trait requirements |
| 3 | Review Applications | View all candidates, filter by job/status |
| 4 | View Assessment | See emotion analysis, OCEAN scores, match % |
| 5 | Decision | Select or reject candidates |
