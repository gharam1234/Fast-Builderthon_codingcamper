-- =============================================
-- Live Chat Messages (Audience Chat)
-- =============================================

CREATE TABLE IF NOT EXISTS live_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  username TEXT,
  text TEXT NOT NULL,
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_chat_room_id ON live_chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_created_at ON live_chat_messages(created_at DESC);

ALTER TABLE live_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "live_chat_messages_select_policy" ON live_chat_messages
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "live_chat_messages_insert_policy" ON live_chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "live_chat_messages_delete_policy" ON live_chat_messages
  FOR DELETE
  USING (auth.uid() = user_id);
