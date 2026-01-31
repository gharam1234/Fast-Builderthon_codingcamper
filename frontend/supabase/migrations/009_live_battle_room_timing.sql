-- =============================================
-- Live battle room timing (duration + ends_at)
-- =============================================

ALTER TABLE live_battle_rooms
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 3000,
  ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION set_live_room_ends_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.duration_seconds IS NULL THEN
    NEW.duration_seconds := 3000;
  END IF;

  IF NEW.ends_at IS NULL THEN
    NEW.ends_at := NOW() + (NEW.duration_seconds || ' seconds')::interval;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_live_room_ends_at ON live_battle_rooms;
CREATE TRIGGER set_live_room_ends_at
  BEFORE INSERT ON live_battle_rooms
  FOR EACH ROW
  EXECUTE FUNCTION set_live_room_ends_at();
