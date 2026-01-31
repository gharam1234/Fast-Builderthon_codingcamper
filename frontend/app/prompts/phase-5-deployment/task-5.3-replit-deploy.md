# Task 5.3: Replit 백엔드 배포

## 📋 현재 상태 (2026-01-31)

### ✅ 완료된 항목
- ✅ Backend: FastAPI + Claude API 완성
- ✅ 모든 엔드포인트 구현
- ✅ Voice synthesis 통합

### 🔄 진행 중인 항목
- 🔄 **Phase 5: 배포** (이 파일)

---

## 🎯 목표

**Replit 배포**: FastAPI 백엔드를 Replit에 배포

---

## 📝 구현 가이드

### 1. replit.nix

```nix
{ pkgs }: {
  deps = [
    pkgs.python311
    pkgs.poetry
    pkgs.curl
  ];
  
  env = {
    PYTHONPATH = ".";
  };
}
```

### 2. .replit

```toml
run = "uvicorn app.main:app --host 0.0.0.0 --port 8080"

[env]
PYTHONPATH = "."
```

### 3. pyproject.toml

```toml
[tool.poetry]
name = "yeoul-backend"
version = "0.1.0"
description = "Yeoul Debate AI Backend"

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.104"
uvicorn = "^0.24"
pydantic = "^2.0"
python-jose = "^3.3"
supabase = "^2.0"
langchain = "^0.1"
langchain-openai = "^0.0.12"
elevenlabs = "^0.2"
python-multipart = "^0.0.6"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4"
black = "^23.0"
```

## 📝 구현 가이드

### 1. replit.nix

```nix
{ pkgs }: {
  deps = [
    pkgs.python311
    pkgs.poetry
    pkgs.curl
  ];
  
  env = {
    PYTHONPATH = ".";
  };
}
```

### 2. .replit

```toml
run = "uvicorn app.main:app --host 0.0.0.0 --port 8080"

[env]
PYTHONPATH = "."
```

### 3. pyproject.toml

```toml
[tool.poetry]
name = "yeoul-backend"
version = "0.1.0"
description = "Yeoul Debate AI Backend"

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.104"
uvicorn = "^0.24"
pydantic = "^2.0"
python-jose = "^3.3"
supabase = "^2.0"
requests = "^2.31"
elevenlabs = "^0.2"
python-multipart = "^0.0.6"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4"
black = "^23.0"
```

### 4. 환경 변수 설정

Replit Secrets에 다음 추가:
```
NVIDIA_API_KEY=nvapi-...
NVIDIA_NIM_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_NIM_MODEL=meta/llama-3.1-405b-instruct
ELEVENLABS_API_KEY=sk-...
ELEVENLABS_JAMES_VOICE_ID=voice_id_james
ELEVENLABS_LINDA_VOICE_ID=voice_id_linda
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
```

### 5. Backend 구조 (FastAPI + NVIDIA NIM + ElevenLabs)

```python
# Backend/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
from elevenlabs import ElevenLabs

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://yeoul.vercel.app",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DebateEngine:
    def __init__(self):
        self.nvidia_api_key = os.getenv("NVIDIA_API_KEY")
        self.nim_base_url = os.getenv("NVIDIA_NIM_BASE_URL")
        self.nim_model = os.getenv("NVIDIA_NIM_MODEL")
        self.elevenlabs_client = ElevenLabs(
            api_key=os.getenv("ELEVENLABS_API_KEY")
        )
        
    async def get_ai_response(
        self,
        user_input: str,
        user_profile: dict,
        persona: str
    ) -> str:
        """NVIDIA NIM으로 응답 생성"""
        system_prompt = self._build_prompt(user_profile, persona)
        
        headers = {
            "Authorization": f"Bearer {self.nvidia_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.nim_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_input}
            ],
            "temperature": 0.7,
            "max_tokens": 150
        }
        
        response = requests.post(
            f"{self.nim_base_url}/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"]
        else:
            raise Exception(f"NIM API Error: {response.status_code}")
    
    def _build_prompt(self, user_profile: dict, persona: str) -> str:
        """사용자 정보 기반 프롬프트"""
        if persona == "james":
            return f"""당신은 '제임스', 비판적 사고를 중시하는 토론 AI입니다.
사용자: {user_profile['nickname']}
관심사: {user_profile['interest']}
수준: {user_profile['level']}

역할: 약점 지적, 반례 제시, 개선점 제안
제약: 2-3문장, 한국어, 존중하는 톤"""
        else:
            return f"""당신은 '린다', 긍정적 지지를 제공하는 토론 AI입니다.
사용자: {user_profile['nickname']}
관심사: {user_profile['interest']}
수준: {user_profile['level']}

역할: 강점 부각, 발전 방향 제시
제약: 2-3문장, 한국어, 따뜻한 톤, 이모지 가끔"""

# API 엔드포인트
engine = DebateEngine()

@app.post("/api/v1/debate/message")
async def debate_message(request: dict):
    try:
        # James와 Linda 응답 병렬 생성
        james_response = await engine.get_ai_response(
            request["user_input"],
            request["user_profile"],
            "james"
        )
        
        linda_response = await engine.get_ai_response(
            request["user_input"],
            request["user_profile"],
            "linda"
        )
        
        return {
            "james_response": james_response,
            "linda_response": linda_response,
            "tokens_earned": 10
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/voice/synthesize")
async def synthesize_speech(request: dict):
    """ElevenLabs로 음성 생성"""
    try:
        speaker = request.get("speaker", "james")
        text = request.get("text", "")
        
        voice_id = (
            os.getenv("ELEVENLABS_JAMES_VOICE_ID")
            if speaker == "james"
            else os.getenv("ELEVENLABS_LINDA_VOICE_ID")
        )
        
        audio = engine.elevenlabs_client.generate(
            text=text,
            voice=voice_id,
            model="eleven_monolingual_v1"
        )
        
        return StreamingResponse(
            audio,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=audio.mp3"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}
```

### 6. 배포 단계

1. **Replit에서 프로젝트 생성**
   - Python 템플릿 선택
   - GitHub에서 임포트

2. **의존성 설치**
   ```bash
   poetry install
   ```

3. **환경 변수 설정**
   - Replit Secrets 탭에서 모든 API Key 입력

4. **서버 시작**
   - Run 버튼 클릭
   - 자동으로 `uvicorn` 실행

6. **커스텀 도메인 설정**
   - Replit Deployments → Custom Domain 설정

7. **UptimeRobot으로 모니터링** (선택)
   - URL: `https://yeoul-backend.replit.app/api/v1/health`
   - Interval: 5분

---

## ✅ 체크리스트

- [ ] replit.nix 생성
- [ ] .replit 설정
- [ ] pyproject.toml 작성
- [ ] NVIDIA NIM API Key 설정
- [ ] ElevenLabs API Key 설정
- [ ] 배포 테스트

---

## 📚 참고 자료

- `task-3.1-ai-debate-engine.md` - NVIDIA NIM 연동
- `task-3.3-voice-synthesis.md` - ElevenLabs TTS
- Replit 문서: https://docs.replit.com
- NVIDIA NIM 문서: https://developer.nvidia.com/nim

---

**상태**: 🟡 Phase 5 진행 중 (배포)
**최종 업데이트**: 2026-01-31
