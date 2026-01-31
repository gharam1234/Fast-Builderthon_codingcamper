-- =============================================
-- Live chat rate limit (per user, per room)
-- =============================================

CREATE OR REPLACE FUNCTION public.enforce_live_chat_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  last_message_at TIMESTAMPTZ;
BEGIN
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;

  SELECT created_at INTO last_message_at
  FROM public.live_chat_messages
  WHERE user_id = NEW.user_id
    AND room_id = NEW.room_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF last_message_at IS NOT NULL AND NEW.created_at < last_message_at + interval '2 seconds' THEN
    RAISE EXCEPTION 'rate_limit';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_live_chat_rate_limit ON live_chat_messages;
CREATE TRIGGER enforce_live_chat_rate_limit
  BEFORE INSERT ON live_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_live_chat_rate_limit();
