# Task 3.2: 음성 인식 (STT - Web Speech API)

## 📋 현재 상태 (2026-01-31)

### ✅ 완료된 항목
- ✅ Phase 1-2: 프로젝트 + UI 구조 완성
- ✅ useChat Hook: 백엔드 연동
- ✅ ChatInput 컴포넌트: 텍스트 입력

### 🔄 진행 중인 항목
- 🔄 **Phase 3: 음성 기능** (이 파일)
  - Web Speech API (STT)
  - ElevenLabs TTS
  - 오디오 비주얼라이저

---

## 🎯 목표

**음성 인식 구현**: Web Speech API로 한국어 음성 입력 + 실시간 텍스트 표시

---

## 📝 구현 가이드

### 1. useVoiceRecognition Hook

```typescript
// hooks/useVoiceRecognition.ts

import { useEffect, useRef, useState } from 'react';

interface UseVoiceRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
  isSupported: boolean;
}

export function useVoiceRecognition(): UseVoiceRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // 설정
    recognition.lang = 'ko-KR';
    recognition.continuous = true;
    recognition.interimResults = true;

    // 결과 처리
    recognition.onresult = (event) => {
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcript + ' ');
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);

      // 자동 종료: 3초 무음 감지
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      silenceTimerRef.current = setTimeout(() => {
        recognition.stop();
      }, 3000);
    };

    // 에러 처리
    recognition.onerror = (event) => {
      const errorMap: Record<string, string> = {
        'not-allowed': '마이크 권한을 허용해주세요',
        'no-speech': '음성이 감지되지 않았습니다',
        network: '네트워크 연결을 확인해주세요',
        aborted: '음성 인식이 취소되었습니다',
      };

      const message =
        errorMap[event.error] || `에러: ${event.error}`;
      setError(message);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [isSupported]);

  const startListening = () => {
    if (!recognitionRef.current || isListening) return;

    setError(null);
    setTranscript('');
    setInterimTranscript('');
    setIsListening(true);

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;

    recognitionRef.current.stop();
    setIsListening(false);

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
  };

  const resetTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    error,
    isSupported,
  };
}
```

### 2. ChatInput과 통합

```typescript
// components/chat/ChatInput.tsx 수정

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
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition();

  const handleMicStart = () => {
    setInput(''); // 이전 입력 초기화
    resetTranscript();
    startListening();
  };

  const handleMicEnd = () => {
    stopListening();

    // 최종 텍스트를 입력창에 추가
    const finalText = transcript.trim();
    if (finalText) {
      setInput(finalText);
      onSend(finalText);
      resetTranscript();
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className="p-4 border-t border-white/10 space-y-2">
      {/* 녹음 중: 실시간 텍스트 미리보기 */}
      {isListening && (
        <div className="px-4 py-3 rounded-lg
          bg-blue-500/10 border border-blue-500/30">
          <p className="text-sm text-blue-300 mb-1">음성 입력 중...</p>
          {interimTranscript && (
            <p className="text-white">{interimTranscript}</p>
          )}
        </div>
      )}

      {/* 입력 영역 */}
      <div className="flex gap-3 items-end">
        {/* 텍스트 입력 */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="메시지를 입력하세요..."
          disabled={disabled || isListening}
          className="flex-1 px-4 py-3 rounded-lg
            bg-white/5 border border-white/10
            text-white placeholder:text-white/40
            resize-none max-h-24
            disabled:opacity-50"
          rows={1}
        />

        {/* 마이크 버튼 */}
        <button
          onMouseDown={handleMicStart}
          onMouseUp={handleMicEnd}
          onTouchStart={handleMicStart}
          onTouchEnd={handleMicEnd}
          disabled={disabled}
          className={`p-3 rounded-lg transition-all
            ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-white/10 text-white hover:bg-white/20'
            }
            disabled:opacity-50`}
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Send 버튼 */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled || isListening}
          className="p-3 rounded-lg bg-cyan-500 text-white
            hover:bg-cyan-600 transition-all
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
```

---

## 🎤 에러 처리

| 에러 | 사용자 메시지 | 해결책 |
|------|--------------|-------|
| `not-allowed` | 마이크 권한을 허용해주세요 | 설정에서 권한 확인 |
| `no-speech` | 음성이 감지되지 않았습니다 | 다시 시도 |
| `network` | 네트워크 연결을 확인해주세요 | 연결 확인 후 재시도 |

---

## ✅ 체크리스트

- [ ] useVoiceRecognition Hook 구현
- [ ] 한국어(ko-KR) 언어 설정 확인
- [ ] 자동 종료 (3초 무음)
- [ ] 에러 처리 UI
- [ ] 실시간 텍스트 미리보기
- [ ] 마이크 버튼 롱프레스 동작
- [ ] 브라우저 호환성 테스트

---

## 📚 참고 문서

- `task-3.3-voice-synthesis.md` - TTS (음성 출력)
- `task-3.4-audio-visualizer.md` - 오디오 시각화
- Web Speech API MDN 문서

---

**상태**: 🟡 Phase 3 진행 중 (STT)
**다음**: task-3.3 (TTS), task-3.4 (오디오 비주얼라이저)
**최종 업데이트**: 2026-01-31
