# Task 5.2: Vercel 배포 (Frontend)

## 목표
Next.js 프론트엔드를 Vercel에 배포

---

## 프롬프트

```
Next.js 프론트엔드를 Vercel에 배포하기 위한 설정을 해줘.

요구사항:
1. vercel.json 설정:
   {
     "framework": "nextjs",
     "regions": ["icn1"],  // 서울 리전
     "env": {
       "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
       "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
       "NEXT_PUBLIC_API_URL": "@api-url"
     }
   }

2. 환경변수 목록:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_API_URL

3. 빌드 최적화:
   - Image 최적화 설정
   - 번들 분석 (선택)
   - Edge Runtime 고려

4. 도메인 설정:
   - yeoul.vercel.app (기본)
   - 커스텀 도메인 (선택)

5. Preview 배포:
   - PR별 자동 프리뷰
   - 브랜치별 환경변수
```

---

## 1. vercel.json 설정

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
