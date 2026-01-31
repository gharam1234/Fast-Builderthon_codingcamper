"""
환경 설정 관리
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """애플리케이션 설정"""
    
    # Environment
    ENV: str = "development"
    DEBUG: bool = True
    
    # NVIDIA AI API
    NVIDIA_API_KEY: Optional[str] = None
    
    # ElevenLabs TTS API
    ELEVENLABS_API_KEY: Optional[str] = None
    ELEVENLABS_JAMES_VOICE_ID: Optional[str] = None
    ELEVENLABS_LINDA_VOICE_ID: Optional[str] = None
    
    # API Settings
    API_V1_PREFIX: str = "/api/v1"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """설정 싱글톤 반환"""
    return Settings()


settings = get_settings()
