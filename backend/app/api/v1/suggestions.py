"""
추천 시스템 API 라우터
토론 중 추천 버튼 생성 엔드포인트
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.models.schemas import (
    SuggestionGenerateRequest,
    SuggestionGenerateResponse,
    ErrorResponse,
)
from app.services.suggestion_service import SuggestionService, get_suggestion_service

router = APIRouter()


@router.post(
    "/generate",
    response_model=SuggestionGenerateResponse,
    responses={
        400: {"model": ErrorResponse, "description": "잘못된 요청"},
        500: {"model": ErrorResponse, "description": "서버 에러"},
    },
    summary="추천 생성",
    description="토론 맥락에 맞는 추천(주제/질문/발언)을 생성합니다.",
)
async def generate_suggestions(
    request: SuggestionGenerateRequest,
    suggestion_service: SuggestionService = Depends(get_suggestion_service),
):
    """
    토론 추천을 생성합니다.
    
    **추천 유형**:
    - `topic`: 토론 주제 추천 (토론 시작 전)
    - `question`: 질문 추천 (제임스/린다에게 던질 질문)
    - `argument`: 발언 추천 (사용자가 할 발언)
    
    **사용 시점**:
    - 토론 시작 시: topic 추천
    - AI 응답 후: question/argument 추천
    - 30초 무응답 시: 새로운 추천 요청
    """
    try:
        context = request.context
        
        suggestions = await suggestion_service.generate_suggestions(
            suggestion_type=request.suggestion_type.value,
            topic=context.topic or "",
            user_position=context.user_position or "",
            james_last=context.james_last or "",
            linda_last=context.linda_last or "",
            lecture_context=context.lecture_context or "",
        )
        
        return SuggestionGenerateResponse(suggestions=suggestions)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.get(
    "/types",
    summary="추천 유형 목록",
    description="사용 가능한 추천 유형을 반환합니다.",
)
async def get_suggestion_types():
    """사용 가능한 추천 유형 목록"""
    return {
        "types": [
            {
                "value": "topic",
                "label": "토론 주제",
                "emoji": "🎯",
                "description": "토론 시작 전 주제 추천"
            },
            {
                "value": "question",
                "label": "질문하기",
                "emoji": "❓",
                "description": "제임스/린다에게 던질 질문"
            },
            {
                "value": "argument",
                "label": "발언하기",
                "emoji": "💬",
                "description": "내 입장을 표현할 발언"
            },
        ]
    }
