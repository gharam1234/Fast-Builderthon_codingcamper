"""
토론 API 라우터
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import (
    DebateStartRequest,
    DebateStartResponse,
    DebateMessageRequest,
    DebateMessageResponse,
    ErrorResponse,
)
from app.core.dependencies import get_debate_engine
from app.services.debate_engine import DebateEngine
from datetime import datetime
import uuid

router = APIRouter()


@router.post(
    "/start",
    response_model=DebateStartResponse,
    responses={
        500: {"model": ErrorResponse, "description": "서버 에러"}
    },
    summary="토론 세션 시작",
    description="새로운 토론 세션을 시작합니다. 주제와 사용자 입장을 지정합니다.",
)
async def start_debate(
    request: DebateStartRequest,
    debate_engine: DebateEngine = Depends(get_debate_engine),
):
    """
    새로운 토론 세션을 시작합니다.
    
    - **topic**: 토론 주제
    - **user_position**: 사용자의 입장 (pro: 찬성, con: 반대)
    """
    try:
        session_id = str(uuid.uuid4())
        
        # 사용자 입장에 따라 AI 토론자 입장 배정
        if request.user_position == "pro":
            james_position = "반대 (Con)"
            linda_position = "찬성 (Pro)"
        else:
            james_position = "찬성 (Pro)"
            linda_position = "반대 (Con)"
        
        # 토론 세션 초기화 (실제 구현 시 debate_engine 사용)
        # await debate_engine.initialize_session(session_id, request.topic, request.user_position)
        
        return DebateStartResponse(
            session_id=session_id,
            topic=request.topic,
            james_position=james_position,
            linda_position=linda_position,
            opening_message=f"토론 주제: '{request.topic}'에 대한 토론을 시작합니다. 제임스는 {james_position}, 린다는 {linda_position} 입장입니다.",
            created_at=datetime.utcnow(),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post(
    "/message",
    response_model=DebateMessageResponse,
    responses={
        400: {"model": ErrorResponse, "description": "잘못된 요청"},
        500: {"model": ErrorResponse, "description": "서버 에러"},
    },
    summary="토론 메시지 전송",
    description="토론 세션에 메시지를 전송하고 AI 토론자의 응답을 받습니다.",
)
async def send_message(
    request: DebateMessageRequest,
    debate_engine: DebateEngine = Depends(get_debate_engine),
):
    """
    토론 메시지를 전송하고 AI 응답을 받습니다.
    
    - **session_id**: 토론 세션 ID
    - **message**: 사용자 메시지
    - **target_debater**: 응답할 AI 토론자 (james/linda)
    """
    try:
        # AI 토론자 응답 생성 (실제 구현 시 debate_engine 사용)
        # response = await debate_engine.generate_response(
        #     session_id=request.session_id,
        #     user_message=request.message,
        #     debater=request.target_debater,
        # )
        
        # 스텁 응답
        stub_responses = {
            "james": "흥미로운 관점이네요. 하지만 저는 다른 시각에서 바라보고 싶습니다. 이 문제에 대해 더 깊이 생각해볼 필요가 있습니다.",
            "linda": "그 의견에 동의하는 부분도 있지만, 다른 관점에서 보면 상황이 달라질 수 있습니다. 함께 더 논의해볼까요?",
        }
        
        response_message = stub_responses.get(
            request.target_debater.value,
            "응답을 생성할 수 없습니다.",
        )
        
        return DebateMessageResponse(
            session_id=request.session_id,
            debater=request.target_debater,
            message=response_message,
            audio_url=None,  # TTS 연동 시 URL 제공
            timestamp=datetime.utcnow(),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.get(
    "/sessions/{session_id}",
    summary="토론 세션 조회",
    description="특정 토론 세션의 정보를 조회합니다.",
)
async def get_session(session_id: str):
    """토론 세션 정보 조회 (스텁)"""
    return {
        "session_id": session_id,
        "status": "active",
        "message": "세션 조회 기능은 추후 구현 예정입니다.",
    }
