# Task 1.1: Frontend 프로젝트 셋업 (완료 + 리팩토링)

## 📋 현재 상태 (2026-01-31)

### ✅ 완료된 항목
- ✅ Next.js 14 + TypeScript + Tailwind CSS 프로젝트 생성
- ✅ **Phase 1-4 리팩토링 완료**
  - 타입 중앙화 (`frontend/types/`)
  - Custom Hooks 추출 (`frontend/hooks/`)
  - 컴포넌트 분해 (`frontend/components/chat/`, `arena/`)
  - 상태 관리 전문화 (`frontend/components/providers/`)
- ✅ Tailwind CSS v4 + Framer Motion 애니메이션
- ✅ 절대 경로 import (@/ alias) 설정

### 🎯 현재 프로젝트 구조

```
frontend/
├── app/
│   ├── page.tsx              (홈페이지)
│   ├── layout.tsx            (루트 레이아웃)
│   ├── globals.css           (글로벌 스타일)
│   └── lectures/
│       └── page.tsx          (강의 목록)
├── components/
│   ├── HomePage.tsx          (홈페이지 컴포넌트)
│   ├── MainChatUI.tsx        (토론 UI - 60줄)
│   ├── BattleArena.tsx       (배틀 아레나 - 58줄)
│   ├── chat/                 ✨ (MainChatUI 분해)
│   │   ├── ChatHeader.tsx
│   │   ├── ChatMessages.tsx
│   │   ├── ChatInput.tsx
│   │   └── ChatSidebar.tsx
│   ├── arena/                ✨ (BattleArena 분해)
│   │   ├── ScoreBar.tsx
│   │   ├── BattleView.tsx
│   │   └── LiveChatPanel.tsx
│   ├── providers/            ✨ (전문화된 Context)
│   │   ├── AuthProvider.tsx
│   │   ├── TokenProvider.tsx
│   │   ├── LectureProvider.tsx
│   │   └── GameProvider.tsx
│   └── ui/                   (shadcn UI + 커스텀)
├── hooks/                    ✨ (Custom Hooks)
│   ├── useAuth.ts            (사용자 인증 + 프로필)
│   ├── useChat.ts            (토론 로직 + 백엔드 연동)
│   ├── useTimer.ts           (카운트다운 타이머)
│   ├── useLiveChat.ts        (관중 채팅)
│   └── useToken.ts           (토큰 관리)
├── types/                    ✨ (중앙화된 타입)
│   ├── index.ts              (모든 타입 export)
│   ├── lecture.ts
│   ├── chat.ts
│   ├── user.ts
│   └── game.ts
├── lib/                      ✨ (API 통합)
│   ├── api.ts                (백엔드 연동 계층)
│   └── utils.ts
├── data/
│   └── mockData.ts           (목업 데이터)
├── package.json              (Next.js 15, React 19)
├── tsconfig.json             (TypeScript 설정)
├── tailwind.config.ts        (테일윈드 v4)
├── next.config.ts
├── postcss.config.mjs
└── .env.example              (환경변수)
```

---

## 🔑 핵심 기능

### 1. 타입 안정성
```typescript
// types/index.ts에서 중앙화
export interface UserProfile {
  id: string
  nickname: string
  interest: string
  level: LectureLevel
  createdAt?: Date
  updatedAt?: Date
}

export interface ChatRequest {
  user_input: string
  context: string
  user_profile: UserProfile
}

export interface ChatResponse {
  message: string
  sender: 'james' | 'linda' | 'system'
  tokens_earned: number
}
```

### 2. Custom Hooks (로직 재사용)
```typescript
// hooks/useChat.ts - 토론 로직
const { messages, handleSendMessage, isLoading } = useChat({
  onEarnTokens: (amount) => {},
  userProfile,        // 👈 자동으로 백엔드에 전송
  lectureContext: 'React',
})

// hooks/useAuth.ts - 인증 및 프로필 관리
const { userProfile, login, logout, isLoading } = useAuth()

// hooks/useTimer.ts - 타이머 공유 로직
const { timeLeft, isRunning } = useTimer(3000)
```

### 3. API 통합 계층
```typescript
// lib/api.ts - 모든 API 호출 중앙화
const response = await callBackendAPI<ChatResponse>(
  '/api/v1/debate/message',
  chatRequest  // 자동으로 UserProfile 포함
)

// 상태 확인
await healthCheck()
```

### 4. 상태 관리 (전문화)
```typescript
// components/providers/index.ts
<AuthProvider>
  <TokenProvider>
    <LectureProvider>
      <GameProvider>
        {children}
      </GameProvider>
    </LectureProvider>
  </TokenProvider>
</AuthProvider>
```

---

## 📊 개선 지표

| 항목 | Before | After | 개선도 |
|------|--------|-------|--------|
| 최대 컴포넌트 크기 | 302줄 | 60줄 | ↓ 80% |
| 타입 정의 위치 | 6+ 파일 | types/ | ✅ 중앙화 |
| 공유 로직 중복 | 중복 다수 | 0개 | ✅ 제거 |
| Context 개수 | 1개 | 4개 | ↑ 300% |
| 파일 구조 명확성 | 혼합 | 계층적 | ✅ 개선 |

---

## 🚀 다음 단계

1. **백엔드 LLM 통합** (task-3.1 참고)
   - Claude API / LangChain 연동
   - 사용자 정보 기반 프롬프트

2. **Supabase 데이터베이스** (task-1.3)
   - 사용자 프로필 저장
   - 토론 이력 저장

3. **ElevenLabs TTS**
   - 음성 합성
   - 오디오 스트리밍

---

## 📚 참고 문서

- `REFACTORING_SUMMARY.md` - 전체 리팩토링 상세
- `INTEGRATION_GUIDE.md` - 프론트엔드-백엔드 통합
- `frontend/types/index.ts` - 타입 정의
- `frontend/hooks/useChat.ts` - 토론 로직
- `frontend/lib/api.ts` - API 통합

---

**상태**: 🟢 Phase 1-4 완료 (리팩토링)
**현재**: Phase 3 진행 중 (LLM 통합)
**최종 업데이트**: 2026-01-31
