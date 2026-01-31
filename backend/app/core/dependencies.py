"""
의존성 주입 관리
"""
from functools import lru_cache
from app.core.config import settings
from app.services.debate_engine import DebateEngine
from app.services.voice_service import VoiceService


@lru_cache()
def get_debate_engine() -> DebateEngine:
    """토론 엔진 싱글톤 반환"""
    return DebateEngine()


@lru_cache()
def get_voice_service() -> VoiceService:
    """음성 서비스 싱글톤 반환"""
    return VoiceService()
