# Task 3.4: 오디오 비주얼라이저

## 📋 현재 상태 (2026-01-31)

### ✅ 완료된 항목
- ✅ useVoiceRecognition Hook (STT)
- ✅ useTextToSpeech Hook (TTS)
- ✅ ChatInput 컴포넌트 (마이크 버튼)

### 🔄 진행 중인 항목
- 🔄 **Phase 3: 오디오 시각화** (이 파일)
  - 녹음 중: 입력 파형
  - 재생 중: 출력 파형

---

## 🎯 목표

**오디오 비주얼라이저 구현**: 실시간 주파수 분석 + 동적 막대 애니메이션

---

## 📝 구현 가이드

### 1. AudioWaveform.tsx

```typescript
// components/ui/AudioWaveform.tsx

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface AudioWaveformProps {
  type: 'recording' | 'playback';
  isActive: boolean;
  color?: string;
  barCount?: number;
  audioElement?: HTMLAudioElement | null;
  mediaStream?: MediaStream | null;
}

export function AudioWaveform({
  type,
  isActive,
  color = '#00d4ff',
  barCount = 20,
  audioElement,
  mediaStream,
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number | null>(null);
  const [barHeights, setBarHeights] = useState<number[]>(
    Array(barCount).fill(0)
  );

  useEffect(() => {
    if (!isActive) {
      // 비활성 상태: 낮은 높이
      setBarHeights(Array(barCount).fill(2));
      return;
    }

    try {
      // AudioContext 생성
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      if (type === 'recording' && mediaStream) {
        // 녹음 모드: MediaStreamSource 연결
        const source = audioContext.createMediaStreamSource(
          mediaStream
        );
        source.connect(analyser);
      } else if (type === 'playback' && audioElement) {
        // 재생 모드: Audio 엘리먼트 연결
        const source =
          audioContext.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
      }

      // 애니메이션 루프
      const draw = () => {
        const dataArray = new Uint8Array(
          analyser.frequencyBinCount
        );
        analyser.getByteFrequencyData(dataArray);

        // 막대 높이 계산 (부드러운 보간)
        const newHeights = Array(barCount)
          .fill(0)
          .map((_, i) => {
            const index = Math.floor(
              (i / barCount) * dataArray.length
            );
            const value = dataArray[index];

            // 정규화: 0-24px 범위
            const height = (value / 255) * 24;

            return Math.max(2, Math.min(24, height));
          });

        setBarHeights(newHeights);
        animationRef.current = requestAnimationFrame(draw);
      };

      draw();

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } catch (error) {
      console.error('Audio Waveform error:', error);
    }
  }, [isActive, type, mediaStream, audioElement, barCount]);

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {barHeights.map((height, i) => (
        <motion.div
          key={i}
          className="rounded-sm"
          style={{
            width: 3,
            height: `${height}px`,
            backgroundColor: color,
            minHeight: 4,
            maxHeight: 24,
            opacity: isActive ? 1 : 0.3,
          }}
          animate={{
            height: `${height}px`,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        />
      ))}
    </div>
  );
}
```

### 2. ChatInput with Waveform

```typescript
// components/chat/ChatInput.tsx 수정

import { AudioWaveform } from '@/components/ui/AudioWaveform';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
  } = useVoiceRecognition();

  const handleMicStart = async () => {
    try {
      // MediaStream 획득 (오디오 비주얼라이저용)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      mediaStreamRef.current = stream;

      // 음성 인식 시작
      startListening();
    } catch (error) {
      console.error('Microphone access error:', error);
    }
  };

  const handleMicEnd = () => {
    stopListening();

    // 스트림 종료
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }

    // 텍스트 전송
    if (transcript.trim()) {
      onSend(transcript);
      setInput('');
    }
  };

  return (
    <div className="p-4 border-t border-white/10 space-y-3">
      {/* 녹음 중: 오디오 파형 */}
      {isListening && (
        <AudioWaveform
          type="recording"
          isActive={true}
          color="#00d4ff"
          barCount={20}
          mediaStream={mediaStreamRef.current}
        />
      )}

      {/* 입력 영역 */}
      <div className="flex gap-3 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지 입력..."
          disabled={disabled || isListening}
          className="flex-1 px-4 py-3 rounded-lg
            bg-white/5 border border-white/10
            text-white resize-none max-h-24"
        />

        {/* 마이크 버튼 */}
        <button
          onMouseDown={handleMicStart}
          onMouseUp={handleMicEnd}
          onTouchStart={handleMicStart}
          onTouchEnd={handleMicEnd}
          className={`p-3 rounded-lg transition-all
            ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Send 버튼 */}
        <button
          onClick={() => onSend(input)}
          disabled={!input.trim() || disabled}
          className="p-3 rounded-lg bg-cyan-500 text-white
            hover:bg-cyan-600 transition-all
            disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
```

### 3. DebateRoom with Playback Waveform

```typescript
// components/debate/DebateRoom.tsx 수정

import { AudioWaveform } from '@/components/ui/AudioWaveform';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

export function DebateRoom(props: DebateRoomProps) {
  const { speak, isPlaying, currentSpeaker } = useTextToSpeech();
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div className="flex flex-col h-screen">
      {/* 메시지 */}
      <ChatMessages messages={messages} />

      {/* AI 음성 재생 중: 파형 표시 */}
      {isPlaying && currentSpeaker && (
        <div className="px-4 py-2 bg-white/5 border-t border-white/10">
          <p className="text-sm text-white/60 mb-2">
            {currentSpeaker === 'james' ? '🎭' : '🌟'}{' '}
            {currentSpeaker === 'james' ? 'James' : 'Linda'} 음성 중...
          </p>
          <AudioWaveform
            type="playback"
            isActive={isPlaying}
            color={
              currentSpeaker === 'james' ? '#ff4757' : '#2ed573'
            }
            audioElement={audioRef.current}
          />
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoadingFromBackend} />

      {/* 숨겨진 Audio 엘리먼트 (재생용) */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}
```

---

## 🎨 색상 매핑

```typescript
const colors = {
  recording: '#00d4ff',    // Cyan (사용자 녹음)
  james: '#ff4757',        // Red (James 음성)
  linda: '#2ed573',        // Green (Linda 음성)
};
```

---

## ⚙️ AudioContext 최적화

```typescript
// 여러 Waveform이 같은 AudioContext 사용 시
const audioContextRef = useRef<AudioContext | null>(null);

// useEffect 시작
if (!audioContextRef.current) {
  audioContextRef.current = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
}
const audioContext = audioContextRef.current;

// ... analyser 연결

// cleanup: AudioContext 종료 X (다른 곳에서 사용할 수 있음)
// 대신 analyser 연결만 제거
```

---

## ✅ 체크리스트

- [ ] AudioWaveform 컴포넌트 구현
- [ ] Web Audio API AnalyserNode 연결
- [ ] 녹음 시 MediaStream 주파수 분석
- [ ] 재생 시 Audio 엘리먼트 주파수 분석
- [ ] 부드러운 애니메이션 (spring 물리)
- [ ] 3가지 색상 구분 (recording, james, linda)
- [ ] AudioContext 라이프사이클 관리

---

## 📚 참고 문서

- `task-3.2-voice-recognition.md` - STT
- `task-3.3-voice-synthesis.md` - TTS
- Web Audio API MDN 문서

---

**상태**: 🟡 Phase 3 진행 중 (오디오 시각화)
**다음**: Phase 4 (데이터베이스)
**최종 업데이트**: 2026-01-31
