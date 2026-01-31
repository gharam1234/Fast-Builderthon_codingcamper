# Task 1.1: Frontend 프로젝트 셋업

## 목표
Next.js 14 + Tailwind CSS + Framer Motion 기반 프로젝트 생성

---

## 프롬프트

```
Next.js 14 프로젝트를 생성해줘. 요구사항:

1. 프로젝트 설정:
   - App Router 사용
   - TypeScript 적용
   - Tailwind CSS 설정
   - 절대 경로 import (@/ alias)

2. 패키지 설치:
   - framer-motion (애니메이션)
   - lucide-react (아이콘)
   - @supabase/supabase-js (DB)
   - zustand (상태관리)

3. 폴더 구조:
   /app
     /lecture/[id]/page.tsx  (강의 상세)
     /api/...                (API Routes)
   /components
     /ui                     (공통 UI)
     /lecture                (강의 관련)
     /debate                 (토론 관련)
   /lib
     supabase.ts
     api.ts
   /store
     useDebateStore.ts
   /styles
     globals.css

4. Tailwind 테마 확장:
   - colors: yeoul-navy (#0a1628), yeoul-cyan (#00d4ff), james-red (#ff4757), linda-green (#2ed573)
   - glassmorphism 유틸리티 클래스
   - 커스텀 애니메이션 (wave, pulse-glow, float)

5. 환경변수 템플릿 (.env.local.example):
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   NEXT_PUBLIC_API_URL=
   ELEVENLABS_API_KEY=
```

---

## 예상 결과물

- `package.json` - 의존성 정의
- `tsconfig.json` - TypeScript 설정
- `tailwind.config.ts` - 테일윈드 테마
- `next.config.js` - Next.js 설정
- `/app/layout.tsx` - 루트 레이아웃
- `/app/page.tsx` - 홈페이지
- `/styles/globals.css` - 글로벌 스타일

## 예상 시간
약 1시간
