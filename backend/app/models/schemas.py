"""
Pydantic 모델 정의
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum


class DebaterRole(str, Enum):
    """토론자 역할"""
    JAMES = "james"
    LINDA = "linda"
    USER = "user"


class MessageType(str, Enum):
    """메시지 타입"""
    TEXT = "text"
    AUDIO = "audio"
    SYSTEM = "system"


# === 토론 관련 스키마 ===

class DebateStartRequest(BaseModel):
    """토론 세션 시작 요청"""
    topic: str = Field(..., description="토론 주제")
    user_position: Literal["pro", "con"] = Field(..., description="사용자 입장 (찬성/반대)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "topic": "AI가 인간의 일자리를 대체해야 하는가?",
                "user_position": "pro"
            }
        }


class DebateStartResponse(BaseModel):
    """토론 세션 시작 응답"""
    session_id: str = Field(..., description="세션 ID")
    topic: str = Field(..., description="토론 주제")
    james_position: str = Field(..., description="제임스의 입장")
    linda_position: str = Field(..., description="린다의 입장")
    opening_message: str = Field(..., description="시작 메시지")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class DebateMessageRequest(BaseModel):
    """토론 메시지 요청"""
    session_id: str = Field(..., description="세션 ID")
    message: str = Field(..., description="사용자 메시지")
    target_debater: DebaterRole = Field(
        default=DebaterRole.JAMES,
        description="응답할 토론자 선택"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "session_123",
                "message": "AI의 발전은 인류에게 이로운 영향을 줍니다.",
                "target_debater": "james"
            }
        }


class DebateMessageResponse(BaseModel):
    """토론 메시지 응답"""
    session_id: str
    debater: DebaterRole
    message: str
    audio_url: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "session_123",
                "debater": "james",
                "message": "흥미로운 관점이네요. 하지만 저는 다른 의견을 가지고 있습니다...",
                "audio_url": "/audio/response_123.mp3",
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }


class DebateHistory(BaseModel):
    """토론 히스토리"""
    messages: List[DebateMessageResponse]
    total_count: int


# === 음성 관련 스키마 ===

class VoiceSynthesizeRequest(BaseModel):
    """TTS 요청"""
    text: str = Field(..., description="변환할 텍스트", max_length=5000)
    voice: DebaterRole = Field(
        default=DebaterRole.JAMES,
        description="음성 선택 (james/linda)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "안녕하세요, 저는 제임스입니다.",
                "voice": "james"
            }
        }


class VoiceSynthesizeResponse(BaseModel):
    """TTS 응답"""
    audio_url: str = Field(..., description="생성된 오디오 URL")
    duration_seconds: Optional[float] = Field(None, description="오디오 길이(초)")
    voice_used: str = Field(..., description="사용된 음성")


# === 공통 응답 스키마 ===

class ErrorResponse(BaseModel):
    """에러 응답"""
    error: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class HealthResponse(BaseModel):
    """헬스체크 응답"""
    status: str
    version: str
    environment: str
