# Task 2.1: 강의 시청 화면 (Scene 1)

## 📋 현재 상태 (2026-01-31)

### ✅ 완료된 항목
- ✅ Phase 1: 프로젝트 기본 구조 완성
- ✅ TypeScript 타입 시스템 (types/index.ts)
- ✅ Custom Hooks (useAuth, useChat, useTimer, useLiveChat, useToken)
- ✅ API 통합 계층 (lib/api.ts)

### 🔄 진행 중인 항목
- 🔄 **Phase 2: UI 컴포넌트** (이 파일)
  - 강의 시청 화면 (VideoPlayer, CurriculumList)
  - 로딩 오버레이
  - 토론장 인터페이스

---

## 🎯 목표

**강의 시청 화면 구현**: VideoPlayer, CurriculumList, DebateFAB 컴포넌트로 구성

---

## 📂 파일 구조

```
components/
├── lecture/
│   ├── VideoPlayer.tsx      (비디오 플레이어)
│   ├── CurriculumList.tsx   (커리큘럼)
│   └── DebateFAB.tsx        (플로팅 토론 버튼)
└── ui/
    └── ...

app/
└── lectures/
    └── page.tsx            (강의 목록 + 재생)
```

---

## 🎨 디자인 가이드

### 색상 팔레트
```
배경:       #0a1628 (Yeoul Navy)
카드 배경:  rgba(13, 31, 60, 0.7) (glassmorphism)
주강조:     #00d4ff (Cyan) - FAB, 진행바
보조강조:   #0066ff (Blue)
완료상태:   #2ed573 (Green)
텍스트:     #ffffff / rgba(255,255,255,0.6)
```

### FAB 스타일
```css
background: linear-gradient(135deg, #00d4ff, #0066ff);
box-shadow: 0 0 20px rgba(0, 212, 255, 0.5),
            0 0 40px rgba(0, 102, 255, 0.3);
animation: float 3s ease-in-out infinite;
```

---

## 📝 구현 가이드

### 1. VideoPlayer.tsx

```typescript
// components/lecture/VideoPlayer.tsx

interface VideoPlayerProps {
  lectureUrl: string;
  currentTime: number;
  onTimeChange: (time: number) => void;
  onEnded: () => void;
}

export function VideoPlayer({
  lectureUrl,
  currentTime,
  onTimeChange,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden">
      {/* 비디오 */}
      <video
        ref={videoRef}
        src={lectureUrl}
        className="w-full aspect-video"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={onEnded}
      />

      {/* 컨트롤 바 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent
                    p-4 flex items-center gap-4">
        {/* 재생 버튼 */}
        <button onClick={() => videoRef.current?.play()}>
          {isPlaying ? <Pause2 /> : <Play />}
        </button>

        {/* 진행바 (Cyan 그라디언트) */}
        <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* 시간 표시 */}
        <span className="text-white text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* 전체화면 */}
        <button onClick={() => videoRef.current?.requestFullscreen()}>
          <Maximize2 />
        </button>
      </div>
    </div>
  );
}
```

### 2. CurriculumList.tsx

```typescript
// components/lecture/CurriculumList.tsx

interface Curriculum {
  id: string;
  title: string;
  duration: number;
  status: 'completed' | 'watching' | 'unwatched';
}

interface CurriculumListProps {
  chapters: Curriculum[];
  currentChapter: string;
  onSelectChapter: (id: string) => void;
}

export function CurriculumList({
  chapters,
  currentChapter,
  onSelectChapter,
}: CurriculumListProps) {
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {chapters.map((chapter) => (
        <button
          key={chapter.id}
          onClick={() => onSelectChapter(chapter.id)}
          className={`w-full p-3 rounded-lg text-left transition-all
            ${
              currentChapter === chapter.id
                ? 'border-2 border-cyan-400 bg-cyan-400/10'
                : 'border border-white/10'
            }
            ${
              chapter.status === 'completed'
                ? 'opacity-60'
                : ''
            }`}
        >
          <div className="flex items-center gap-3">
            {/* 상태 아이콘 */}
            {chapter.status === 'completed' && (
              <Check className="text-green-400" />
            )}
            {chapter.status === 'watching' && (
              <Dot className="text-yellow-400 animate-pulse" />
            )}
            {chapter.status === 'unwatched' && (
              <Circle className="text-white/40" />
            )}

            {/* 제목 */}
            <div className="flex-1">
              <p className="font-semibold">{chapter.title}</p>
              <p className="text-sm text-white/50">
                {Math.floor(chapter.duration / 60)}분
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
```

### 3. DebateFAB.tsx

```typescript
// components/ui/DebateFAB.tsx

import { motion } from 'framer-motion';

interface DebateFABProps {
  onStartDebate: () => void;
}

export function DebateFAB({ onStartDebate }: DebateFABProps) {
  return (
    <motion.button
      onClick={onStartDebate}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40
        w-14 h-14 rounded-full
        bg-gradient-to-br from-cyan-400 to-blue-500
        flex items-center justify-center gap-2
        shadow-lg shadow-cyan-500/30
        hover:shadow-cyan-500/50
        transition-shadow"
    >
      {/* 물결 SVG */}
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        animate={{ y: [-2, 2, -2] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <path d="M12 5v14M5 12c1.5-2 3-4 7-4s5.5 2 7 4m0 2c-1.5 2-3 4-7 4s-5.5-2-7-4" />
      </motion.svg>

      {/* 라벨 (선택) */}
      <span className="hidden sm:inline text-white text-sm font-semibold">
        AI 토론
      </span>
    </motion.button>
  );
}
```

### 4. 통합 페이지 (app/lectures/page.tsx)

```typescript
// app/lectures/page.tsx

'use client';

import { useState } from 'react';
import { VideoPlayer } from '@/components/lecture/VideoPlayer';
import { CurriculumList } from '@/components/lecture/CurriculumList';
import { DebateFAB } from '@/components/ui/DebateFAB';
import { useRouter } from 'next/navigation';

export default function LecturePage() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(0);

  // 목업 데이터
  const chapters = [
    {
      id: '1',
      title: 'React Hooks 소개',
      duration: 600,
      status: 'completed' as const,
    },
    {
      id: '2',
      title: 'useState 심화',
      duration: 720,
      status: 'watching' as const,
    },
    {
      id: '3',
      title: 'useEffect 실전',
      duration: 800,
      status: 'unwatched' as const,
    },
  ];

  const handleStartDebate = () => {
    router.push('/debate'); // 토론장으로 이동
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yeoul-navy via-blue-900 to-yeoul-navy p-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            React 심화 강의
          </h1>
          <p className="text-white/60">2026년 1월 31일 · 진행중</p>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 비디오 플레이어 */}
          <div className="lg:col-span-2">
            <VideoPlayer
              lectureUrl="/mock-video.mp4"
              currentTime={currentTime}
              onTimeChange={setCurrentTime}
              onEnded={() => {}}
            />
          </div>

          {/* 커리큘럼 */}
          <div className="lg:col-span-1">
            <div className="glass-dark p-4 rounded-xl">
              <h2 className="text-lg font-semibold text-white mb-4">커리큘럼</h2>
              <CurriculumList
                chapters={chapters}
                currentChapter="2"
                onSelectChapter={() => {}}
              />
            </div>
          </div>
        </div>

        {/* AI 토론 FAB */}
        <DebateFAB onStartDebate={handleStartDebate} />
      </div>
    </div>
  );
}
```

---

## ✅ 체크리스트

- [ ] VideoPlayer 컴포넌트 구현
- [ ] CurriculumList 컴포넌트 구현
- [ ] DebateFAB 컴포넌트 구현
- [ ] Framer Motion 애니메이션
- [ ] 반응형 레이아웃 (모바일/데스크톱)
- [ ] 목업 데이터 연동

---

## 📚 참고 문서

- `INTEGRATION_GUIDE.md` - 프론트엔드-백엔드 통합
- `task-1.1-frontend-setup.md` - 프로젝트 구조
- `task-2.2-loading-overlay.md` - 로딩 오버레이

---

**상태**: 🟡 Phase 2 진행 중 (UI 구현)
**다음**: task-2.2 (로딩 오버레이), task-2.3 (토론장 인터페이스)
**최종 업데이트**: 2026-01-31
