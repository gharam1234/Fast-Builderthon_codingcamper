# Task 1.2: Backend 프로젝트 셋업

## 목표
FastAPI + LangChain 기반 AI 백엔드 구축

---

## 프롬프트

```
FastAPI 백엔드 프로젝트를 생성해줘. 요구사항:

1. 프로젝트 구조:
   /app
     main.py              (FastAPI 앱 진입점)
     /api
       /v1
         debate.py        (토론 API 라우터)
         voice.py         (음성 API 라우터)
     /core
       config.py          (환경설정)
       dependencies.py    (의존성 주입)
     /services
       debate_engine.py   (AI 토론 로직)
       voice_service.py   (ElevenLabs 연동)
     /models
       schemas.py         (Pydantic 모델)
     /prompts
       james.txt          (제임스 시스템 프롬프트)
       linda.txt          (린다 시스템 프롬프트)
   requirements.txt
   .env.example

2. 필수 패키지 (requirements.txt):
   fastapi==0.109.0
   uvicorn[standard]==0.27.0
   python-dotenv==1.0.0
   langchain==0.1.0
   langchain-nvidia-ai-endpoints==0.0.1
   elevenlabs==0.2.24
   pydantic==2.5.0
   httpx==0.26.0

3. CORS 설정:
   - localhost:3000 허용
   - Vercel 도메인 허용

4. API 엔드포인트 스텁:
   POST /api/v1/debate/message    (사용자 메시지 처리)
   POST /api/v1/debate/start      (토론 세션 시작)
   POST /api/v1/voice/synthesize  (TTS 요청)
   GET  /api/v1/health            (헬스체크)

5. 환경변수:
   NVIDIA_API_KEY=
   ELEVENLABS_API_KEY=
   ELEVENLABS_JAMES_VOICE_ID=
   ELEVENLABS_LINDA_VOICE_ID=
```

---

## 예상 결과물

- `app/main.py` - FastAPI 앱 메인
- `app/api/v1/debate.py` - 토론 API
- `app/api/v1/voice.py` - 음성 API
- `app/core/config.py` - 설정
- `app/models/schemas.py` - Pydantic 모델
- `requirements.txt` - 의존성
- `.env.example` - 환경변수 템플릿

## 예상 시간
약 1시간
