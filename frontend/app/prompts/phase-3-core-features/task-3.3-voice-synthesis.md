# Task 3.3: 음성 합성 (TTS - ElevenLabs)

## 목표
ElevenLabs API를 사용한 음성 합성 기능 구현

---

## 프롬프트

```
ElevenLabs API를 사용한 음성 합성 기능을 구현해줘.

요구사항:
1. 백엔드 API (voice_service.py):

class VoiceService:
    def __init__(self):
        self.client = ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)
        self.james_voice_id = settings.JAMES_VOICE_ID
        self.linda_voice_id = settings.LINDA_VOICE_ID
    
    async def synthesize(
        self, 
        text: str, 
        speaker: Literal["james", "linda"]
    ) -> bytes:
        voice_id = self.james_voice_id if speaker == "james" else self.linda_voice_id
        # ElevenLabs API 호출
        # MP3 바이트 반환

2. API 엔드포인트:
   POST /api/v1/voice/synthesize
   Request: { text: string, speaker: "james" | "linda" }
   Response: audio/mpeg (스트리밍)

3. 프론트엔드 Hook: useTextToSpeech()
   
   const {
     speak,        // (text, speaker) => Promise<void>
     isPlaying,    // 재생 중 여부
     stop,         // 재생 중지
     currentSpeaker
   } = useTextToSpeech();

4. 음성 설정:
   - 제임스: 낮고 차분한 남성 목소리
   - 린다: 밝고 따뜻한 여성 목소리
   - stability: 0.5, similarity_boost: 0.75

5. 재생 순서:
   - James 응답 재생 완료 → Linda 응답 재생
   - 재생 중 사용자 버튼 터치 시 즉시 중지
```

---

## 백엔드 구현 (FastAPI)

```python
# app/services/voice_service.py

from elevenlabs import ElevenLabs, VoiceSettings
from typing import Literal
import io

class VoiceService:
    def __init__(self):
        self.client = ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)
        self.voices = {
            "james": settings.JAMES_VOICE_ID,
            "linda": settings.LINDA_VOICE_ID
        }
        
    async def synthesize(
        self, 
        text: str, 
        speaker: Literal["james", "linda"]
    ) -> bytes:
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
```

```python
# app/api/v1/voice.py

from fastapi import APIRouter, Response
from fastapi.responses import StreamingResponse

router = APIRouter()

@router.post("/synthesize")
async def synthesize_speech(request: SynthesizeRequest):
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
```

## 프론트엔드 Hook

```typescript
// hooks/useTextToSpeech.ts

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<'james' | 'linda' | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = async (text: string, speaker: 'james' | 'linda') => {
    try {
      setIsPlaying(true);
      setCurrentSpeaker(speaker);
      
      const response = await fetch(`${API_URL}/api/v1/voice/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, speaker })
      });
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentSpeaker(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      console.error('TTS Error:', error);
      setIsPlaying(false);
      setCurrentSpeaker(null);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentSpeaker(null);
    }
  };

  return { speak, isPlaying, stop, currentSpeaker };
}
```

## ElevenLabs Voice ID 설정

### 추천 음성
| AI | 추천 Voice | Voice ID |
|----|-----------|----------|
| James | "Adam" (차분한 남성) | `pNInz6obpgDQGcFmaJgB` |
| Linda | "Rachel" (밝은 여성) | `21m00Tcm4TlvDq8ikWAM` |

> ⚠️ 실제 Voice ID는 ElevenLabs 대시보드에서 확인 필요

## 예상 결과물

- `/app/services/voice_service.py`
- `/app/api/v1/voice.py`
- `/hooks/useTextToSpeech.ts`

## 예상 시간
약 1시간
