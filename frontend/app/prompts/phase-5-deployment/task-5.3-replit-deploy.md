# Task 5.3: Replit 배포 (Backend)

## 목표
FastAPI 백엔드를 Replit에 배포

---

## 프롬프트

```
FastAPI 백엔드를 Replit에 배포하기 위한 설정을 해줘.

요구사항:
1. replit.nix:
   { pkgs }: {
     deps = [
       pkgs.python311
       pkgs.poetry
     ];
   }

2. .replit 설정:
   run = "uvicorn app.main:app --host 0.0.0.0 --port 8080"
   
   [env]
   PYTHONPATH = "."

3. pyproject.toml (Poetry):
   - Python 3.11
   - 모든 의존성 명시
   - 개발/프로덕션 의존성 분리

4. Secrets 설정:
   - NVIDIA_API_KEY
   - ELEVENLABS_API_KEY
   - ELEVENLABS_JAMES_VOICE_ID
   - ELEVENLABS_LINDA_VOICE_ID

5. Always On 설정:
   - Replit Deployments 사용
   - 커스텀 도메인 연결

6. 헬스체크:
   - UptimeRobot 등으로 /health 모니터링
   - 슬립 방지

7. CORS 최종 설정:
   - Vercel 프로덕션 도메인 허용
   - 로컬 개발 환경 허용
```

---

## 1. Replit 설정 파일

### replit.nix
```nix
{ pkgs }: {
  deps = [
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.python311Packages.poetry-core
  ];
}
```

### .replit
```toml
run = "python -m uvicorn app.main:app --host 0.0.0.0 --port 8080"

[env]
PYTHONPATH = "."

[nix]
channel = "stable-23_11"

[deployment]
run = ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port 8080"]

[[ports]]
localPort = 8080
externalPort = 80
```

## 2. pyproject.toml

```toml
[tool.poetry]
name = "yeoul-backend"
version = "1.0.0"
description = "여울 AI 세미나 백엔드"
authors = ["Team codingcamper"]
readme = "README.md"

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.109.0"
uvicorn = {extras = ["standard"], version = "^0.27.0"}
python-dotenv = "^1.0.0"
langchain = "^0.1.0"
langchain-nvidia-ai-endpoints = "^0.0.1"
elevenlabs = "^0.2.24"
pydantic = "^2.5.0"
pydantic-settings = "^2.1.0"
httpx = "^0.26.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
pytest-asyncio = "^0.21.0"
black = "^23.12.0"
ruff = "^0.1.9"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

## 3. requirements.txt (대안)

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-dotenv==1.0.0
langchain==0.1.0
langchain-nvidia-ai-endpoints==0.0.1
elevenlabs==0.2.24
pydantic==2.5.0
pydantic-settings==2.1.0
httpx==0.26.0
```

## 4. CORS 설정 (최종)

```python
# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Yeoul AI Seminar API",
    description="여울 - AI 세미나 토론 백엔드",
    version="1.0.0"
)

# CORS 설정
origins = [
    "http://localhost:3000",           # 로컬 개발
    "https://yeoul.vercel.app",        # Vercel 프로덕션
    "https://*.vercel.app",            # Vercel 프리뷰
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
from app.api.v1 import debate, voice

app.include_router(debate.router, prefix="/api/v1/debate", tags=["debate"])
app.include_router(voice.router, prefix="/api/v1/voice", tags=["voice"])

# 헬스체크
@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "service": "yeoul-backend"}
```

## 5. Secrets 설정 (Replit)

Replit > Tools > Secrets에서 설정:

| Key | Description |
|-----|-------------|
| `NVIDIA_API_KEY` | NVIDIA NIM API 키 |
| `ELEVENLABS_API_KEY` | ElevenLabs API 키 |
| `ELEVENLABS_JAMES_VOICE_ID` | James 음성 ID |
| `ELEVENLABS_LINDA_VOICE_ID` | Linda 음성 ID |

## 6. 배포 단계

### Step 1: Replit 프로젝트 생성
1. [replit.com](https://replit.com) 접속
2. "Create Repl" 클릭
3. Template: Python 선택
4. Name: `yeoul-backend`

### Step 2: 코드 업로드
```bash
# GitHub에서 import 또는 직접 파일 업로드
```

### Step 3: Secrets 설정
1. Tools > Secrets 클릭
2. 환경변수 추가

### Step 4: 의존성 설치
```bash
# Shell에서 실행
pip install -r requirements.txt
```

### Step 5: 테스트 실행
```bash
# Run 버튼 클릭 또는
python -m uvicorn app.main:app --host 0.0.0.0 --port 8080
```

### Step 6: Deployments 설정
1. Deployments 탭 클릭
2. "Deploy" 버튼 클릭
3. Reserved VM 선택 (Always On)

## 7. 헬스체크 설정 (UptimeRobot)

1. [uptimerobot.com](https://uptimerobot.com) 가입
2. New Monitor 생성
3. Monitor Type: HTTP(s)
4. URL: `https://yeoul-backend.replit.app/api/v1/health`
5. Monitoring Interval: 5분

## 8. 배포 체크리스트

- [ ] 모든 Secrets 설정됨
- [ ] requirements.txt 완성
- [ ] CORS 도메인 설정
- [ ] 헬스체크 응답 확인
- [ ] Deployment 활성화
- [ ] UptimeRobot 설정 (선택)

## 9. 디버깅 팁

### 로그 확인
```bash
# Replit Shell에서
cat /var/log/uvicorn.log
```

### 수동 테스트
```bash
# 헬스체크
curl https://yeoul-backend.replit.app/api/v1/health

# 토론 API 테스트
curl -X POST https://yeoul-backend.replit.app/api/v1/debate/message \
  -H "Content-Type: application/json" \
  -d '{"session_id": "test", "user_message": "안녕하세요", "lecture_context": "React Hooks"}'
```

## 예상 결과물

- `.replit`
- `replit.nix`
- `requirements.txt` 또는 `pyproject.toml`
- 배포된 백엔드 URL

## 예상 시간
약 30분
