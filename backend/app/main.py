"""
FastAPI Backend for AI Debate Platform
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import debate, voice
from app.core.config import settings

app = FastAPI(
    title="AI Debate Platform API",
    description="AI 토론 플랫폼 백엔드 API - FastAPI + LangChain",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(debate.router, prefix="/api/v1/debate", tags=["debate"])
app.include_router(voice.router, prefix="/api/v1/voice", tags=["voice"])


@app.get("/api/v1/health", tags=["health"])
async def health_check():
    """헬스체크 엔드포인트"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.ENV,
    }


@app.get("/", tags=["root"])
async def root():
    """루트 엔드포인트"""
    return {
        "message": "AI Debate Platform API",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
