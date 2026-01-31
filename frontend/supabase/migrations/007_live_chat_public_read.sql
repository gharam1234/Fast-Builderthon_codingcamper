-- =============================================
-- Allow public read for live chat messages (audience view)
-- =============================================

DROP POLICY IF EXISTS "live_chat_messages_select_policy" ON live_chat_messages;

CREATE POLICY "live_chat_messages_select_policy" ON live_chat_messages
  FOR SELECT
  USING (true);
