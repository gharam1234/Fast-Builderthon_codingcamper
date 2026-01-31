# Task 5.2: Vercel 프론트엔드 배포

## 📋 현재 상태 (2026-01-31)

### ✅ 완료된 항목
- ✅ Next.js 15 프로젝트 완성
- ✅ 모든 페이지 및 컴포넌트 구현
- ✅ Supabase 연동 완료

### 🔄 진행 중인 항목
- 🔄 **Phase 5: 배포** (이 파일)

---

## 🎯 목표

**Vercel 배포**: Next.js 앱을 Vercel에 배포

---

## 📝 구현 가이드

### 1. vercel.json 설정

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "regions": ["icn1"],
  "env": {
    "NEXT_PUBLIC_BACKEND_URL": "@backend_url",
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_key"
  }
}
```

### 2. next.config.ts

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { hostname: 'lh3.googleusercontent.com' },
      { hostname: 'supabase.co' },
    ],
  },
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### 3. 배포 단계

1. **GitHub 연결**
   - Vercel 대시보드에서 GitHub 저장소 선택
   - 브랜치: `main` → 자동 배포

2. **환경 변수 설정**
   - Settings → Environment Variables에서 추가:
   - NEXT_PUBLIC_BACKEND_URL
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY

3. **배포 실행**
   - `git push` → 자동 배포
   - 또는 Vercel CLI: `vercel deploy`

---

## ✅ 체크리스트

- [ ] vercel.json 생성
- [ ] 환경 변수 설정
- [ ] GitHub 연결
- [ ] 프로덕션 배포 테스트

---

**상태**: 🟡 Phase 5 진행 중 (배포)
**최종 업데이트**: 2026-01-31

```json
{
  "framework": "nextjs",
  "regions": ["icn1"],
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type" }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/backend/:path*",
      "destination": "https://your-backend.replit.app/:path*"
    }
  ]
}
```

## 2. Next.js 설정 최적화

```javascript
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 이미지 최적화
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },

  // 빌드 최적화
  swcMinify: true,
  
  // 실험적 기능
  experimental: {
    optimizeCss: true,
  },

  // 환경변수 검증
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // 리다이렉트
  async redirects() {
    return [
      {
        source: '/',
        destination: '/lecture/demo',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
```

## 3. 환경변수 설정

### .env.local (로컬 개발)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### .env.production (프로덕션)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
NEXT_PUBLIC_API_URL=https://your-backend.replit.app
```

## 4. 배포 단계

### Step 1: GitHub 연결
```bash
# Git 초기화 및 푸시
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/yeoul.git
git push -u origin main
```

### Step 2: Vercel 프로젝트 생성
1. [vercel.com](https://vercel.com) 접속
2. "Add New Project" 클릭
3. GitHub 레포지토리 선택
4. Framework Preset: Next.js 확인
5. Root Directory: `./` (기본값)

### Step 3: 환경변수 설정
Vercel Dashboard > Project > Settings > Environment Variables

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | All |
| `NEXT_PUBLIC_API_URL` | `https://backend.replit.app` | Production |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Development |

### Step 4: 배포
```bash
# Vercel CLI 설치 (선택)
npm i -g vercel

# 배포
vercel --prod
```

## 5. 배포 체크리스트

- [ ] 환경변수 모두 설정됨
- [ ] 빌드 성공
- [ ] API 연결 테스트
- [ ] 모바일 반응형 확인
- [ ] HTTPS 적용됨
- [ ] 도메인 연결 (선택)

## 6. 모니터링

### Vercel Analytics 설정
```tsx
// app/layout.tsx

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## 예상 결과물

- `vercel.json`
- `next.config.js` 업데이트
- `.env.example`
- Vercel 프로젝트 배포

## 예상 시간
약 30분
