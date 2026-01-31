-- =============================================
-- Enable Realtime for live_chat_messages table
-- =============================================

-- Set REPLICA IDENTITY to FULL for realtime to work properly
ALTER TABLE live_chat_messages REPLICA IDENTITY FULL;

-- Add table to supabase_realtime publication
-- This allows postgres_changes to broadcast INSERT/UPDATE/DELETE events
ALTER PUBLICATION supabase_realtime ADD TABLE live_chat_messages;
