-- =============================================
-- Task 1.3: Helper Functions (Edge Functions 지원)
-- =============================================

-- =============================================
-- 1. 토큰 적립량 증가 함수 (세션용)
-- =============================================
CREATE OR REPLACE FUNCTION increment_tokens_earned(session_id UUID, token_amount INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_total INTEGER;
BEGIN
  UPDATE debate_sessions
  SET tokens_earned = tokens_earned + token_amount
  WHERE id = session_id
  RETURNING tokens_earned INTO new_total;
  
  RETURN new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 2. 기간별 랭킹 조회 함수
-- =============================================
CREATE OR REPLACE FUNCTION get_leaderboard_by_period(
  start_date TIMESTAMPTZ,
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
  WITH token_sums AS (
    SELECT 
      tt.user_id,
      SUM(tt.amount) as period_tokens
    FROM token_transactions tt
    WHERE tt.created_at >= start_date
    GROUP BY tt.user_id
  ),
  debate_counts AS (
    SELECT 
      ds.user_id,
      COUNT(*) as count
    FROM debate_sessions ds
    WHERE ds.started_at >= start_date
    AND ds.status = 'completed'
    GROUP BY ds.user_id
  )
  SELECT 
    ROW_NUMBER() OVER (ORDER BY COALESCE(ts.period_tokens, 0) DESC) + result_offset as rank,
    p.id as user_id,
    p.username,
    p.avatar_url,
    COALESCE(ts.period_tokens, 0)::BIGINT as total_tokens,
    COALESCE(dc.count, 0)::BIGINT as debate_count
  FROM profiles p
  LEFT JOIN token_sums ts ON p.id = ts.user_id
  LEFT JOIN debate_counts dc ON p.id = dc.user_id
  WHERE COALESCE(ts.period_tokens, 0) > 0
  ORDER BY total_tokens DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. 사용자 통계 조회 함수
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
    (SELECT COUNT(*) FROM debate_sessions WHERE user_id = target_user_id)::BIGINT as total_debates,
    (SELECT COUNT(*) FROM debate_sessions WHERE user_id = target_user_id AND status = 'completed')::BIGINT as completed_debates,
    (SELECT COUNT(*) FROM debate_messages dm 
     JOIN debate_sessions ds ON dm.session_id = ds.id 
     WHERE ds.user_id = target_user_id AND dm.sender = 'user')::BIGINT as total_messages,
    (SELECT COUNT(*) + 1 FROM profiles WHERE total_tokens > p.total_tokens)::BIGINT as global_rank
  FROM profiles p
  WHERE p.id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
