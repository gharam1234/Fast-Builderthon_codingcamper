-- =============================================
-- Live room participants count helper
-- =============================================

CREATE OR REPLACE FUNCTION public.get_live_room_participants(
  room_ids TEXT[],
  since_minutes INTEGER DEFAULT 10
)
RETURNS TABLE (
  room_id TEXT,
  participant_count INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    room_id,
    COUNT(DISTINCT user_id) AS participant_count
  FROM public.live_chat_messages
  WHERE room_id = ANY(room_ids)
    AND user_id IS NOT NULL
    AND created_at >= NOW() - (since_minutes || ' minutes')::interval
  GROUP BY room_id;
$$;
