# Task 3.4: 오디오 비주얼라이저

## 목표
실시간 오디오 파형 비주얼라이저 구현

---

## 프롬프트

```
실시간 오디오 파형 비주얼라이저를 구현해줘.

요구사항:
1. 컴포넌트: AudioWaveform

Props:
- type: 'recording' | 'playback'
- isActive: boolean
- color: string (speaker 컬러)

2. 녹음 중 (recording):
   - Web Audio API의 AnalyserNode 사용
   - getUserMedia 오디오 스트림 분석
   - 주파수 데이터 → 막대 높이 매핑
   - 20개 막대, 부드러운 애니메이션

3. 재생 중 (playback):
   - Audio 엘리먼트에 AnalyserNode 연결
   - AI 음성 재생 시 파형 표시
   - speaker에 따라 색상 변경 (james: red, linda: green)

4. 스타일:
   - 막대 너비: 3px, gap: 2px
   - 높이: 4px ~ 24px 동적
   - 둥근 모서리
   - 그라디언트 색상

5. 애니메이션:
   - requestAnimationFrame 사용
   - isActive false 시 높이 0으로 수렴
   - 부드러운 트랜지션 (ease-out)

6. 비활성 상태:
   - 정적인 낮은 막대 표시
   - opacity 0.3
```

---

## 컴포넌트 구현

```tsx
// components/ui/AudioWaveform.tsx

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
  mediaStream
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!isActive) {
      // 비활성 상태 처리
      return;
    }
    
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    
    if (type === 'recording' && mediaStream) {
      const source = audioContext.createMediaStreamSource(mediaStream);
      source.connect(analyser);
    } else if (type === 'playback' && audioElement) {
      const source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
    }
    
    analyserRef.current = analyser;
    
    const draw = () => {
      // 파형 그리기 로직...
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioContext.close();
    };
  }, [isActive, type, mediaStream, audioElement]);

  return (
    <div className="audio-waveform">
      {Array.from({ length: barCount }).map((_, i) => (
        <span
          key={i}
          className="waveform-bar"
          style={{
            backgroundColor: color,
            animationDelay: `${i * 0.05}s`
          }}
        />
      ))}
    </div>
  );
}
```

## CSS 스타일

```css
/* 오디오 파형 컨테이너 */
.audio-waveform {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 32px;
}

/* 개별 막대 */
.waveform-bar {
  width: 3px;
  min-height: 4px;
  max-height: 24px;
  border-radius: 2px;
  transition: height 0.1s ease-out;
}

/* 활성 상태 애니메이션 */
.waveform-bar.active {
  animation: waveform 0.5s ease-in-out infinite;
}

@keyframes waveform {
  0%, 100% {
    height: 4px;
  }
  50% {
    height: var(--bar-height, 16px);
  }
}

/* 비활성 상태 */
.audio-waveform.inactive .waveform-bar {
  height: 4px;
  opacity: 0.3;
}
```

## 색상 매핑

| Speaker | 색상 | 용도 |
|---------|------|------|
| User (녹음) | `#00d4ff` | 마이크 녹음 중 |
| James | `#ff4757` | James 음성 재생 |
| Linda | `#2ed573` | Linda 음성 재생 |

## 사용 예시

```tsx
// 녹음 중 표시
<AudioWaveform
  type="recording"
  isActive={isRecording}
  color="#00d4ff"
  mediaStream={mediaStream}
/>

// AI 음성 재생 중 표시
<AudioWaveform
  type="playback"
  isActive={isPlaying}
  color={currentSpeaker === 'james' ? '#ff4757' : '#2ed573'}
  audioElement={audioRef.current}
/>
```

## 예상 결과물

- `/components/ui/AudioWaveform.tsx`
- CSS 스타일 추가
- 녹음/재생 컴포넌트에 통합

## 예상 시간
약 1시간
