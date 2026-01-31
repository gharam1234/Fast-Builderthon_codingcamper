# Task 2.2: 로딩/전환 오버레이 (Scene 2)

## 📋 현재 상태 (2026-01-31)

### ✅ 완료된 항목
- ✅ Phase 1: 프로젝트 기본 구조
- ✅ TypeScript 타입 시스템
- ✅ Custom Hooks

### 🔄 진행 중인 항목
- 🔄 **Phase 2: UI 애니메이션** (이 파일)
  - 토론 시작 시 로딩 오버레이
  - Glassmorphism + 물결 애니메이션

---

## 🎯 목표

**로딩 오버레이 구현**: 토론 시작 시 나타나는 Glassmorphism 바텀 시트 + 물결 애니메이션

---

## 📝 구현 가이드

### 1. LoadingOverlay.tsx

```typescript
// components/debate/LoadingOverlay.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface LoadingOverlayProps {
  isOpen: boolean;
  lectureTitle: string;
  courseName: string;
  onLoadingComplete: () => void;
}

export function LoadingOverlay({
  isOpen,
  lectureTitle,
  courseName,
  onLoadingComplete,
}: LoadingOverlayProps) {
  const [loadingStep, setLoadingStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (!isOpen) return;

    const timer1 = setTimeout(() => setLoadingStep(2), 1500);
    const timer2 = setTimeout(() => setLoadingStep(3), 2500);
    const timer3 = setTimeout(() => {
      onLoadingComplete();
      setLoadingStep(1);
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen, onLoadingComplete]);

  const loadingTexts = [
    '강의 컨텍스트 분석 중...',
    '토론 패널을 초대하는 중...',
    'AI 세미나 준비 완료!',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 백드롭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => {}} // 클릭 방지
          />

          {/* 바텀 시트 */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-x-0 bottom-0 z-50
              h-[80%] rounded-t-3xl
              bg-clip-padding border border-white/20
              backdrop-blur-[25px]
              bg-gradient-to-b from-slate-900/85 to-slate-950/85"
          >
            {/* 드래그 핸들 */}
            <div className="flex justify-center pt-4 pb-6">
              <div className="w-12 h-1 bg-white/30 rounded-full" />
            </div>

            {/* 콘텐츠 */}
            <div className="h-full px-6 py-8 overflow-y-auto flex flex-col items-center justify-center">
              {/* 제목 */}
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                AI 세미나: {lectureTitle}
              </h2>
              <p className="text-white/60 text-center mb-8">
                현재 수강 중: {courseName}
              </p>

              {/* 물결 애니메이션 */}
              <motion.div
                className="mb-8 h-24 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <WaveAnimation />
              </motion.div>

              {/* 아바타들 */}
              <div className="flex gap-4 mb-8 justify-center">
                {/* James 아바타 */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={loadingStep >= 2 ? { scale: 1 } : { scale: 0 }}
                  transition={{ type: 'spring' }}
                  className="w-12 h-12 rounded-full
                    bg-red-500/20 border border-red-500/50
                    flex items-center justify-center text-2xl"
                >
                  🎭
                </motion.div>

                {/* Linda 아바타 */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={loadingStep >= 2 ? { scale: 1 } : { scale: 0 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-12 h-12 rounded-full
                    bg-green-500/20 border border-green-500/50
                    flex items-center justify-center text-2xl"
                >
                  🌟
                </motion.div>
              </div>

              {/* 로딩 텍스트 */}
              <motion.p
                key={loadingStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-white/70 text-center text-sm"
              >
                {loadingTexts[loadingStep - 1]}
              </motion.p>

              {/* 프로그레스 Dots */}
              <div className="flex gap-2 mt-8">
                {[1, 2, 3].map((step) => (
                  <motion.div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-all
                      ${loadingStep >= step ? 'bg-cyan-400' : 'bg-white/20'}`}
                    animate={loadingStep >= step ? { scale: 1 } : { scale: 0.8 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// 물결 SVG 애니메이션
function WaveAnimation() {
  return (
    <motion.svg
      width="200"
      height="100"
      viewBox="0 0 200 100"
      fill="none"
      stroke="url(#gradient)"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <defs>
        <linearGradient
          id="gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#00d4ff" />
          <stop offset="50%" stopColor="#0066ff" />
          <stop offset="100%" stopColor="#00d4ff" />
        </linearGradient>
      </defs>

      {/* 물결 경로 */}
      <motion.path
        d="M 10,50 Q 30,30 50,50 T 90,50 T 130,50 T 170,50 T 210,50"
        animate={{
          d: [
            'M 10,50 Q 30,30 50,50 T 90,50 T 130,50 T 170,50 T 210,50',
            'M 10,50 Q 30,70 50,50 T 90,50 T 130,50 T 170,50 T 210,50',
            'M 10,50 Q 30,30 50,50 T 90,50 T 130,50 T 170,50 T 210,50',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.svg>
  );
}
```

### 2. 통합 사용 예시

```typescript
// components/debate/DebateRoom.tsx

'use client';

import { useState } from 'react';
import { LoadingOverlay } from './LoadingOverlay';

export function DebateRoom() {
  const [isLoadingOverlayOpen, setIsLoadingOverlayOpen] = useState(false);
  const [debateStarted, setDebateStarted] = useState(false);

  const handleStartDebate = () => {
    setIsLoadingOverlayOpen(true);
  };

  const handleLoadingComplete = () => {
    setIsLoadingOverlayOpen(false);
    setDebateStarted(true);
  };

  if (!debateStarted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <button
          onClick={handleStartDebate}
          className="px-6 py-3 bg-cyan-500 rounded-lg"
        >
          토론 시작
        </button>

        <LoadingOverlay
          isOpen={isLoadingOverlayOpen}
          lectureTitle="React Hooks 심화"
          courseName="React 기초"
          onLoadingComplete={handleLoadingComplete}
        />
      </div>
    );
  }

  return <div className="flex-1">{/* 토론장 UI */}</div>;
}
```

---

## 🎬 애니메이션 타임라인

```
0.0s ─── 바텀 시트 슬라이드 업
0.3s ─── 물결 애니메이션 시작
0.5s ─── "강의 컨텍스트 분석 중..."
1.2s ─── 제임스 아바타 등장
1.4s ─── 린다 아바타 등장
1.5s ─── "토론 패널을 초대하는 중..."
2.5s ─── "AI 세미나 준비 완료!"
3.0s ─── onLoadingComplete() 호출
3.5s ─── 오버레이 닫힘
```

---

## ✅ 체크리스트

- [ ] LoadingOverlay 컴포넌트 구현
- [ ] WaveAnimation SVG 구현
- [ ] Glassmorphism 스타일 적용
- [ ] 3단계 로딩 텍스트 전환
- [ ] 아바타 애니메이션
- [ ] 타이밍 조정 및 테스트

---

## 📚 참고 문서

- `task-2.1-lecture-screen.md` - 강의 화면
- `task-2.3-debate-room.md` - 토론장 인터페이스
- Framer Motion 문서

---

**상태**: 🟡 Phase 2 진행 중 (로딩 애니메이션)
**다음**: task-2.3 (토론장 인터페이스)
**최종 업데이트**: 2026-01-31
