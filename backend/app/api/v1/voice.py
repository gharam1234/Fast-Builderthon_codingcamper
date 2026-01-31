"""
음성 API 라우터 (ElevenLabs TTS)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from app.models.schemas import (
    VoiceSynthesizeRequest,
    VoiceSynthesizeResponse,
    ErrorResponse,
    DebaterRole,
)
from app.core.dependencies import get_voice_service
from app.services.voice_service import VoiceService

router = APIRouter()


@router.post(
    "/synthesize",
    response_model=VoiceSynthesizeResponse,
    responses={
        400: {"model": ErrorResponse, "description": "잘못된 요청"},
        500: {"model": ErrorResponse, "description": "서버 에러"},
    },
    summary="텍스트를 음성으로 변환",
    description="ElevenLabs를 사용하여 텍스트를 음성으로 변환합니다.",
)
async def synthesize_voice(
    request: VoiceSynthesizeRequest,
    voice_service: VoiceService = Depends(get_voice_service),
):
    """
    텍스트를 음성으로 변환합니다.
    
    - **text**: 변환할 텍스트 (최대 5000자)
    - **voice**: 사용할 음성 (james/linda)
    """
    try:
        # 실제 구현 시 voice_service 사용
        # audio_url = await voice_service.synthesize(
        #     text=request.text,
        #     voice=request.voice,
        # )
        
        # 스텁 응답
        voice_name = "제임스" if request.voice == DebaterRole.JAMES else "린다"
        
        return VoiceSynthesizeResponse(
            audio_url=f"/audio/synthesized_{request.voice.value}_stub.mp3",
            duration_seconds=len(request.text) * 0.05,  # 대략적인 추정
            voice_used=voice_name,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post(
    "/synthesize/stream",
    summary="스트리밍 TTS",
    description="텍스트를 음성으로 변환하여 스트리밍합니다.",
)
async def synthesize_voice_stream(
    request: VoiceSynthesizeRequest,
    voice_service: VoiceService = Depends(get_voice_service),
):
    """
    텍스트를 음성으로 변환하여 스트리밍합니다. (스텁)
    
    실제 구현 시 audio/mpeg 스트림을 반환합니다.
    """
    # 스텁 - 실제 구현 시 StreamingResponse 사용
    return {
        "message": "스트리밍 TTS는 추후 구현 예정입니다.",
        "text_preview": request.text[:100] + "..." if len(request.text) > 100 else request.text,
        "voice": request.voice.value,
    }


@router.get(
    "/voices",
    summary="사용 가능한 음성 목록",
    description="사용 가능한 TTS 음성 목록을 반환합니다.",
)
async def list_voices():
    """사용 가능한 음성 목록 반환"""
    return {
        "voices": [
            {
                "id": "james",
                "name": "제임스",
                "description": "남성 음성 - 논리적이고 차분한 토론 스타일",
                "language": "ko-KR",
            },
            {
                "id": "linda",
                "name": "린다",
                "description": "여성 음성 - 감성적이고 설득력 있는 토론 스타일",
                "language": "ko-KR",
            },
        ]
    }
