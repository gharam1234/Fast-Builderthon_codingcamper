# Task 1.3: Supabase 스키마 설계

## 📋 현재 상태 (2026-01-31)

### ✅ 완료된 항목
- ✅ 프론트엔드 타입 시스템 (UserProfile 포함)
- ✅ 백엔드 FastAPI 기본 구조
- ✅ 프론트엔드-백엔드 API 통합 계층

### 🔄 진행 중인 항목
- 🔄 **Supabase 데이터베이스 스키마** (이 파일)
- 🔄 **인증 시스템 연동** (task-4.1)
- 🔄 **토론 히스토리 저장** (task-4.2)

---

## 🎯 목표

**Supabase 데이터베이스 설계**: 사용자 프로필, 토론 세션, 메시지, 토큰 테이블 구조화

---

## 📊 데이터베이스 스키마

### 1. Profiles 테이블 (사용자 프로필)

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  nickname TEXT NOT NULL,        -- 사용자 닉네임
  email TEXT NOT NULL,
  interest TEXT,                 -- 관심사 (e.g., "React", "Python")
  level TEXT DEFAULT 'beginner', -- 수준: beginner, intermediate, advanced
  avatar_url TEXT,
  total_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**특징**:
- `auth.users`와 자동 연동
- `nickname`, `email`, `interest`, `level` - 백엔드에서 시스템 프롬프트 생성에 사용

### 2. Debate_Sessions 테이블

```sql
CREATE TABLE debate_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lecture_id TEXT NOT NULL,
  lecture_title TEXT NOT NULL,
  lecture_context TEXT,          -- 강의 내용 (AI 시스템 프롬프트용)
  tokens_earned INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active',  -- 'active' | 'completed' | 'abandoned'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_debate_sessions_user_id ON debate_sessions(user_id);
```

### 3. Debate_Messages 테이블

```sql
CREATE TABLE debate_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES debate_sessions(id) ON DELETE CASCADE NOT NULL,
  sender TEXT NOT NULL,          -- 'user' | 'james' | 'linda' | 'system'
  content TEXT NOT NULL,
  audio_url TEXT,                -- TTS 음성 URL
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_debate_messages_session_id ON debate_messages(session_id);
```

### 4. Token_Transactions 테이블

```sql
CREATE TABLE token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES debate_sessions(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT, -- 'debate_participation', 'long_message', 'question_asked', 'streak_bonus'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_token_transactions_user_id ON token_transactions(user_id);
```

---

## 🔐 RLS (Row Level Security) 정책

### Profiles RLS
```sql
-- 자신의 프로필만 조회/수정 가능
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);
```

### Debate_Sessions RLS
```sql
-- 자신의 세션만 접근
CREATE POLICY "Users can view their own sessions" 
  ON debate_sessions FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create sessions" 
  ON debate_sessions FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions" 
  ON debate_sessions FOR UPDATE USING (user_id = auth.uid());
```

### Debate_Messages RLS
```sql
-- 세션 소유자만 메시지 접근
CREATE POLICY "Users can view messages from their sessions" 
  ON debate_messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM debate_sessions 
      WHERE debate_sessions.id = debate_messages.session_id 
      AND debate_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their sessions" 
  ON debate_messages FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM debate_sessions 
      WHERE debate_sessions.id = debate_messages.session_id 
      AND debate_sessions.user_id = auth.uid()
    )
  );
```

---

## ⚙️ SQL Functions (Atomic 업데이트)

### increment_tokens 함수

```sql
CREATE OR REPLACE FUNCTION increment_tokens(
  user_id UUID,
  amount INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  new_total INTEGER;
BEGIN
  UPDATE profiles
  SET total_tokens = total_tokens + amount
  WHERE id = user_id
  RETURNING total_tokens INTO new_total;
  
  RETURN new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 프로필 자동 생성 Trigger

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    nickname,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 💾 Supabase 클라이언트 설정

### lib/supabase.ts
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// 클라이언트 컴포넌트용
export const supabase = createClientComponentClient();

// 서버 컴포넌트용
export const createServerClient = () => {
  return createServerComponentClient({ cookies });
};
```

### 타입 정의 (types/index.ts)
```typescript
// Supabase 테이블 타입
export interface Profile {
  id: string;
  nickname: string;
  email: string;
  interest?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  avatar_url?: string;
  total_tokens: number;
  created_at: string;
  updated_at: string;
}

export interface DebateSession {
  id: string;
  user_id: string;
  lecture_id: string;
  lecture_title: string;
  lecture_context?: string;
  tokens_earned: number;
  started_at: string;
  ended_at?: string;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
}

export interface DebateMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'james' | 'linda' | 'system';
  content: string;
  audio_url?: string;
  created_at: string;
}

export interface TokenTransaction {
  id: string;
  user_id: string;
  session_id?: string;
  amount: number;
  reason: string;
  created_at: string;
}
```

---

## 🚀 배포 단계

### Step 1: Supabase 프로젝트 생성
1. [supabase.com](https://supabase.com) 접속
2. "New Project" 클릭
3. Database Password 설정
4. Region: Asia-Pacific (Tokyo) 권장

### Step 2: SQL 스크립트 실행
Supabase Dashboard > SQL Editor에서:
1. 위의 CREATE TABLE 문 실행
2. RLS 정책 실행
3. Trigger 및 Function 실행

### Step 3: 환경변수 설정
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Step 4: 인증 설정
Supabase Dashboard > Authentication > Providers
- Email 활성화
- Google OAuth (선택)

---

## ✅ 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] 4개 테이블 생성
- [ ] RLS 정책 설정
- [ ] SQL Functions 생성
- [ ] 트리거 생성
- [ ] 환경변수 설정
- [ ] 타입 정의 확인

---

## 📚 참고 문서

- `INTEGRATION_GUIDE.md` - 프론트엔드-백엔드 통합
- `task-4.1-supabase-auth.md` - 인증 연동
- `task-4.2-debate-history.md` - 히스토리 저장

---

**상태**: 🟡 Phase 1 진행 중 (데이터베이스 설계)
**다음**: Phase 4.1 (인증 연동)
**최종 업데이트**: 2026-01-31
