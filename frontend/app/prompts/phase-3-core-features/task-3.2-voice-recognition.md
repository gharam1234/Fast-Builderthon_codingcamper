# Task 3.2: 음성 인식 (STT)

## 목표
Web Speech API를 사용한 음성 인식 기능 구현

---

## 프롬프트

```
Web Speech API를 사용한 음성 인식 기능을 구현해줘.

요구사항:
1. Custom Hook: useVoiceRecognition()
   
   const {
     isListening,      // 녹음 중 여부
     transcript,       // 인식된 텍스트
     startListening,   // 녹음 시작
     stopListening,    // 녹음 중지
     resetTranscript,  // 텍스트 초기화
     error,            // 에러 상태
     isSupported       // 브라우저 지원 여부
   } = useVoiceRecognition();

2. 설정:
   - 언어: 'ko-KR' (한국어)
   - continuous: true (연속 인식)
   - interimResults: true (중간 결과)

3. 에러 처리:
   - 마이크 권한 거부
   - 브라우저 미지원
   - 네트워크 에러

4. 자동 종료:
   - 3초 이상 무음 시 자동 stopListening()
   - 최대 60초 제한

5. UI 연동:
   - 마이크 버튼 long press → 녹음 시작
   - 버튼 릴리즈 → 녹음 종료 & 텍스트 전송
   - 실시간 transcript 미리보기 표시
```

---

## Hook 구현 예시

```typescript
// hooks/useVoiceRecognition.ts

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
  
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ko-KR';
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
      // 결과 처리...
    };
    
    recognition.onerror = (event) => {
      // 에러 처리...
    };
    
    recognitionRef.current = recognition;
  }, []);

  // ... 나머지 구현
}
```

## 에러 처리 메시지

| 에러 코드 | 사용자 메시지 |
|-----------|--------------|
| `not-allowed` | 마이크 권한을 허용해주세요 |
| `no-speech` | 음성이 감지되지 않았습니다 |
| `network` | 네트워크 연결을 확인해주세요 |
| `aborted` | 음성 인식이 취소되었습니다 |

## 마이크 버튼 연동

```tsx
// 마이크 버튼 컴포넌트
<button
  onTouchStart={startListening}
  onTouchEnd={stopListening}
  onMouseDown={startListening}
  onMouseUp={stopListening}
  className={isListening ? 'recording' : ''}
>
  {isListening ? <MicOff /> : <Mic />}
</button>

{/* 실시간 미리보기 */}
{isListening && interimTranscript && (
  <div className="transcript-preview">
    {interimTranscript}
  </div>
)}
```

## 예상 결과물

- `/hooks/useVoiceRecognition.ts`
- 마이크 버튼 컴포넌트 업데이트
- 에러 토스트 UI

## 예상 시간
약 1시간
