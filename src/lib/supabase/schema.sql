-- Emotion Capture Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the candidate_responses table
CREATE TABLE IF NOT EXISTS candidate_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    video_id TEXT NOT NULL,
    raw_timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_candidate_responses_user_id ON candidate_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_responses_video_id ON candidate_responses(video_id);
CREATE INDEX IF NOT EXISTS idx_candidate_responses_created_at ON candidate_responses(created_at DESC);

-- Enable Row Level Security
ALTER TABLE candidate_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own responses
CREATE POLICY "Users can view own responses" ON candidate_responses
    FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Users can insert their own responses
CREATE POLICY "Users can insert own responses" ON candidate_responses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Allow anonymous insertions (for demo purposes)
CREATE POLICY "Allow anonymous insertions" ON candidate_responses
    FOR INSERT
    WITH CHECK (user_id IS NULL);

-- Grant permissions
GRANT ALL ON candidate_responses TO authenticated;
GRANT INSERT, SELECT ON candidate_responses TO anon;

-- Sample query to get emotion statistics for a video
-- SELECT 
--     video_id,
--     summary->>'dominantEmotion' as dominant_emotion,
--     (summary->>'averageConfidence')::float as avg_confidence,
--     COUNT(*) as response_count
-- FROM candidate_responses
-- GROUP BY video_id, summary->>'dominantEmotion', summary->>'averageConfidence';




