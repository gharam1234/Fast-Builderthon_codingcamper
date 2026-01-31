"""
음성 API 라우터 (ElevenLabs TTS)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response
import logging
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
logger = logging.getLogger(__name__)


@router.post(
    "/synthesize",
    responses={
        200: {"content": {"audio/mpeg": {}}, "description": "MP3 오디오 데이터"},
        400: {"model": ErrorResponse, "description": "잘못된 요청"},
        500: {"model": ErrorResponse, "description": "서버 에러"},
    },
    summary="텍스트를 음성으로 변환",
    description="ElevenLabs를 사용하여 텍스트를 음성으로 변환하고 MP3 오디오를 반환합니다.",
)
async def synthesize_voice(
    request: VoiceSynthesizeRequest,
    voice_service: VoiceService = Depends(get_voice_service),
):
    """
    텍스트를 음성으로 변환합니다.
    
    - **text**: 변환할 텍스트 (최대 5000자)
    - **voice**: 사용할 음성 (james/linda)
    
    Returns:
        audio/mpeg 형식의 오디오 데이터
    """
    try:
        logger.info(
            "TTS synthesize request voice=%s text_len=%s",
            request.voice.value,
            len(request.text),
        )
        audio_bytes = await voice_service.synthesize(
            text=request.text,
            voice=request.voice,
        )
        logger.info(
            "TTS synthesize response voice=%s bytes=%s",
            request.voice.value,
            len(audio_bytes),
        )
        
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f'attachment; filename="{request.voice.value}.mp3"',
                "Content-Length": str(len(audio_bytes)),
            }
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"음성 합성 중 오류가 발생했습니다: {str(e)}",
        )


@router.post(
    "/synthesize/stream",
    responses={
        200: {"content": {"audio/mpeg": {}}, "description": "스트리밍 MP3 오디오"},
        400: {"model": ErrorResponse, "description": "잘못된 요청"},
        500: {"model": ErrorResponse, "description": "서버 에러"},
    },
    summary="스트리밍 TTS",
    description="텍스트를 음성으로 변환하여 스트리밍합니다.",
)
async def synthesize_voice_stream(
    request: VoiceSynthesizeRequest,
    voice_service: VoiceService = Depends(get_voice_service),
):
    """
    텍스트를 음성으로 변환하여 스트리밍합니다.
    
    - **text**: 변환할 텍스트 (최대 5000자)
    - **voice**: 사용할 음성 (james/linda)
    
    Returns:
        스트리밍 audio/mpeg 형식의 오디오 데이터
    """
    try:
        return StreamingResponse(
            voice_service.synthesize_stream(
                text=request.text,
                voice=request.voice,
            ),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f'attachment; filename="{request.voice.value}_stream.mp3"',
                "Transfer-Encoding": "chunked",
            }
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"음성 스트리밍 중 오류가 발생했습니다: {str(e)}",
        )


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
