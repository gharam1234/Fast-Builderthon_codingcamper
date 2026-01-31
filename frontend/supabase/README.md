# Supabase 스키마 설정 가이드

이 문서는 Task 1.3에서 생성된 Supabase 스키마를 설정하는 방법을 설명합니다.

## 📁 생성된 파일

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql     # 테이블 스키마
│   ├── 002_rls_policies.sql       # RLS 보안 정책
│   └── 003_helper_functions.sql   # 헬퍼 함수
└── functions/
    ├── add-tokens/
    │   └── index.ts               # 토큰 적립 Edge Function
    └── get-leaderboard/
        └── index.ts               # 랭킹 조회 Edge Function
```

## 🚀 설정 방법

### 1. Supabase 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호 설정
4. Region 선택 (한국 사용자는 Northeast Asia 추천)

### 2. 데이터베이스 스키마 적용

Supabase Dashboard의 SQL Editor에서 순서대로 실행:

```bash
# 1. 기본 스키마
supabase/migrations/001_initial_schema.sql

# 2. RLS 정책
supabase/migrations/002_rls_policies.sql

# 3. 헬퍼 함수
supabase/migrations/003_helper_functions.sql
```

### 3. 환경 변수 설정

`.env.local` 파일에 추가:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

API Keys는 Supabase Dashboard > Settings > API에서 확인

### 4. Authentication 설정

Dashboard > Authentication > Providers:

- **Google** 활성화 (권장)
  - Google Cloud Console에서 OAuth 자격 증명 생성
  - Client ID, Client Secret 입력
  - Redirect URL: `https://<project>.supabase.co/auth/v1/callback`

### 5. Edge Functions 배포 (선택)

Supabase CLI 사용:

```bash
# CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref <your-project-ref>

# Functions 배포
supabase functions deploy add-tokens
supabase functions deploy get-leaderboard
```

## 📊 테이블 구조

### profiles
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | auth.users 참조 (PK) |
| username | TEXT | 유니크 사용자명 |
| avatar_url | TEXT | 프로필 이미지 URL |
| total_tokens | INTEGER | 총 토큰 수 |
| created_at | TIMESTAMPTZ | 생성 시간 |
| updated_at | TIMESTAMPTZ | 수정 시간 |

### debate_sessions
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 세션 ID (PK) |
| user_id | UUID | profiles 참조 |
| lecture_id | TEXT | 강의 ID |
| lecture_title | TEXT | 강의 제목 |
| topic | TEXT | 토론 주제 |
| tokens_earned | INTEGER | 획득 토큰 |
| started_at | TIMESTAMPTZ | 시작 시간 |
| ended_at | TIMESTAMPTZ | 종료 시간 |
| status | TEXT | active/completed/abandoned |

### debate_messages
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 메시지 ID (PK) |
| session_id | UUID | debate_sessions 참조 |
| sender | TEXT | user/james/linda/system |
| content | TEXT | 메시지 내용 |
| audio_url | TEXT | 음성 URL (선택) |
| created_at | TIMESTAMPTZ | 생성 시간 |

### token_transactions
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 트랜잭션 ID (PK) |
| user_id | UUID | profiles 참조 |
| session_id | UUID | debate_sessions 참조 (선택) |
| amount | INTEGER | 토큰 양 |
| reason | TEXT | 적립 사유 |
| created_at | TIMESTAMPTZ | 생성 시간 |

## 🔐 RLS 정책

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| profiles | 전체 | 본인만 | 본인만 | - |
| debate_sessions | 본인만 | 본인만 | 본인만 | 본인만 |
| debate_messages | 세션소유자 | 세션소유자 | 세션소유자 | 세션소유자 |
| token_transactions | 본인만 | 본인만 | - | - |

## 🛠️ 사용 예시

```typescript
import { 
  supabase,
  createDebateSession,
  addDebateMessage,
  addTokens,
  getLeaderboard 
} from '@/lib/supabase'

// 토론 세션 생성
const session = await createDebateSession(
  'lecture-1',
  'AI와 윤리',
  '인공지능은 인간의 일자리를 대체해야 하는가?'
)

// 메시지 추가
await addDebateMessage(
  session.id,
  'user',
  '저는 AI가 인간의 일자리를 보완해야 한다고 생각합니다.'
)

// 토큰 적립
await addTokens(10, 'debate_participation', session.id)

// 랭킹 조회
const { leaderboard } = await getLeaderboard(10, 0, 'weekly')
```

## ✅ 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] SQL 스키마 실행 (001, 002, 003)
- [ ] 환경 변수 설정
- [ ] Google OAuth 설정
- [ ] Edge Functions 배포 (선택)
- [ ] 테스트 데이터 생성

## 🔗 관련 문서

- [Supabase 공식 문서](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions](https://supabase.com/docs/guides/functions)
