-- =============================================
-- Task 1.3: Supabase 스키마 설계
-- 사용자, 토론 세션, 토큰 테이블
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. 사용자 프로필 테이블 (auth.users 확장)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  total_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 프로필 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_total_tokens ON profiles(total_tokens DESC);

-- =============================================
-- 2. 토론 세션 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS debate_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lecture_id TEXT NOT NULL,
  lecture_title TEXT NOT NULL,
  topic TEXT,
  tokens_earned INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned'))
);

-- 토론 세션 인덱스
CREATE INDEX IF NOT EXISTS idx_debate_sessions_user_id ON debate_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_debate_sessions_lecture_id ON debate_sessions(lecture_id);
CREATE INDEX IF NOT EXISTS idx_debate_sessions_status ON debate_sessions(status);
CREATE INDEX IF NOT EXISTS idx_debate_sessions_started_at ON debate_sessions(started_at DESC);

-- =============================================
-- 3. 토론 메시지 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS debate_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES debate_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'james', 'linda', 'system')),
  content TEXT NOT NULL,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 토론 메시지 인덱스
CREATE INDEX IF NOT EXISTS idx_debate_messages_session_id ON debate_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_debate_messages_created_at ON debate_messages(created_at);

-- =============================================
-- 4. 토큰 히스토리 테이블
-- =============================================
CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES debate_sessions(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  reason TEXT CHECK (reason IN ('debate_participation', 'good_argument', 'streak_bonus', 'daily_bonus', 'achievement', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 토큰 트랜잭션 인덱스
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_session_id ON token_transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON token_transactions(created_at DESC);

-- =============================================
-- 5. 자동 업데이트 트리거 함수
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles 테이블에 트리거 적용
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. 새 유저 가입 시 프로필 자동 생성 함수
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users 테이블에 트리거 적용
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 7. 토큰 적립 시 프로필 업데이트 함수
-- =============================================
CREATE OR REPLACE FUNCTION update_user_tokens()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET total_tokens = total_tokens + NEW.amount
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- token_transactions 테이블에 트리거 적용
CREATE TRIGGER on_token_transaction_created
  AFTER INSERT ON token_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_tokens();
