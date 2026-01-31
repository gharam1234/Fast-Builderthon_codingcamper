-- 004_token_functions.sql
-- 토큰 보상 시스템 관련 SQL 함수들

-- =============================================
-- 토큰 증가 함수 (Atomic)
-- =============================================
CREATE OR REPLACE FUNCTION increment_user_tokens(
  target_user_id UUID,
  token_amount INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  new_total INTEGER;
BEGIN
  UPDATE profiles
  SET 
    total_tokens = total_tokens + token_amount,
    updated_at = NOW()
  WHERE id = target_user_id
  RETURNING total_tokens INTO new_total;
  
  RETURN COALESCE(new_total, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 세션 토큰 증가 함수
-- =============================================
CREATE OR REPLACE FUNCTION increment_tokens_earned(
  target_session_id UUID,
  token_amount INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  new_total INTEGER;
BEGIN
  UPDATE debate_sessions
  SET tokens_earned = tokens_earned + token_amount
  WHERE id = target_session_id
  RETURNING tokens_earned INTO new_total;
  
  RETURN COALESCE(new_total, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 사용자 통계 조회 함수
-- =============================================
CREATE OR REPLACE FUNCTION get_user_stats(target_user_id UUID)
RETURNS TABLE (
  total_tokens INTEGER,
  total_debates BIGINT,
  completed_debates BIGINT,
  total_messages BIGINT,
  global_rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.total_tokens,
    COUNT(DISTINCT ds.id) AS total_debates,
    COUNT(DISTINCT ds.id) FILTER (WHERE ds.status = 'completed') AS completed_debates,
    COUNT(dm.id) AS total_messages,
    (
      SELECT COUNT(*) + 1
      FROM profiles p2
      WHERE p2.total_tokens > p.total_tokens
    ) AS global_rank
  FROM profiles p
  LEFT JOIN debate_sessions ds ON ds.user_id = p.id
  LEFT JOIN debate_messages dm ON dm.session_id = ds.id AND dm.sender = 'user'
  WHERE p.id = target_user_id
  GROUP BY p.id, p.total_tokens;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 기간별 리더보드 조회 함수
-- =============================================
CREATE OR REPLACE FUNCTION get_leaderboard_by_period(
  start_date TIMESTAMP DEFAULT '1970-01-01',
  result_limit INTEGER DEFAULT 10,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  total_tokens BIGINT,
  debate_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY SUM(tt.amount) DESC) AS rank,
    p.id AS user_id,
    p.username,
    p.avatar_url,
    COALESCE(SUM(tt.amount), 0)::BIGINT AS total_tokens,
    COUNT(DISTINCT ds.id)::BIGINT AS debate_count
  FROM profiles p
  LEFT JOIN token_transactions tt ON tt.user_id = p.id AND tt.created_at >= start_date
  LEFT JOIN debate_sessions ds ON ds.user_id = p.id AND ds.started_at >= start_date
  GROUP BY p.id, p.username, p.avatar_url
  HAVING COALESCE(SUM(tt.amount), 0) > 0
  ORDER BY total_tokens DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 일일 첫 토론 여부 확인 함수
-- =============================================
CREATE OR REPLACE FUNCTION is_first_debate_of_day(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM debate_sessions
    WHERE user_id = target_user_id
      AND status = 'completed'
      AND DATE(ended_at) = CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 첫 토론 여부 확인 함수
-- =============================================
CREATE OR REPLACE FUNCTION is_first_debate(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM debate_sessions
    WHERE user_id = target_user_id
      AND status = 'completed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 연속 출석 일수 계산 함수
-- =============================================
CREATE OR REPLACE FUNCTION get_streak_days(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_debate BOOLEAN;
BEGIN
  LOOP
    -- 해당 날짜에 완료된 토론이 있는지 확인
    SELECT EXISTS (
      SELECT 1 FROM debate_sessions
      WHERE user_id = target_user_id
        AND status = 'completed'
        AND DATE(ended_at) = check_date
    ) INTO has_debate;
    
    -- 토론이 없으면 루프 종료
    IF NOT has_debate THEN
      EXIT;
    END IF;
    
    -- 스트릭 카운트 증가
    streak := streak + 1;
    
    -- 이전 날짜로 이동
    check_date := check_date - INTERVAL '1 day';
    
    -- 최대 30일까지만 체크
    IF streak >= 30 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 토큰 트랜잭션 생성 및 프로필 업데이트 (Atomic)
-- =============================================
CREATE OR REPLACE FUNCTION add_tokens_with_transaction(
  target_user_id UUID,
  token_amount INTEGER,
  token_reason TEXT,
  target_session_id UUID DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  new_total INTEGER,
  transaction_id UUID
) AS $$
DECLARE
  new_total_tokens INTEGER;
  new_transaction_id UUID;
BEGIN
  -- 프로필 토큰 업데이트
  UPDATE profiles
  SET 
    total_tokens = total_tokens + token_amount,
    updated_at = NOW()
  WHERE id = target_user_id
  RETURNING total_tokens INTO new_total_tokens;
  
  -- 트랜잭션 기록 생성
  INSERT INTO token_transactions (
    user_id,
    session_id,
    amount,
    reason
  ) VALUES (
    target_user_id,
    target_session_id,
    token_amount,
    token_reason::token_reason
  )
  RETURNING id INTO new_transaction_id;
  
  -- 세션이 있으면 세션의 tokens_earned도 업데이트
  IF target_session_id IS NOT NULL THEN
    UPDATE debate_sessions
    SET tokens_earned = tokens_earned + token_amount
    WHERE id = target_session_id;
  END IF;
  
  RETURN QUERY SELECT TRUE, new_total_tokens, new_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 주간/월간 랭킹 시작 날짜 계산 헬퍼
-- =============================================
CREATE OR REPLACE FUNCTION get_period_start_date(period_type TEXT)
RETURNS TIMESTAMP AS $$
BEGIN
  CASE period_type
    WHEN 'weekly' THEN
      RETURN DATE_TRUNC('week', CURRENT_DATE)::TIMESTAMP;
    WHEN 'monthly' THEN
      RETURN DATE_TRUNC('month', CURRENT_DATE)::TIMESTAMP;
    ELSE
      RETURN '1970-01-01'::TIMESTAMP;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- 사용자 업적 체크 함수
-- =============================================
CREATE OR REPLACE FUNCTION check_user_achievements(target_user_id UUID)
RETURNS TABLE (
  achievement_type TEXT,
  achieved BOOLEAN,
  progress INTEGER,
  target INTEGER
) AS $$
DECLARE
  completed_count INTEGER;
  streak_days INTEGER;
BEGIN
  -- 완료된 토론 수
  SELECT COUNT(*) INTO completed_count
  FROM debate_sessions
  WHERE user_id = target_user_id AND status = 'completed';
  
  -- 연속 출석 일수
  SELECT get_streak_days(target_user_id) INTO streak_days;
  
  -- 첫 토론 완료
  RETURN QUERY SELECT 'first_debate'::TEXT, completed_count >= 1, LEAST(completed_count, 1), 1;
  
  -- 토론 마스터 (10회)
  RETURN QUERY SELECT 'debate_master'::TEXT, completed_count >= 10, LEAST(completed_count, 10), 10;
  
  -- 토론 전문가 (50회)
  RETURN QUERY SELECT 'debate_expert'::TEXT, completed_count >= 50, LEAST(completed_count, 50), 50;
  
  -- 7일 연속 참여
  RETURN QUERY SELECT 'weekly_streak'::TEXT, streak_days >= 7, LEAST(streak_days, 7), 7;
  
  -- 30일 연속 참여
  RETURN QUERY SELECT 'monthly_streak'::TEXT, streak_days >= 30, LEAST(streak_days, 30), 30;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
