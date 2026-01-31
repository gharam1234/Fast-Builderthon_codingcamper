# Task 1.2: Backend 프로젝트 셋업

## 📋 현재 상태 (2026-01-31)

### ✅ 완료된 항목

#### Frontend-Backend Integration
- ✅ `frontend/types/index.ts` - UserProfile, ChatRequest, ChatResponse 타입 정의
- ✅ `frontend/hooks/useAuth.ts` - 사용자 프로필 관리 (Supabase 지원)
- ✅ `frontend/hooks/useChat.ts` - 사용자 정보 포함한 토론 (백엔드 통합)
- ✅ `frontend/lib/api.ts` - API 통합 계층
- ✅ `Backend/main.py` - FastAPI 백엔드 (사용자 정보 처리)
- ✅ `Backend/requirements.txt` - 의존성 관리
- ✅ `Backend/.env.example` - 환경변수 템플릿
- ✅ `INTEGRATION_GUIDE.md` - 완벽한 설정 및 테스트 가이드

#### 핵심 기능
- 🛂 **사용자 정보 통합**: 프론트엔드 → 백엔드로 UserProfile 자동 전송
- 🤖 **AI 개인화**: 백엔드에서 사용자 정보로 AI 시스템 프롬프트 구성
- 💬 **토론 API**: `/api/v1/debate/message` 엔드포인트 구현
- 🔗 **폴백 지원**: 백엔드 없을 때 로컬 시뮬레이션 자동 작동

---

## 🎯 남은 작업

### Phase 2: LLM 통합 (중요도: 높음)

#### 1. 실제 AI 모델 연동
```python
# Backend/main.py - call_ai_with_user_context() 함수 구현

# Before: 더미 응답
return ai_responses.get(persona, "좋은 질문입니다!")

# After: 실제 Claude/Llama API 호출
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

llm = ChatOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
system_prompt = build_system_prompt(user_profile)
# Claude API 호출...
```

#### 2. 환경변수 설정
```bash
# Backend/.env 생성
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
ELEVENLABS_JAMES_VOICE_ID=...
ELEVENLABS_LINDA_VOICE_ID=...
```

#### 3. 시스템 프롬프트 파일 작성
```
Backend/
├── prompts/
│   ├── james.txt      # "당신은 비판적인 에이전트입니다..."
│   └── linda.txt      # "당신은 지지하는 에이전트입니다..."
```

---

### Phase 3: 프로젝트 구조 모듈화 (선택사항, 중요도: 중간)

#### 현재 구조
```
Backend/
├── main.py          # 모든 코드가 여기에
├── requirements.txt
├── .env.example
└── .env
```

#### 확장 구조 (선택사항)
```
Backend/
├── main.py                    # 진입점만 유지
├── app/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── debate.py      # 토론 API 라우터
│   │       └── voice.py       # 음성 API 라우터
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py          # 환경설정
│   │   └── dependencies.py    # 의존성 주입
│   ├── services/
│   │   ├── __init__.py
│   │   ├── debate_engine.py   # AI 토론 로직
│   │   └── voice_service.py   # ElevenLabs 통합
│   └── models/
│       ├── __init__.py
│       └── schemas.py         # Pydantic 모델
├── prompts/
│   ├── james.txt
│   └── linda.txt
├── requirements.txt
├── .env.example
├── .env
└── README.md
```

---

### Phase 4: ElevenLabs TTS 통합 (중요도: 중간)

```python
# Backend/main.py - synthesize_voice() 함수 구현

from elevenlabs import generate, play
from elevenlabs.client import ElevenLabs

@app.post("/api/v1/voice/synthesize")
async def synthesize_voice(request: dict):
    client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))
    
    audio = generate(
        text=request.get("text"),
        voice=request.get("voice"),  # "james" 또는 "linda"
        api_key=os.getenv("ELEVENLABS_API_KEY")
    )
    
    return StreamingResponse(audio, media_type="audio/mpeg")
```

---

### Phase 5: 데이터베이스 연동 (선택사항, 중요도: 낮음)

#### Supabase 연동
```python
# Backend에서 사용자 정보 저장
from supabase import create_client

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# 토론 이력 저장
supabase.table("chat_history").insert({
    "user_id": request.user_profile.id,
    "message": request.user_input,
    "response": response.message,
    "tokens_earned": response.tokens_earned
}).execute()
```

---

## 🚀 빠른 시작 가이드

### 1️⃣ 프론트엔드 실행
```bash
cd /Users/hanchang-gi/Desktop/Project-yeoul/frontend

# 환경변수 설정
cat > .env.local << 'ENVEOF'
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
ENVEOF

# 실행
pnpm install
pnpm dev
# http://localhost:3000
```

### 2️⃣ 백엔드 실행
```bash
cd /Users/hanchang-gi/Desktop/Project-yeoul/Backend

# 가상환경 생성
python -m venv venv
source venv/bin/activate  # Mac/Linux
# venv\Scripts\activate  # Windows

# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정 (선택)
cp .env.example .env
# .env 파일에서 API Key 설정

# 실행
python main.py
# 또는 uvicorn main:app --reload
# http://localhost:8000
```

### 3️⃣ API 테스트
```bash
# 헬스 체크
curl http://localhost:8000/api/v1/health

# 토론 메시지 전송
curl -X POST http://localhost:8000/api/v1/debate/message \
  -H "Content-Type: application/json" \
  -d '{
    "user_input": "Custom Hooks가 정말 필요할까요?",
    "context": "React",
    "user_profile": {
      "id": "user_123",
      "nickname": "지민",
      "interest": "React",
      "level": "intermediate"
    }
  }'
```

응답:
```json
{
  "message": "지민님, 좋은 질문입니다...",
  "sender": "james",
  "tokens_earned": 5
}
```

---

## 📝 코드 예시

### Frontend (useChat Hook)
```typescript
const { userProfile } = useAuth()

const { messages, handleSendMessage } = useChat({
  onEarnTokens: earnTokens,
  userProfile,        // 👈 사용자 정보 자동 전송
  lectureContext: 'React',
  lectureId: 1,
})
```

### Backend (FastAPI)
```python
@app.post("/api/v1/debate/message", response_model=ChatResponse)
async def debate_message(request: ChatRequest) -> ChatResponse:
    # 사용자 정보 추출
    user_name = request.user_profile.nickname
    user_interest = request.user_profile.interest
    
    # 시스템 프롬프트 구성
    system_prompt = build_system_prompt(request.user_profile)
    
    # AI 호출
    ai_response = await call_ai_with_user_context(
        user_input=request.user_input,
        user_profile=request.user_profile,
        context=request.context,
        ai_persona="james"
    )
    
    return ChatResponse(
        message=ai_response,
        sender="james",
        tokens_earned=5
    )
```

---

## 📚 참고 자료

| 문서 | 설명 |
|------|------|
| `INTEGRATION_GUIDE.md` | 완벽한 설정 및 테스트 가이드 |
| `Backend/main.py` | FastAPI 백엔드 (주석 포함) |
| `frontend/lib/api.ts` | API 통합 계층 |
| `frontend/hooks/useChat.ts` | 토론 로직 |
| `frontend/types/index.ts` | 타입 정의 |

---

## ✅ 체크리스트

### 긴급 (필수)
- [ ] 실제 LLM API Key 설정 (OpenAI)
- [ ] `Backend/main.py`의 `call_ai_with_user_context()` 실제 구현

### 단기 (1-2주)
- [ ] ElevenLabs TTS 구현
- [ ] 프롬프트 파일 작성 (james.txt, linda.txt)
- [ ] 프로젝트 구조 모듈화

### 중기 (2-4주)
- [ ] Supabase 연동
- [ ] 토론 이력 저장
- [ ] 사용자 인증 개선

### 장기 (1개월+)
- [ ] 자동 테스트 작성
- [ ] 성능 최적화
- [ ] 배포 (Vercel + Railway/Heroku)

---

## 🐛 트러블슈팅

### CORS 에러
```
Error: Access to XMLHttpRequest blocked by CORS
```
**해결**: `Backend/main.py`에서 CORS 설정 확인
```python
allow_origins=["http://localhost:3000"]
```

### 백엔드 연결 불가
```
Failed to fetch from http://localhost:8000
```
**해결**:
```bash
# 1. 백엔드 실행 확인
curl http://localhost:8000/api/v1/health

# 2. 프론트엔드 환경변수 확인
cat frontend/.env.local | grep BACKEND_URL

# 3. 방화벽 확인 (포트 8000 열려있는지)
```

### Python 의존성 에러
```
ModuleNotFoundError: No module named 'fastapi'
```
**해결**:
```bash
# 가상환경 활성화 확인
which python  # /path/to/venv/bin/python 나와야 함
pip install -r requirements.txt
```

---

## 🎓 학습 자료

- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [LangChain 문서](https://python.langchain.com/)
- [ElevenLabs 문서](https://docs.elevenlabs.io/)
- [Supabase 문서](https://supabase.com/docs)

---

**최종 상태**: 🟢 핵심 기능 완료 (Phase 1-2)
**다음 우선순위**: LLM 실제 통합 + ElevenLabs TTS
**최종 업데이트**: 2026-01-31
