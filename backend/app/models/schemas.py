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
    """토론 메시지 요청 (3자 토론용)"""
    session_id: str = Field(..., description="세션 ID")
    user_message: str = Field(..., description="사용자 메시지")
    lecture_context: Optional[str] = Field(None, description="강의 컨텍스트")
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "session_123",
                "user_message": "AI의 발전은 인류에게 이로운 영향을 줍니다.",
                "lecture_context": "AI 윤리와 사회적 영향에 대한 강의"
            }
        }


class DebateMessageResponse(BaseModel):
    """토론 메시지 응답 (3자 토론용 - James와 Linda 모두 응답)"""
    session_id: str
    james_response: str = Field(..., description="제임스(비판적 관점)의 응답")
    linda_response: str = Field(..., description="린다(지지적 관점)의 응답")
    tokens_earned: int = Field(default=0, description="획득한 토큰 수")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "session_123",
                "james_response": "흥미로운 관점이지만, AI 발전이 모두에게 이롭다는 주장에는 몇 가지 반례가 있습니다.",
                "linda_response": "좋은 지적이에요! 😊 AI의 긍정적 영향에 초점을 맞춘 점이 훌륭해요.",
                "tokens_earned": 20,
                "timestamp": "2024-01-15T10:30:00Z"
            }
        }


class SingleDebateMessageRequest(BaseModel):
    """단일 토론자 메시지 요청 (기존 호환용)"""
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


class SingleDebateMessageResponse(BaseModel):
    """단일 토론자 메시지 응답 (기존 호환용)"""
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


# === 토론 리포트 관련 스키마 ===

class DebateReportRequest(BaseModel):
    """토론 리포트 생성 요청"""
    session_id: str = Field(..., description="토론 세션 ID")
    user_id: Optional[str] = Field(None, description="사용자 ID (선택)")
    ocr_text: Optional[str] = Field(None, description="OCR 텍스트 (선택)")


class DebateReportResponse(BaseModel):
    """토론 리포트 응답"""
    session_id: str
    logic_score: int = Field(..., ge=0, le=100, description="논리력 점수 (0~100)")
    persuasion_score: int = Field(..., ge=0, le=100, description="설득력 점수 (0~100)")
    topic_score: int = Field(..., ge=0, le=100, description="주제 이해도 점수 (0~100)")
    summary: str
    improvement_tips: List[str]
    ocr_alignment_score: Optional[int] = Field(None, ge=0, le=100)
    ocr_feedback: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


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


# === 추천 시스템 관련 스키마 ===

class SuggestionType(str, Enum):
    """추천 유형"""
    TOPIC = "topic"
    QUESTION = "question"
    ARGUMENT = "argument"


class SuggestionTarget(str, Enum):
    """추천 대상"""
    JAMES = "james"
    LINDA = "linda"
    GENERAL = "general"


class Suggestion(BaseModel):
    """단일 추천 항목"""
    id: str = Field(..., description="추천 ID")
    text: str = Field(..., description="추천 텍스트")
    type: SuggestionType = Field(..., description="추천 유형")
    target: Optional[SuggestionTarget] = Field(None, description="대상 토론자")


class SuggestionContext(BaseModel):
    """추천 생성 컨텍스트"""
    topic: Optional[str] = Field(None, description="토론 주제")
    user_position: Optional[Literal["pro", "con"]] = Field(None, description="사용자 입장")
    james_last: Optional[str] = Field(None, description="제임스 마지막 발언")
    linda_last: Optional[str] = Field(None, description="린다 마지막 발언")
    lecture_context: Optional[str] = Field(None, description="강의 컨텍스트")


class SuggestionGenerateRequest(BaseModel):
    """추천 생성 요청"""
    session_id: str = Field(..., description="세션 ID")
    suggestion_type: SuggestionType = Field(..., description="추천 유형")
    context: SuggestionContext = Field(default_factory=SuggestionContext)
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "session_123",
                "suggestion_type": "question",
                "context": {
                    "topic": "AI가 인간의 일자리를 대체해야 하는가?",
                    "user_position": "pro",
                    "james_last": "흥미로운 관점이지만, 반례가 있습니다.",
                    "linda_last": "좋은 지적이에요! 😊"
                }
            }
        }


class SuggestionGenerateResponse(BaseModel):
    """추천 생성 응답"""
    suggestions: List[Suggestion] = Field(..., description="추천 목록")
    generated_at: datetime = Field(default_factory=datetime.utcnow)
