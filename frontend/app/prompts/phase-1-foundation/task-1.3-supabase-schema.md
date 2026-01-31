# Task 1.3: Supabase 스키마 설계

## 목표
사용자, 토론 세션, 토큰 테이블 설계

---

## 프롬프트

```
Supabase 데이터베이스 스키마를 설계해줘. 요구사항:

1. 테이블 구조:

-- 사용자 프로필 (auth.users 확장)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  total_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 토론 세션
CREATE TABLE debate_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  lecture_id TEXT NOT NULL,
  lecture_title TEXT NOT NULL,
  topic TEXT,
  tokens_earned INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' -- active, completed, abandoned
);

-- 토론 메시지
CREATE TABLE debate_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES debate_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- 'user', 'james', 'linda', 'system'
  content TEXT NOT NULL,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 토큰 히스토리
CREATE TABLE token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  session_id UUID REFERENCES debate_sessions(id),
  amount INTEGER NOT NULL,
  reason TEXT, -- 'debate_participation', 'good_argument', 'streak_bonus'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

2. RLS (Row Level Security) 정책:
   - profiles: 자신의 프로필만 읽기/수정
   - debate_sessions: 자신의 세션만 접근
   - debate_messages: 세션 소유자만 접근

3. Edge Functions 스텁:
   - add-tokens: 토큰 적립 함수
   - get-leaderboard: 랭킹 조회

4. Supabase 클라이언트 초기화 코드 (lib/supabase.ts)
```

---

## 예상 결과물

- SQL 마이그레이션 파일
- RLS 정책 SQL
- `/lib/supabase.ts` - 클라이언트 초기화
- TypeScript 타입 정의

## Supabase 대시보드 설정
1. Project 생성
2. SQL Editor에서 스키마 실행
3. Authentication > Providers 설정
4. API Keys 복사

## 예상 시간
약 30분
