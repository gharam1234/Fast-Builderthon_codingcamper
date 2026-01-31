# Task 3.3: 음성 합성 (TTS - ElevenLabs)

## 📋 현재 상태 (2026-01-31)

### ✅ 완료된 항목
- ✅ Backend/main.py: FastAPI 기본 구조 + TTS 엔드포인트 스텁
- ✅ lib/api.ts: synthesizeVoice() 함수 준비 완료
- ✅ task-3.1: Claude API + LangChain 가이드

### 🔄 진행 중인 항목
- 🔄 **Phase 3: TTS 음성 합성** (이 파일)
  - ElevenLabs API 연동
  - useTextToSpeech Hook
  - 재생 순서 관리

---

## 🎯 목표

**ElevenLabs TTS 구현**: AI 응답을 음성으로 자동 재생

---

## 🔑 주요 기능

### 1. 백엔드: Voice Service (FastAPI)

```python
# Backend/services/voice_service.py

from elevenlabs import ElevenLabs, VoiceSettings
from typing import Literal
import os

class VoiceService:
    def __init__(self):
        self.client = ElevenLabs(
            api_key=os.getenv("ELEVENLABS_API_KEY")
        )
        self.voices = {
            "james": os.getenv("JAMES_VOICE_ID", "pNInz6obpgDQGcFmaJgB"),
            "linda": os.getenv("LINDA_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")
        }

    async def synthesize(
        self,
        text: str,
        speaker: Literal["james", "linda"]
    ) -> bytes:
        """텍스트를 음성으로 변환"""
        voice_id = self.voices[speaker]

        audio = self.client.generate(
            text=text,
            voice=voice_id,
            model="eleven_multilingual_v2",
            voice_settings=VoiceSettings(
                stability=0.5,
                similarity_boost=0.75,
                style=0.5,
                use_speaker_boost=True
            )
        )

        # Generator를 bytes로 변환
        audio_bytes = b"".join(audio)
        return audio_bytes

# 싱글톤 인스턴스
_voice_service = VoiceService()

async def get_voice_service() -> VoiceService:
    return _voice_service
```

### 2. 백엔드: API 엔드포인트

```python
# Backend/app/api/v1/voice.py

from fastapi import APIRouter, Response, Depends
from pydantic import BaseModel
from typing import Literal
from app.services.voice_service import get_voice_service, VoiceService

router = APIRouter()

class SynthesizeRequest(BaseModel):
    text: str
    speaker: Literal["james", "linda"]

@router.post("/synthesize")
async def synthesize_speech(
    request: SynthesizeRequest,
    voice_service: VoiceService = Depends(get_voice_service)
) -> Response:
    """음성 합성"""
    try:
        audio_bytes = await voice_service.synthesize(
            text=request.text,
            speaker=request.speaker
        )

        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"attachment; filename={request.speaker}.mp3"
            }
        )
    except Exception as e:
        return Response(
            content={"error": str(e)},
            status_code=500,
            media_type="application/json"
        )
```

### 3. 프론트엔드: useTextToSpeech Hook

```typescript
// hooks/useTextToSpeech.ts

import { useState, useRef } from 'react';
import { api } from '@/lib/api';

interface UseTextToSpeechReturn {
  speak: (text: string, speaker: 'james' | 'linda') => Promise<void>;
  isPlaying: boolean;
  stop: () => void;
  currentSpeaker: 'james' | 'linda' | null;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<
    'james' | 'linda' | null
  >(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = async (
    text: string,
    speaker: 'james' | 'linda'
  ): Promise<void> => {
    return new Promise((resolve) => {
      try {
        setIsPlaying(true);
        setCurrentSpeaker(speaker);

        // API 호출로 음성 받기
        api
          .synthesizeVoice(text, speaker)
          .then((audioBuffer) => {
            // Blob 생성
            const audioBlob = new Blob([audioBuffer], {
              type: 'audio/mpeg',
            });
            const audioUrl = URL.createObjectURL(audioBlob);

            // Audio 엘리먼트 생성/재사용
            let audio = audioRef.current;
            if (!audio) {
              audio = new Audio();
              audioRef.current = audio;
            }

            audio.src = audioUrl;

            // 재생 종료 이벤트
            const onEnded = () => {
              setIsPlaying(false);
              setCurrentSpeaker(null);
              URL.revokeObjectURL(audioUrl);
              audio!.removeEventListener('ended', onEnded);
              resolve();
            };

            audio.addEventListener('ended', onEnded);

            // 재생 시작
            audio.play().catch((err) => {
              console.error('Audio play error:', err);
              setIsPlaying(false);
              setCurrentSpeaker(null);
              resolve();
            });
          })
          .catch((err) => {
            console.error('TTS error:', err);
            setIsPlaying(false);
            setCurrentSpeaker(null);
            resolve();
          });
      } catch (error) {
        console.error('Unexpected error:', error);
        setIsPlaying(false);
        setCurrentSpeaker(null);
        resolve();
      }
    });
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentSpeaker(null);
    }
  };

  return {
    speak,
    isPlaying,
    stop,
    currentSpeaker,
  };
}
```

### 4. DebateRoom 통합

```typescript
// components/debate/DebateRoom.tsx 수정

'use client';

import { useChat } from '@/hooks/useChat';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { ChatMessages } from '@/components/chat/ChatMessages';

export function DebateRoom(props: DebateRoomProps) {
  const { messages, handleSendMessage, isLoadingFromBackend } = useChat(props);
  const { speak, isPlaying, currentSpeaker } = useTextToSpeech();

  const handleMessageReceived = async (
    jamesResponse: string,
    lindaResponse: string
  ) => {
    // James 응답 재생
    await speak(jamesResponse, 'james');

    // Linda 응답 재생
    await speak(lindaResponse, 'linda');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 메시지 표시 + 현재 재생 중인 speaker 표시 */}
      <ChatMessages
        messages={messages}
        isLoading={isLoadingFromBackend}
        currentSpeaker={isPlaying ? currentSpeaker : null}
      />

      {/* 나머지 UI */}
    </div>
  );
}
```

---

## 🎵 음성 설정

| AI | 추천 음성 | Voice ID | 특징 |
|----|----------|----------|------|
| James | Adam (남성) | `pNInz6obpgDQGcFmaJgB` | 차분하고 논리적 |
| Linda | Rachel (여성) | `21m00Tcm4TlvDq8ikWAM` | 밝고 따뜻함 |

---

## 🔧 환경변수 설정

```bash
# Backend/.env
ELEVENLABS_API_KEY=sk_...
JAMES_VOICE_ID=pNInz6obpgDQGcFmaJgB
LINDA_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

```typescript
// frontend/lib/api.ts
async synthesizeVoice(
  text: string,
  speaker: 'james' | 'linda'
): Promise<ArrayBuffer> {
  const response = await fetch(
    `${this.baseUrl}/api/v1/voice/synthesize`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, speaker }),
    }
  );

  if (!response.ok) {
    throw new APIError('TTS failed', response.status);
  }

  return response.arrayBuffer();
}
```

---

## ✅ 체크리스트

- [ ] ElevenLabs API Key 확보
- [ ] VoiceService 클래스 구현
- [ ] POST /api/v1/voice/synthesize 엔드포인트
- [ ] useTextToSpeech Hook 구현
- [ ] lib/api.ts에 synthesizeVoice() 추가
- [ ] DebateRoom에서 자동 재생
- [ ] 오류 처리 (네트워크, API 오류)

---

## 📚 참고 문서

- `task-3.2-voice-recognition.md` - STT
- `task-3.4-audio-visualizer.md` - 오디오 시각화
- ElevenLabs API 문서

---

**상태**: 🟡 Phase 3 진행 중 (TTS)
**다음**: task-3.4 (오디오 비주얼라이저)
**최종 업데이트**: 2026-01-31
