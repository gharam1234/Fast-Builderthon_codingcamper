"""
AI 토론 엔진 서비스
NVIDIA NIM + LangChain을 사용한 3자 토론 AI 엔진
"""
from typing import Optional, Dict, List, Tuple
from pathlib import Path
import logging
import json

from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain.memory import ConversationBufferWindowMemory
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from app.core.config import settings
from app.models.schemas import DebaterRole


logger = logging.getLogger(__name__)


class TokenCalculator:
    """토큰 계산 로직"""
    
    BASE_TOKENS = 10
    LONG_MESSAGE_TOKENS = 20  # 50자 이상
    QUESTION_TOKENS = 15
    
    @classmethod
    def calculate(cls, message: str) -> int:
        """
        사용자 메시지에 따른 토큰 계산
        
        - 기본 발언: +10 토큰
        - 50자 이상 논리적 발언: +20 토큰
        - 질문 형태 발언: +15 토큰
        """
        tokens = cls.BASE_TOKENS
        
        # 50자 이상 메시지
        if len(message) >= 50:
            tokens = cls.LONG_MESSAGE_TOKENS
        
        # 질문 형태 (?, 까요, 는지, 일까 등)
        question_markers = ['?', '까요', '나요', '는지', '일까', '할까', '을까']
        if any(marker in message for marker in question_markers):
            tokens = max(tokens, cls.QUESTION_TOKENS)
        
        return tokens


class DebateEngine:
    """
    AI 토론 엔진
    NVIDIA NIM + LangChain으로 구현된 3자 토론 시스템
    """
    
    def __init__(self):
        self.sessions: Dict[str, dict] = {}
        self.james_prompt: Optional[str] = None
        self.linda_prompt: Optional[str] = None
        
        # LangChain 메모리 (세션별로 관리)
        self.james_memories: Dict[str, ConversationBufferWindowMemory] = {}
        self.linda_memories: Dict[str, ConversationBufferWindowMemory] = {}
        
        # NVIDIA LLM 초기화
        self.llm: Optional[ChatNVIDIA] = None
        self._init_llm()
        self._load_prompts()
    
    def _init_llm(self):
        """NVIDIA ChatNVIDIA LLM 초기화"""
        if settings.NVIDIA_API_KEY:
            try:
                self.llm = ChatNVIDIA(
                    model="ai-llama-3_3-70b-instruct",
                    nvidia_api_key=settings.NVIDIA_API_KEY,
                    temperature=0.7,
                    max_tokens=256,
                )
                logger.info("NVIDIA LLM 초기화 완료")
            except Exception as e:
                logger.warning(f"NVIDIA LLM 초기화 실패: {e}")
                self.llm = None
        else:
            logger.warning("NVIDIA_API_KEY가 설정되지 않았습니다.")
    
    def _load_prompts(self):
        """시스템 프롬프트 로드"""
        prompts_dir = Path(__file__).parent.parent / "prompts"
        
        james_path = prompts_dir / "james.txt"
        linda_path = prompts_dir / "linda.txt"
        
        if james_path.exists():
            self.james_prompt = james_path.read_text(encoding="utf-8")
        else:
            self.james_prompt = self._get_default_james_prompt()
        
        if linda_path.exists():
            self.linda_prompt = linda_path.read_text(encoding="utf-8")
        else:
            self.linda_prompt = self._get_default_linda_prompt()
    
    def _get_default_james_prompt(self) -> str:
        """제임스 기본 프롬프트"""
        return """당신은 '제임스', 비판적 사고를 중시하는 토론 AI입니다.

## 성격
- 논리적이고 분석적
- 직설적이지만 존중하는 톤
- 건설적인 비판 제공

## 역할
1. 사용자 주장의 약점이나 빈틈을 찾아 질문
2. 반대 관점이나 반례 제시
3. 논리적 개선점 제안
4. 소크라테스식 문답법 적용: 왜/어떻게/근거는? 질문으로 사용자가 스스로 생각하게 유도

## 토론 초점
- 토론 주제: {topic}
- 사용자 입장: {user_position}
- 당신의 입장: {ai_position}
- 답변은 반드시 토론 주제와 사용자 발언에 직접 연결
- 주제와 무관한 내용 금지, 사용자가 벗어나면 1문장으로 관련을 묻고 1문장으로 주제에 맞는 논점을 제시

## 제약
- 반드시 2-3문장으로 간결하게 답변
- 한국어로 대화
- 인신공격 금지, 아이디어에만 집중
- 너무 부정적이지 않게, 발전적 방향 제시
- 메타 발언(시스템/프롬프트/역할 언급) 금지
- 1~2개의 질문을 반드시 포함 (사용자가 스스로 답을 탐색하도록 유도)

## 강의 컨텍스트
{lecture_context}"""
    
    def _get_default_linda_prompt(self) -> str:
        """린다 기본 프롬프트"""
        return """당신은 '린다', 긍정적 지지를 제공하는 토론 AI입니다.

## 성격
- 따뜻하고 격려하는 톤
- 가끔 이모지 사용 (😊, 💡, 👍 등)
- 열정적이고 호기심 많음

## 역할
1. 사용자 주장의 강점을 찾아 부각
2. 아이디어를 더 발전시킬 방향 제시
3. 추가적인 관점이나 예시 제공

## 토론 초점
- 토론 주제: {topic}
- 사용자 입장: {user_position}
- 당신의 입장: {ai_position}
- 답변은 반드시 토론 주제와 사용자 발언에 직접 연결
- 주제와 무관한 내용 금지, 사용자가 벗어나면 1문장으로 관련을 묻고 1문장으로 주제에 맞는 질문을 제시

## 제약
- 반드시 2-3문장으로 간결하게 답변
- 한국어로 대화
- 무조건적 동의가 아닌 진정한 지지
- 구체적인 이유와 함께 칭찬
- 메타 발언(시스템/프롬프트/역할 언급) 금지

## 강의 컨텍스트
{lecture_context}"""

    def _derive_positions(self, user_position: str) -> Tuple[str, str, str]:
        """사용자 입장에 따른 라벨 및 AI 입장 설정"""
        if user_position == "pro":
            return "찬성 (Pro)", "반대 (Con)", "찬성 (Pro)"
        if user_position == "con":
            return "반대 (Con)", "찬성 (Pro)", "반대 (Con)"
        return "미정", "비판적 관점", "지지적 관점"

    def _get_session_context(self, session_id: str) -> Dict[str, str]:
        """세션별 토론 컨텍스트 조회 및 보정"""
        session = self.sessions.get(session_id, {})

        topic = (session.get("topic") or "").strip() or "자유 토론"
        session["topic"] = topic

        user_position = session.get("user_position") or ""
        user_position_label = session.get("user_position_label")
        james_position = session.get("james_position")
        linda_position = session.get("linda_position")

        if not (user_position_label and james_position and linda_position):
            derived_user_label, derived_james, derived_linda = self._derive_positions(user_position)
            user_position_label = user_position_label or derived_user_label
            james_position = james_position or derived_james
            linda_position = linda_position or derived_linda
            session["user_position_label"] = user_position_label
            session["james_position"] = james_position
            session["linda_position"] = linda_position

        lecture_context = session.get("lecture_context") or ""

        return {
            "topic": topic,
            "user_position_label": user_position_label,
            "james_position": james_position,
            "linda_position": linda_position,
            "lecture_context": lecture_context,
        }

    def _apply_prompt_context(
        self,
        prompt: str,
        session_id: str,
        lecture_context: str,
        debater: DebaterRole,
    ) -> str:
        """프롬프트에 토론 컨텍스트 치환 적용"""
        context = self._get_session_context(session_id)
        ai_position = (
            context["james_position"]
            if debater == DebaterRole.JAMES
            else context["linda_position"]
        )

        effective_lecture_context = lecture_context.strip() if lecture_context else context["lecture_context"]
        if not effective_lecture_context:
            effective_lecture_context = "일반적인 토론"

        replacements = {
            "{lecture_context}": effective_lecture_context,
            "{topic}": context["topic"],
            "{user_position}": context["user_position_label"],
            "{ai_position}": ai_position,
        }

        for placeholder, value in replacements.items():
            prompt = prompt.replace(placeholder, value)

        return prompt

    def _build_debate_context(self, session_id: str, debater: DebaterRole) -> str:
        """현재 토론 상태를 사용자 입력에 포함하기 위한 컨텍스트 구성"""
        context = self._get_session_context(session_id)
        ai_position = (
            context["james_position"]
            if debater == DebaterRole.JAMES
            else context["linda_position"]
        )
        return "\n".join([
            f"토론 주제: {context['topic']}",
            f"사용자 입장: {context['user_position_label']}",
            f"당신의 입장: {ai_position}",
        ])
    
    def _get_session_memory(
        self, 
        session_id: str, 
        debater: DebaterRole
    ) -> ConversationBufferWindowMemory:
        """세션별 메모리 가져오기 또는 생성"""
        memories = self.james_memories if debater == DebaterRole.JAMES else self.linda_memories
        
        if session_id not in memories:
            memories[session_id] = ConversationBufferWindowMemory(
                k=10,
                return_messages=True,
            )
        
        return memories[session_id]
    
    async def initialize_session(
        self,
        session_id: str,
        topic: str = "",
        user_position: str = "",
        lecture_context: str = "",
    ) -> dict:
        """
        토론 세션 초기화
        
        Args:
            session_id: 세션 ID
            topic: 토론 주제 (선택)
            user_position: 사용자 입장 (선택)
            lecture_context: 강의 컨텍스트 (선택)
            
        Returns:
            세션 정보
        """
        normalized_topic = (topic or "").strip() or "자유 토론"
        user_position_label, james_position, linda_position = self._derive_positions(user_position)

        self.sessions[session_id] = {
            "topic": normalized_topic,
            "user_position": user_position,
            "user_position_label": user_position_label,
            "james_position": james_position,
            "linda_position": linda_position,
            "lecture_context": lecture_context,
            "history": [],
            "total_tokens_earned": 0,
        }
        
        # 세션별 메모리 초기화
        self.james_memories[session_id] = ConversationBufferWindowMemory(
            k=10, return_messages=True
        )
        self.linda_memories[session_id] = ConversationBufferWindowMemory(
            k=10, return_messages=True
        )
        
        return self.sessions[session_id]
    
    async def process_message(
        self,
        session_id: str,
        user_message: str,
        lecture_context: str = "",
    ) -> Tuple[str, str, int]:
        """
        3자 토론 메시지 처리 (User → James → Linda 순차 응답)
        
        Args:
            session_id: 세션 ID
            user_message: 사용자 메시지
            lecture_context: 강의 컨텍스트
            
        Returns:
            (james_response, linda_response, tokens_earned) 튜플
        """
        # 세션 초기화 (없는 경우)
        if session_id not in self.sessions:
            await self.initialize_session(session_id, lecture_context=lecture_context)
        elif lecture_context:
            self.sessions[session_id]["lecture_context"] = lecture_context
        
        # 토큰 계산
        tokens_earned = TokenCalculator.calculate(user_message)
        self.sessions[session_id]["total_tokens_earned"] += tokens_earned
        
        # James 응답 생성
        james_response = await self._get_james_response(
            session_id, user_message, lecture_context
        )
        
        # Linda 응답 생성 (James 응답 참고)
        linda_response = await self._get_linda_response(
            session_id, user_message, james_response, lecture_context
        )
        
        # 히스토리 저장
        self._add_to_history(session_id, "user", user_message)
        self._add_to_history(session_id, "james", james_response)
        self._add_to_history(session_id, "linda", linda_response)
        
        return james_response, linda_response, tokens_earned
    
    async def _get_james_response(
        self,
        session_id: str,
        user_message: str,
        lecture_context: str = "",
    ) -> str:
        """제임스 응답 생성"""
        if not self.llm:
            return self._get_stub_james_response(user_message)
        
        try:
            # 프롬프트에 토론 컨텍스트 적용
            system_prompt = self._apply_prompt_context(
                self.james_prompt, session_id, lecture_context, DebaterRole.JAMES
            )
            
            # 메모리에서 대화 히스토리 가져오기
            memory = self._get_session_memory(session_id, DebaterRole.JAMES)
            chat_history = memory.chat_memory.messages
            
            # 메시지 구성
            debate_context = self._build_debate_context(session_id, DebaterRole.JAMES)
            messages = [SystemMessage(content=system_prompt)]
            messages.extend(chat_history)
            messages.append(HumanMessage(content=f"{debate_context}\n\n[사용자 발언]: {user_message}"))
            
            # LLM 호출
            response = await self.llm.ainvoke(messages)
            james_response = response.content
            
            # 메모리에 저장
            memory.chat_memory.add_user_message(user_message)
            memory.chat_memory.add_ai_message(james_response)
            
            return james_response
            
        except Exception as e:
            logger.error(f"James 응답 생성 실패: {e}")
            return self._get_stub_james_response(user_message)
    
    async def _get_linda_response(
        self,
        session_id: str,
        user_message: str,
        james_response: str,
        lecture_context: str = "",
    ) -> str:
        """린다 응답 생성 (제임스 응답 참고)"""
        if not self.llm:
            return self._get_stub_linda_response(user_message)
        
        try:
            # 프롬프트에 토론 컨텍스트 적용
            system_prompt = self._apply_prompt_context(
                self.linda_prompt, session_id, lecture_context, DebaterRole.LINDA
            )
            
            # 메모리에서 대화 히스토리 가져오기
            memory = self._get_session_memory(session_id, DebaterRole.LINDA)
            chat_history = memory.chat_memory.messages
            
            # 린다에게 제공할 컨텍스트: 사용자 메시지 + 제임스 응답
            debate_context = self._build_debate_context(session_id, DebaterRole.LINDA)
            combined_context = f"""{debate_context}

[사용자 발언]: {user_message}

[제임스의 의견]: {james_response}

위 내용을 참고하여, 사용자의 주장을 지지하는 관점에서 토론 주제에 맞춰 응답해주세요."""
            
            # 메시지 구성
            messages = [SystemMessage(content=system_prompt)]
            messages.extend(chat_history)
            messages.append(HumanMessage(content=combined_context))
            
            # LLM 호출
            response = await self.llm.ainvoke(messages)
            linda_response = response.content
            
            # 메모리에 저장
            memory.chat_memory.add_user_message(user_message)
            memory.chat_memory.add_ai_message(linda_response)
            
            return linda_response
            
        except Exception as e:
            logger.error(f"Linda 응답 생성 실패: {e}")
            return self._get_stub_linda_response(user_message)
    
    def _get_stub_james_response(self, user_message: str) -> str:
        """제임스 스텁 응답"""
        return f"흥미로운 관점이지만, 몇 가지 생각해볼 점이 있습니다. '{user_message[:30]}...'라는 주장에서 근거가 더 필요해 보입니다. 어떤 데이터나 사례로 뒷받침할 수 있을까요?"
    
    def _get_stub_linda_response(self, user_message: str) -> str:
        """린다 스텁 응답"""
        return f"좋은 지적이에요! 😊 '{user_message[:30]}...'라는 생각에서 창의적인 관점이 느껴집니다. 이 아이디어를 더 발전시켜서 구체적인 예시를 추가해보면 어떨까요? 💡"

    def _fallback_report(self, session_id: str, ocr_text: str = "") -> dict:
        """LLM 실패 시 기본 리포트 생성"""
        session = self.sessions.get(session_id, {})
        history = session.get("history", [])
        user_messages = [h.get("message", "") for h in history if h.get("role") == "user"]
        avg_len = int(sum(len(m) for m in user_messages) / max(len(user_messages), 1)) if user_messages else 0

        base = 60 if user_messages else 40
        logic = min(90, base + min(30, avg_len // 4))
        persuasion = min(90, base + min(25, avg_len // 5))
        topic = min(90, base + (10 if session.get("topic") else 0))

        report = {
            "logic_score": logic,
            "persuasion_score": persuasion,
            "topic_score": topic,
            "summary": "토론 요약을 생성할 수 없어 기본 리포트를 제공합니다.",
            "improvement_tips": [
                "핵심 주장과 근거를 한 문장으로 요약해보세요.",
                "반대 사례를 미리 예상하고 대응 논리를 준비해보세요.",
                "주제 핵심 용어를 반복적으로 사용해 집중도를 높이세요.",
            ],
            "ocr_alignment_score": None,
            "ocr_feedback": None,
        }

        return report

    def _parse_report_json(self, content: str) -> Optional[dict]:
        """LLM JSON 응답 파싱"""
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass

        start = content.find("{")
        end = content.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(content[start:end + 1])
            except json.JSONDecodeError:
                return None
        return None

    def _sanitize_report(self, report: dict) -> dict:
        """리포트 값 보정"""
        def clamp(value: int) -> int:
            return max(0, min(100, int(value)))

        return {
            "logic_score": clamp(report.get("logic_score", 0)),
            "persuasion_score": clamp(report.get("persuasion_score", 0)),
            "topic_score": clamp(report.get("topic_score", 0)),
            "summary": str(report.get("summary", "")).strip(),
            "improvement_tips": report.get("improvement_tips", []) or [],
            "ocr_alignment_score": clamp(report.get("ocr_alignment_score", 0))
            if report.get("ocr_alignment_score") is not None
            else None,
            "ocr_feedback": report.get("ocr_feedback"),
        }
    
    async def generate_response(
        self,
        session_id: str,
        user_message: str,
        debater: DebaterRole,
        lecture_context: str = "",
    ) -> str:
        """
        단일 AI 토론자 응답 생성 (기존 호환용)
        
        Args:
            session_id: 세션 ID
            user_message: 사용자 메시지
            debater: 응답할 토론자
            lecture_context: 강의 컨텍스트
            
        Returns:
            AI 응답 텍스트
        """
        if debater == DebaterRole.JAMES:
            return await self._get_james_response(session_id, user_message, lecture_context)
        else:
            return await self._get_linda_response(session_id, user_message, "", lecture_context)

    async def generate_report(self, session_id: str, ocr_text: str = "") -> dict:
        """토론 성장 리포트 생성"""
        session = self.sessions.get(session_id)
        if not session:
            raise ValueError("세션을 찾을 수 없습니다.")

        history = session.get("history", [])
        transcript = "\n".join(
            [f"{h.get('role')}: {h.get('message')}" for h in history]
        )

        if not self.llm:
            return self._fallback_report(session_id, ocr_text)

        system_prompt = "\n".join([
            "당신은 토론 코치이자 평가자입니다.",
            "다음 토론 기록을 보고 성장 리포트를 생성하세요.",
            "출력은 반드시 JSON만 반환하세요.",
            "JSON 스키마:",
            "{",
            '  "logic_score": 0-100 정수,',
            '  "persuasion_score": 0-100 정수,',
            '  "topic_score": 0-100 정수,',
            '  "summary": "2~4문장 요약",',
            '  "improvement_tips": ["개선 팁 1", "개선 팁 2", "개선 팁 3"],',
            '  "ocr_alignment_score": 0-100 정수 또는 null,',
            '  "ocr_feedback": "OCR 내용이 토론에 어떻게 반영되었는지 분석" 또는 null',
            "}",
        ])

        user_prompt = "\n".join([
            f"토론 주제: {session.get('topic')}",
            f"사용자 입장: {session.get('user_position_label')}",
            "",
            "토론 기록:",
            transcript or "(기록 없음)",
            "",
            "OCR 텍스트:",
            ocr_text or "(제공되지 않음)",
        ])

        try:
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ])
            parsed = self._parse_report_json(response.content or "")
            if not parsed:
                return self._fallback_report(session_id, ocr_text)
            return self._sanitize_report(parsed)
        except Exception as e:
            logger.error(f"리포트 생성 실패: {e}")
            return self._fallback_report(session_id, ocr_text)
    
    def get_session(self, session_id: str) -> Optional[dict]:
        """세션 정보 조회"""
        return self.sessions.get(session_id)
    
    def _add_to_history(
        self,
        session_id: str,
        role: str,
        message: str,
    ):
        """대화 히스토리에 메시지 추가"""
        if session_id in self.sessions:
            self.sessions[session_id]["history"].append({
                "role": role,
                "message": message,
            })
    
    # 하위 호환성을 위한 별칭
    add_to_history = _add_to_history
