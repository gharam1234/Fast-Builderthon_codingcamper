"""
토론 API 라우터
3자 토론 시스템 (User → James → Linda)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import (
    DebateStartRequest,
    DebateStartResponse,
    DebateMessageRequest,
    DebateMessageResponse,
    SingleDebateMessageRequest,
    SingleDebateMessageResponse,
    DebateReportRequest,
    DebateReportResponse,
    ErrorResponse,
)
from app.core.dependencies import get_debate_engine
from app.services.debate_engine import DebateEngine
from app.services.report_store import save_debate_report
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
        
        # 토론 세션 초기화
        await debate_engine.initialize_session(
            session_id=session_id,
            topic=request.topic,
            user_position=request.user_position,
        )
        
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
    summary="3자 토론 메시지 전송",
    description="토론 세션에 메시지를 전송하고 James와 Linda의 순차적 응답을 받습니다.",
)
async def send_message(
    request: DebateMessageRequest,
    debate_engine: DebateEngine = Depends(get_debate_engine),
):
    """
    3자 토론 메시지를 전송하고 AI 응답을 받습니다.
    
    **토론 흐름**: User → James 응답 → Linda 응답 (순차적)
    
    **토큰 계산 로직**:
    - 기본 발언: +10 토큰
    - 50자 이상 논리적 발언: +20 토큰
    - 질문 형태 발언: +15 토큰
    
    - **session_id**: 토론 세션 ID
    - **user_message**: 사용자 메시지
    - **lecture_context**: 강의 컨텍스트 (선택)
    """
    try:
        # 3자 토론 처리: User → James → Linda
        james_response, linda_response, tokens_earned = await debate_engine.process_message(
            session_id=request.session_id,
            user_message=request.user_message,
            lecture_context=request.lecture_context or "",
        )
        
        return DebateMessageResponse(
            session_id=request.session_id,
            james_response=james_response,
            linda_response=linda_response,
            tokens_earned=tokens_earned,
            timestamp=datetime.utcnow(),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post(
    "/message/single",
    response_model=SingleDebateMessageResponse,
    responses={
        400: {"model": ErrorResponse, "description": "잘못된 요청"},
        500: {"model": ErrorResponse, "description": "서버 에러"},
    },
    summary="단일 토론자 메시지 전송",
    description="특정 AI 토론자(James 또는 Linda)에게만 메시지를 전송합니다.",
)
async def send_single_message(
    request: SingleDebateMessageRequest,
    debate_engine: DebateEngine = Depends(get_debate_engine),
):
    """
    단일 토론자에게 메시지를 전송하고 응답을 받습니다.
    
    - **session_id**: 토론 세션 ID
    - **message**: 사용자 메시지
    - **target_debater**: 응답할 AI 토론자 (james/linda)
    """
    try:
        response = await debate_engine.generate_response(
            session_id=request.session_id,
            user_message=request.message,
            debater=request.target_debater,
        )
        
        return SingleDebateMessageResponse(
            session_id=request.session_id,
            debater=request.target_debater,
            message=response,
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
async def get_session(
    session_id: str,
    debate_engine: DebateEngine = Depends(get_debate_engine),
):
    """토론 세션 정보 조회"""
    session = debate_engine.get_session(session_id)
    
    if not session:
        return {
            "session_id": session_id,
            "status": "not_found",
            "message": "세션을 찾을 수 없습니다.",
        }
    
    return {
        "session_id": session_id,
        "status": "active",
        "topic": session.get("topic", ""),
        "total_tokens_earned": session.get("total_tokens_earned", 0),
        "message_count": len(session.get("history", [])),
    }


@router.post(
    "/report",
    response_model=DebateReportResponse,
    responses={
        400: {"model": ErrorResponse, "description": "잘못된 요청"},
        500: {"model": ErrorResponse, "description": "서버 에러"},
    },
    summary="토론 성장 리포트 생성",
    description="세션 기록을 바탕으로 성장 리포트를 생성하고 DB에 저장합니다.",
)
async def generate_report(
    request: DebateReportRequest,
    debate_engine: DebateEngine = Depends(get_debate_engine),
):
    try:
        report = await debate_engine.generate_report(
            session_id=request.session_id,
            ocr_text=request.ocr_text or "",
        )

        await save_debate_report(
            session_id=request.session_id,
            user_id=request.user_id,
            logic_score=report.get("logic_score", 0),
            persuasion_score=report.get("persuasion_score", 0),
            topic_score=report.get("topic_score", 0),
            summary=report.get("summary", ""),
            improvement_tips=report.get("improvement_tips", []),
            ocr_alignment_score=report.get("ocr_alignment_score"),
            ocr_feedback=report.get("ocr_feedback"),
        )

        return DebateReportResponse(
            session_id=request.session_id,
            logic_score=report.get("logic_score", 0),
            persuasion_score=report.get("persuasion_score", 0),
            topic_score=report.get("topic_score", 0),
            summary=report.get("summary", ""),
            improvement_tips=report.get("improvement_tips", []),
            ocr_alignment_score=report.get("ocr_alignment_score"),
            ocr_feedback=report.get("ocr_feedback"),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
