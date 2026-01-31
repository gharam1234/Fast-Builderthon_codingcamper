"""
AI 토론 엔진 서비스
LangChain + NVIDIA AI Endpoints를 사용한 토론 로직
"""
from typing import Optional, Dict, List
from pathlib import Path
from app.core.config import settings
from app.models.schemas import DebaterRole


class DebateEngine:
    """AI 토론 엔진"""
    
    def __init__(self):
        self.sessions: Dict[str, dict] = {}
        self.james_prompt: Optional[str] = None
        self.linda_prompt: Optional[str] = None
        self._load_prompts()
    
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
        return """당신은 '제임스'라는 AI 토론자입니다.

특성:
- 논리적이고 분석적인 사고방식
- 데이터와 통계를 중시
- 차분하고 이성적인 어조
- 상대방의 논점을 정확히 파악하고 반박

토론 스타일:
- 명확한 근거 제시
- 체계적인 논증 구조
- 감정보다 사실에 기반한 주장
- 상대방 의견 존중하면서 비판적 분석

응답 시 주의사항:
- 한국어로 응답
- 100-200자 내외로 간결하게
- 토론 주제에 집중
- 인신공격 금지"""
    
    def _get_default_linda_prompt(self) -> str:
        """린다 기본 프롬프트"""
        return """당신은 '린다'라는 AI 토론자입니다.

특성:
- 감성적이고 공감 능력이 뛰어남
- 실제 사례와 경험을 중시
- 따뜻하고 설득력 있는 어조
- 다양한 관점에서 문제를 바라봄

토론 스타일:
- 스토리텔링을 통한 설득
- 인간적 가치와 윤리 강조
- 상대방의 감정과 입장 고려
- 협력적이면서도 명확한 주장

응답 시 주의사항:
- 한국어로 응답
- 100-200자 내외로 간결하게
- 토론 주제에 집중
- 인신공격 금지"""
    
    async def initialize_session(
        self,
        session_id: str,
        topic: str,
        user_position: str,
    ) -> dict:
        """
        토론 세션 초기화
        
        Args:
            session_id: 세션 ID
            topic: 토론 주제
            user_position: 사용자 입장 (pro/con)
            
        Returns:
            세션 정보
        """
        self.sessions[session_id] = {
            "topic": topic,
            "user_position": user_position,
            "history": [],
            "james_position": "con" if user_position == "pro" else "pro",
            "linda_position": "pro" if user_position == "pro" else "con",
        }
        return self.sessions[session_id]
    
    async def generate_response(
        self,
        session_id: str,
        user_message: str,
        debater: DebaterRole,
    ) -> str:
        """
        AI 토론자 응답 생성
        
        Args:
            session_id: 세션 ID
            user_message: 사용자 메시지
            debater: 응답할 토론자
            
        Returns:
            AI 응답 텍스트
        """
        # 실제 구현 시 LangChain + NVIDIA API 사용
        # session = self.sessions.get(session_id)
        # if not session:
        #     raise ValueError("세션을 찾을 수 없습니다.")
        
        # prompt = self.james_prompt if debater == DebaterRole.JAMES else self.linda_prompt
        # 
        # from langchain_nvidia_ai_endpoints import ChatNVIDIA
        # llm = ChatNVIDIA(
        #     model="meta/llama3-70b-instruct",
        #     nvidia_api_key=settings.NVIDIA_API_KEY,
        # )
        # 
        # response = await llm.ainvoke([
        #     {"role": "system", "content": prompt},
        #     {"role": "user", "content": user_message},
        # ])
        # 
        # return response.content
        
        # 스텁 응답
        return f"[{debater.value}] 귀하의 의견 '{user_message[:30]}...'에 대해 생각해보았습니다. (실제 AI 응답은 추후 구현 예정)"
    
    def get_session(self, session_id: str) -> Optional[dict]:
        """세션 정보 조회"""
        return self.sessions.get(session_id)
    
    def add_to_history(
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
