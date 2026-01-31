"""
추천 시스템 서비스
토론 중 사용자에게 추천 버튼을 제공하는 서비스
"""
from pathlib import Path
from typing import List, Literal, Optional
import json
import re
import logging

from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_core.messages import HumanMessage

from app.core.config import settings
from app.models.schemas import Suggestion, SuggestionType, SuggestionTarget

logger = logging.getLogger(__name__)


class SuggestionService:
    """추천 생성 서비스"""
    
    def __init__(self):
        self.llm: Optional[ChatNVIDIA] = None
        self.prompts: dict = {}
        self._init_llm()
        self._load_prompts()
    
    def _init_llm(self):
        """NVIDIA LLM 초기화"""
        if settings.NVIDIA_API_KEY:
            try:
                self.llm = ChatNVIDIA(
                    model="meta/llama-3.1-8b-instruct",
                    nvidia_api_key=settings.NVIDIA_API_KEY,
                    temperature=0.8,
                    max_tokens=512,
                )
                logger.info("Suggestion LLM 초기화 완료")
            except Exception as e:
                logger.warning(f"Suggestion LLM 초기화 실패: {e}")
                self.llm = None
        else:
            logger.warning("NVIDIA_API_KEY가 설정되지 않았습니다.")
    
    def _load_prompts(self):
        """프롬프트 파일 로드"""
        prompts_dir = Path(__file__).parent.parent / "prompts" / "suggestion_prompts"
        
        for prompt_type in ["topic", "question", "argument"]:
            prompt_path = prompts_dir / f"{prompt_type}.txt"
            if prompt_path.exists():
                self.prompts[prompt_type] = prompt_path.read_text(encoding="utf-8")
            else:
                logger.warning(f"프롬프트 파일 없음: {prompt_path}")
                self.prompts[prompt_type] = self._get_default_prompt(prompt_type)
    
    def _get_default_prompt(self, prompt_type: str) -> str:
        """기본 프롬프트 반환"""
        if prompt_type == "topic":
            return """토론 주제 5개를 추천해주세요. JSON 배열로만 응답하세요.
[{"id": "1", "text": "주제", "type": "topic"}]"""
        elif prompt_type == "question":
            return """토론 질문 5개를 추천해주세요. JSON 배열로만 응답하세요.
[{"id": "1", "text": "질문", "type": "question", "target": "james"}]"""
        else:
            return """토론 발언 5개를 추천해주세요. JSON 배열로만 응답하세요.
[{"id": "1", "text": "발언", "type": "argument", "target": "general"}]"""
    
    def _parse_suggestions(self, content: str, suggestion_type: str, topic: str = "") -> List[Suggestion]:
        """LLM 응답에서 추천 목록 파싱"""
        try:
            # JSON 배열 추출 (```json ... ``` 형식 처리)
            json_match = re.search(r'\[[\s\S]*\]', content)
            if not json_match:
                logger.error(f"JSON 배열을 찾을 수 없음: {content[:200]}")
                return self._get_fallback_suggestions(suggestion_type, topic)
            
            json_str = json_match.group()
            data = json.loads(json_str)
            
            suggestions = []
            for item in data:
                target = item.get("target")
                if target:
                    target = SuggestionTarget(target) if target in ["james", "linda", "general"] else None
                
                suggestions.append(Suggestion(
                    id=str(item.get("id", len(suggestions) + 1)),
                    text=item.get("text", ""),
                    type=SuggestionType(suggestion_type),
                    target=target
                ))
            
            return suggestions[:6]  # 최대 6개
            
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            logger.error(f"추천 파싱 실패: {e}, content: {content[:200]}")
            return self._get_fallback_suggestions(suggestion_type, topic)
    
    def _get_fallback_suggestions(self, suggestion_type: str, topic: str = "") -> List[Suggestion]:
        """파싱 실패 시 기본 추천 반환 (강의/주제 관련)"""
        topic_text = topic if topic else "이 주제"
        
        if suggestion_type == "topic":
            return [
                Suggestion(id="1", text="이 강의 내용에서 가장 논쟁적인 부분은?", type=SuggestionType.TOPIC),
                Suggestion(id="2", text="강의 핵심 개념의 장단점은?", type=SuggestionType.TOPIC),
                Suggestion(id="3", text="실제 적용 시 예상되는 문제점은?", type=SuggestionType.TOPIC),
            ]
        elif suggestion_type == "question":
            return [
                Suggestion(id="1", text=f"제임스, {topic_text}의 근거가 뭐예요?", type=SuggestionType.QUESTION, target=SuggestionTarget.JAMES),
                Suggestion(id="2", text=f"린다, {topic_text}의 단점은 어떻게 생각해요?", type=SuggestionType.QUESTION, target=SuggestionTarget.LINDA),
                Suggestion(id="3", text="구체적인 예시를 들어줄 수 있어요?", type=SuggestionType.QUESTION, target=SuggestionTarget.GENERAL),
            ]
        else:
            return [
                Suggestion(id="1", text=f"{topic_text}에 대해 다른 관점이 있어요", type=SuggestionType.ARGUMENT, target=SuggestionTarget.GENERAL),
                Suggestion(id="2", text="그 점은 맞지만, 현실적인 문제가 있어요", type=SuggestionType.ARGUMENT, target=SuggestionTarget.GENERAL),
                Suggestion(id="3", text="강의에서 배운 내용을 적용해보면...", type=SuggestionType.ARGUMENT, target=SuggestionTarget.GENERAL),
            ]
    
    async def generate_suggestions(
        self,
        suggestion_type: Literal["topic", "question", "argument"],
        topic: str = "",
        user_position: str = "",
        james_last: str = "",
        linda_last: str = "",
        lecture_context: str = ""
    ) -> List[Suggestion]:
        """
        추천 생성
        
        Args:
            suggestion_type: 추천 유형 (topic/question/argument)
            topic: 토론 주제
            user_position: 사용자 입장 (pro/con)
            james_last: 제임스 마지막 발언
            linda_last: 린다 마지막 발언
            lecture_context: 강의 컨텍스트
        
        Returns:
            추천 목록
        """
        if not self.llm:
            logger.warning("LLM이 없어 기본 추천 반환")
            return self._get_fallback_suggestions(suggestion_type, topic)
        
        try:
            # 프롬프트 준비
            prompt_template = self.prompts.get(suggestion_type, "")
            position_label = "찬성" if user_position == "pro" else "반대" if user_position == "con" else "미정"
            
            # 강의 컨텍스트가 없으면 topic을 사용
            effective_lecture_context = lecture_context or topic or "(강의 정보 없음)"
            
            prompt = prompt_template.format(
                topic=topic or "자유 토론",
                user_position=user_position or "미정",
                position_label=position_label,
                james_last=james_last or "(아직 발언 없음)",
                linda_last=linda_last or "(아직 발언 없음)",
                lecture_context=effective_lecture_context
            )
            
            logger.info(f"추천 생성 요청 - type: {suggestion_type}, lecture_context: {effective_lecture_context[:100]}...")
            
            # LLM 호출
            response = await self.llm.ainvoke([HumanMessage(content=prompt)])
            
            # 파싱
            suggestions = self._parse_suggestions(response.content, suggestion_type, topic)
            
            logger.info(f"추천 생성 완료: {suggestion_type}, {len(suggestions)}개")
            return suggestions
            
        except Exception as e:
            logger.error(f"추천 생성 실패: {e}")
            return self._get_fallback_suggestions(suggestion_type, topic)


# 싱글톤 인스턴스
_suggestion_service: Optional[SuggestionService] = None


def get_suggestion_service() -> SuggestionService:
    """SuggestionService 싱글톤 반환"""
    global _suggestion_service
    if _suggestion_service is None:
        _suggestion_service = SuggestionService()
    return _suggestion_service
