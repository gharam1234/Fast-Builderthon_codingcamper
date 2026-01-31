# Task 3.1: AI 토론 엔진 (NVIDIA NIM)

## 📋 현재 상태 (2026-01-31)

### ✅ 완료된 항목
- ✅ `Backend/main.py` - FastAPI 백엔드 기본 구조
- ✅ 사용자 정보(UserProfile) 기반 시스템 프롬프트 생성
- ✅ API 엔드포인트 (`/api/v1/debate/message`)
- ✅ ElevenLabs TTS 통합

### 🔄 진행 중인 항목
- 🔄 **NVIDIA NIM LLM 통합**
- 🔄 **프롬프트 파일** 작성 (james.txt, linda.txt)
- 🔄 **Replit 배포** 설정

---

## 🎯 목표
**NVIDIA NIM**으로 사용자 정보 기반 3자 토론 엔진 구현

---

## 📝 구현 가이드

### Phase 1: NVIDIA NIM API 연동

#### 1. 백엔드 패키지 설치
```bash
pip install requests python-dotenv
```

#### 2. 환경변수 설정
```bash
# Backend/.env
NVIDIA_API_KEY=nvapi-...
NVIDIA_NIM_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_NIM_MODEL=meta/llama-3.1-405b-instruct
```

#### 3. Backend/main.py 수정
```python
import requests
import os
from typing import Tuple

class DebateEngine:
    def __init__(self):
        self.api_key = os.getenv("NVIDIA_API_KEY")
        self.base_url = os.getenv("NVIDIA_NIM_BASE_URL")
        self.model = os.getenv("NVIDIA_NIM_MODEL")
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def call_ai_with_user_context(
        self,
        user_input: str,
        user_profile: UserProfile,
        context: str,
        ai_persona: str
    ) -> str:
        # 사용자 정보 기반 시스템 프롬프트
        system_prompt = self._build_system_prompt(
            user_profile, ai_persona
        )
        
        # NVIDIA NIM API 호출
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_input}
            ],
            "temperature": 0.7,
            "max_tokens": 150,
            "top_p": 0.9
        }
        
        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers=self.headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"]
        else:
            raise Exception(f"NIM API Error: {response.status_code}")
    
    def _build_system_prompt(
        self,
        user_profile: UserProfile,
        persona: str
    ) -> str:
        if persona == "james":
            return f"""당신은 '제임스', 비판적 사고를 중시하는 토론 AI입니다.
사용자: {user_profile.nickname}
관심사: {user_profile.interest}
수준: {user_profile.level}

역할: 주장의 약점, 반례, 개선점을 제시
말투: 논리적이고 직설적, 하지만 존중하는 톤
목표: 사용자가 더 깊이 생각하도록 유도
제약: 2-3문장으로 간결하게, 한국어로 대화

{user_profile.nickname}님의 관심사({user_profile.interest})와 수준({user_profile.level})을
고려하여 답변하세요."""
        else:  # linda
            return f"""당신은 '린다', 긍정적 지지를 제공하는 토론 AI입니다.
사용자: {user_profile.nickname}
관심사: {user_profile.interest}
수준: {user_profile.level}

역할: 주장의 강점을 부각, 발전 방향 제시
말투: 따뜻하고 격려하는 톤, 이모지 가끔 사용
목표: 사용자의 자신감을 높이고 아이디어 확장
제약: 2-3문장으로 간결하게, 한국어로 대화

{user_profile.nickname}님의 관심사({user_profile.interest})와 수준({user_profile.level})을
고려하여 답변하세요."""
```

---

### Phase 2: 프롬프트 파일 관리

#### Backend/prompts/james.txt
```
당신은 '제임스', 비판적 사고를 중시하는 토론 AI입니다.

[성격]
- 논리적이고 분석적
- 직설적이지만 존중하는 톤
- 건설적인 비판 제공

[역할]
1. 사용자 주장의 약점이나 빈틈을 찾아 질문
2. 반대 관점이나 반례 제시
3. 논리적 개선점 제안

[제약]
- 반드시 2-3문장으로 간결하게 답변
- 한국어로 대화
- 인신공격 금지, 아이디어에만 집중
- 너무 부정적이지 않게, 발전적 방향 제시

[사용자 정보]
이름: {user_nickname}
관심사: {user_interest}
수준: {user_level}

위 정보를 고려하여 답변하세요.
```

#### Backend/prompts/linda.txt
```
당신은 '린다', 긍정적 지지를 제공하는 토론 AI입니다.

[성격]
- 따뜻하고 격려하는 톤
- 가끔 이모지 사용 (😊, 💡, 👍 등)
- 열정적이고 호기심 많음

[역할]
1. 사용자 주장의 강점을 찾아 부각
2. 아이디어를 더 발전시킬 방향 제시
3. 추가적인 관점이나 예시 제공

[제약]
- 반드시 2-3문장으로 간결하게 답변
- 한국어로 대화
- 무조건적 동의가 아닌 진정한 지지
- 구체적인 이유와 함께 칭찬

[사용자 정보]
이름: {user_nickname}
관심사: {user_interest}
수준: {user_level}

위 정보를 고려하여 답변하세요.
```

---

### Phase 3: NVIDIA NIM 비동기 호출

```python
import asyncio
import aiohttp

class DebateEngine:
    async def process_message(
        self,
        user_input: str,
        user_profile: UserProfile
    ) -> Tuple[str, str]:
        """James와 Linda 응답을 병렬로 생성"""
        
        # 병렬 처리
        james_task = asyncio.create_task(
            self.call_ai_with_user_context(
                user_input, user_profile, "james"
            )
        )
        linda_task = asyncio.create_task(
            self.call_ai_with_user_context(
                user_input, user_profile, "linda"
            )
        )
        
        james_response, linda_response = await asyncio.gather(
            james_task, linda_task
        )
        
        return james_response, linda_response
```

---

## 🔗 Frontend-Backend 연동

### Frontend (useChat Hook)
```typescript
// frontend/hooks/useChat.ts
const handleSendMessage = async () => {
  const chatRequest: ChatRequest = {
    user_input: inputText,
    context: lectureContext,
    user_profile: userProfile,  // 👈 사용자 정보 포함
  }
  
  const response = await callBackendAPI<ChatResponse>(
    '/api/v1/debate/message',
    chatRequest
  )
  // James & Linda 응답 표시
}
```

### Backend (FastAPI)
```python
# Backend/main.py
@app.post("/api/v1/debate/message", response_model=ChatResponse)
async def debate_message(request: ChatRequest) -> ChatResponse:
    engine = DebateEngine()
    
    # 사용자 정보 기반 응답 생성
    james_response, linda_response = await engine.process_message(
        user_input=request.user_input,
        user_profile=request.user_profile
    )
    
    return ChatResponse(
        james_response=james_response,
        linda_response=linda_response,
        tokens_earned=10
    )
```

---

## ✅ 체크리스트

### 긴급 (필수)
- [ ] NVIDIA NIM API Key 설정
- [ ] requests 패키지 설치
- [ ] NVIDIA NIM API 호출 테스트

### 단기 (1주)
- [ ] 프롬프트 파일 최적화
- [ ] 사용자 정보 기반 프롬프트 개선
- [ ] 토큰 계산 로직 구현

### 중기 (2주)
- [ ] Replit에 배포
- [ ] 응답 품질 평가
- [ ] ElevenLabs TTS 연동

---

## 📚 참고 자료

- `Backend/main.py` - API 구현
- `frontend/lib/api.ts` - API 호출
- `frontend/hooks/useChat.ts` - 토론 로직
- NVIDIA NIM 문서: https://developer.nvidia.com/nim

---

**상태**: 🟡 Phase 3 진행 중 (NVIDIA NIM)
**다음**: ElevenLabs TTS + Supabase 데이터베이스
**최종 업데이트**: 2026-01-31
