-- =============================================
-- Live Battle Rooms (Audience Listing)
-- =============================================

CREATE TABLE IF NOT EXISTS live_battle_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT DEFAULT 'live' CHECK (status IN ('live', 'ended')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_battle_rooms_status ON live_battle_rooms(status);
CREATE INDEX IF NOT EXISTS idx_live_battle_rooms_created_at ON live_battle_rooms(created_at DESC);

ALTER TABLE live_battle_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "live_battle_rooms_select_policy" ON live_battle_rooms
  FOR SELECT
  USING (true);

CREATE POLICY "live_battle_rooms_insert_policy" ON live_battle_rooms
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "live_battle_rooms_update_policy" ON live_battle_rooms
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- updated_at 트리거
CREATE TRIGGER update_live_battle_rooms_updated_at
  BEFORE UPDATE ON live_battle_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
