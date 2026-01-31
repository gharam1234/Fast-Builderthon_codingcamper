-- =============================================
-- Auto-end live battle rooms via pg_cron
-- =============================================

-- Enable pg_cron (Supabase supports this extension)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function to end expired rooms
CREATE OR REPLACE FUNCTION public.end_expired_live_rooms()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.live_battle_rooms
  SET status = 'ended',
      updated_at = NOW()
  WHERE status = 'live'
    AND ends_at IS NOT NULL
    AND ends_at <= NOW();
$$;

-- Schedule every minute
SELECT
  cron.schedule(
    'end-expired-live-rooms',
    '* * * * *',
    $$SELECT public.end_expired_live_rooms();$$
  )
ON CONFLICT (jobname) DO NOTHING;
