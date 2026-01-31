"""
음성 서비스 (ElevenLabs TTS)
"""
from typing import Optional, AsyncIterator
from app.core.config import settings
from app.models.schemas import DebaterRole
import httpx


class VoiceService:
    """ElevenLabs TTS 서비스"""
    
    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY
        self.james_voice_id = settings.ELEVENLABS_JAMES_VOICE_ID
        self.linda_voice_id = settings.ELEVENLABS_LINDA_VOICE_ID
        self.base_url = "https://api.elevenlabs.io/v1"
    
    def _get_voice_id(self, debater: DebaterRole) -> Optional[str]:
        """토론자에 해당하는 Voice ID 반환"""
        if debater == DebaterRole.JAMES:
            return self.james_voice_id
        elif debater == DebaterRole.LINDA:
            return self.linda_voice_id
        return None
    
    async def synthesize(
        self,
        text: str,
        voice: DebaterRole,
    ) -> bytes:
        """
        텍스트를 음성으로 변환
        
        Args:
            text: 변환할 텍스트
            voice: 사용할 음성 (james/linda)
            
        Returns:
            오디오 바이트 데이터
        """
        voice_id = self._get_voice_id(voice)
        
        if not voice_id or not self.api_key:
            raise ValueError("음성 서비스가 설정되지 않았습니다.")
        
        url = f"{self.base_url}/text-to-speech/{voice_id}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.api_key,
        }
        
        data = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
                "style": 0.0,
                "use_speaker_boost": True,
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers=headers,
                json=data,
                timeout=30.0,
            )
            response.raise_for_status()
            return response.content
    
    async def synthesize_stream(
        self,
        text: str,
        voice: DebaterRole,
    ) -> AsyncIterator[bytes]:
        """
        텍스트를 음성으로 변환하여 스트리밍
        
        Args:
            text: 변환할 텍스트
            voice: 사용할 음성
            
        Yields:
            오디오 청크
        """
        voice_id = self._get_voice_id(voice)
        
        if not voice_id or not self.api_key:
            raise ValueError("음성 서비스가 설정되지 않았습니다.")
        
        url = f"{self.base_url}/text-to-speech/{voice_id}/stream"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.api_key,
        }
        
        data = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
            }
        }
        
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                url,
                headers=headers,
                json=data,
                timeout=60.0,
            ) as response:
                response.raise_for_status()
                async for chunk in response.aiter_bytes():
                    yield chunk
    
    async def get_available_voices(self) -> list:
        """사용 가능한 음성 목록 조회"""
        if not self.api_key:
            return []
        
        url = f"{self.base_url}/voices"
        headers = {"xi-api-key": self.api_key}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data.get("voices", [])
