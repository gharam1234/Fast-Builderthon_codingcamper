-- =============================================
-- Task 1.3: RLS (Row Level Security) 정책
-- =============================================

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 1. Profiles 테이블 RLS 정책
-- =============================================

-- 모든 사용자가 프로필 읽기 가능 (리더보드용)
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT
  USING (true);

-- 자신의 프로필만 수정 가능
CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 자신의 프로필만 삽입 가능
CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================
-- 2. Debate Sessions 테이블 RLS 정책
-- =============================================

-- 자신의 세션만 조회 가능
CREATE POLICY "debate_sessions_select_policy" ON debate_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- 자신의 세션만 생성 가능
CREATE POLICY "debate_sessions_insert_policy" ON debate_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 자신의 세션만 수정 가능
CREATE POLICY "debate_sessions_update_policy" ON debate_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 자신의 세션만 삭제 가능
CREATE POLICY "debate_sessions_delete_policy" ON debate_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 3. Debate Messages 테이블 RLS 정책
-- =============================================

-- 세션 소유자만 메시지 조회 가능
CREATE POLICY "debate_messages_select_policy" ON debate_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM debate_sessions
      WHERE debate_sessions.id = debate_messages.session_id
      AND debate_sessions.user_id = auth.uid()
    )
  );

-- 세션 소유자만 메시지 삽입 가능
CREATE POLICY "debate_messages_insert_policy" ON debate_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM debate_sessions
      WHERE debate_sessions.id = debate_messages.session_id
      AND debate_sessions.user_id = auth.uid()
    )
  );

-- 세션 소유자만 메시지 수정 가능
CREATE POLICY "debate_messages_update_policy" ON debate_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM debate_sessions
      WHERE debate_sessions.id = debate_messages.session_id
      AND debate_sessions.user_id = auth.uid()
    )
  );

-- 세션 소유자만 메시지 삭제 가능
CREATE POLICY "debate_messages_delete_policy" ON debate_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM debate_sessions
      WHERE debate_sessions.id = debate_messages.session_id
      AND debate_sessions.user_id = auth.uid()
    )
  );

-- =============================================
-- 4. Token Transactions 테이블 RLS 정책
-- =============================================

-- 자신의 토큰 내역만 조회 가능
CREATE POLICY "token_transactions_select_policy" ON token_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- 서비스 역할만 토큰 삽입 가능 (Edge Function에서 처리)
-- 일반 사용자는 직접 토큰 생성 불가
CREATE POLICY "token_transactions_insert_policy" ON token_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 토큰 내역은 수정/삭제 불가 (무결성 유지)
-- UPDATE, DELETE 정책 없음
