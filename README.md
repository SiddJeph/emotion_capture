# Emotion Capture - AI Hiring Platform

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
