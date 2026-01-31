"""
Supabase에 토론 리포트 저장
"""
import logging
from typing import Optional, List

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


async def save_debate_report(
    session_id: str,
    user_id: Optional[str],
    logic_score: int,
    persuasion_score: int,
    topic_score: int,
    summary: str,
    improvement_tips: List[str],
    ocr_alignment_score: Optional[int],
    ocr_feedback: Optional[str],
) -> None:
    """Supabase REST API로 리포트 저장"""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.warning("SUPABASE_URL 또는 SERVICE_ROLE_KEY가 없어 리포트를 저장하지 않습니다.")
        return

    url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/debate_reports"
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    payload = {
        "session_id": session_id,
        "user_id": user_id,
        "logic_score": logic_score,
        "persuasion_score": persuasion_score,
        "topic_score": topic_score,
        "summary": summary,
        "improvement_tips": improvement_tips,
        "ocr_alignment_score": ocr_alignment_score,
        "ocr_feedback": ocr_feedback,
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
    except Exception as error:
        logger.error(f"리포트 저장 실패: {error}")
