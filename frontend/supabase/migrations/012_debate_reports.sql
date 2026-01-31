-- =============================================
-- Debate Reports (growth report)
-- =============================================

CREATE TABLE IF NOT EXISTS debate_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  logic_score INTEGER,
  persuasion_score INTEGER,
  topic_score INTEGER,
  summary TEXT,
  improvement_tips JSONB,
  ocr_alignment_score INTEGER,
  ocr_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_debate_reports_session_id ON debate_reports(session_id);
CREATE INDEX IF NOT EXISTS idx_debate_reports_user_id ON debate_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_debate_reports_created_at ON debate_reports(created_at DESC);

ALTER TABLE debate_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "debate_reports_select_policy" ON debate_reports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "debate_reports_insert_policy" ON debate_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
