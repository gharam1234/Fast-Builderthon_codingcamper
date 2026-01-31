# Task 3.5: 토론 추천 버튼 시스템

## 목표
토론 중 사용자가 키보드 입력 없이 버튼 클릭만으로 질문/발언할 수 있는 추천 시스템 구현

---

## 프롬프트

```
토론 중 클릭만으로 질문/발언할 수 있는 추천 버튼 시스템을 구현해줘.

요구사항:
1. 추천 버튼 위치:
   - 채팅 입력창 바로 위에 가로 스크롤 가능한 버튼 영역
   - 버튼은 말풍선 형태의 칩(Chip) UI
   - 최대 5-6개 노출, 좌우 스크롤로 더 보기

2. 추천 유형 (3가지):
   [🎯 토론 주제] - 토론 시작 전, 주제 추천
   [❓ 질문하기] - 제임스/린다에게 던질 질문 추천
   [💬 발언하기] - 내 입장을 표현할 발언 추천

3. 추천 생성 API:
   POST /api/v1/suggestions/generate
   Request: {
     session_id: string,
     suggestion_type: "topic" | "question" | "argument",
     context: {
       topic?: string,
       user_position?: "pro" | "con",
       recent_messages?: Message[],
       lecture_context?: string
     }
   }
   Response: {
     suggestions: [
       { id: string, text: string, type: string, target?: "james" | "linda" }
     ]
   }

4. 추천 선택 시 동작:
   - 버튼 클릭 -> 바로 전송
   - 선택한 추천은 목록에서 페이드아웃

5. 추천 갱신 타이밍:
   - 토론 시작 시 (주제 추천)
   - 사용자 발언 후 (질문/발언 추천)
   - AI 응답 후 (질문/발언 추천)
   - 30초 무응답 시 (새로운 추천)
```

---

## 백엔드 프롬프트 파일

### suggestion_system.txt
```
당신은 토론 추천 시스템 AI입니다.
사용자가 제임스(비판적), 린다(긍정적)와 토론할 때 도움이 되는 추천을 생성합니다.

## 추천 생성 원칙
1. 짧고 명확하게 (15-30자 내외)
2. 버튼으로 표시되므로 완전한 문장으로
3. 토론 맥락에 맞는 자연스러운 내용
4. 다양한 관점과 전략을 포함

## 입력 정보
- 토론 주제: {topic}
- 사용자 입장: {user_position}
- 최근 대화: {recent_messages}
- 강의 컨텍스트: {lecture_context}

## 출력 (JSON)
{
  "suggestions": [
    { "id": "1", "text": "추천 텍스트", "type": "question|argument", "target": "james|linda" }
  ]
}
```

### suggestion_prompts/topic.txt
```
토론하기 좋은 주제를 5개 추천해주세요.

## 조건
- 찬반 양론이 명확한 주제
- 15-25자 내외의 질문 형태
- 다양한 분야 (기술, 사회, 윤리 등)
- 강의 컨텍스트가 있으면 관련 주제 우선

## 강의 컨텍스트
{lecture_context}

## 출력 예시
[
  { "id": "1", "text": "AI가 인간의 일자리를 대체해야 할까요?", "type": "topic" },
  { "id": "2", "text": "SNS는 사회에 이로운 영향을 줄까요?", "type": "topic" }
]
```

### suggestion_prompts/question.txt
```
토론 상대에게 던질 좋은 질문 5개를 추천해주세요.

## 현재 상황
- 토론 주제: {topic}
- 내 입장: {user_position}
- 제임스 마지막 발언: {james_last}
- 린다 마지막 발언: {linda_last}

## 질문 유형 (골고루 포함)
1. 근거 요청: "그 주장의 근거가 뭐예요?"
2. 반례 제시: "~한 경우는 어떻게 설명해요?"
3. 구체화: "구체적인 예시를 들어줄 수 있어요?"
4. 확장: "그러면 ~에도 적용될까요?"
5. 비교: "~와 비교하면 어떤 차이가 있어요?"

## 제약
- 15-35자 내외
- 자연스러운 반말/존댓말 톤
- 공격적이지 않은 호기심 어린 질문

## 출력 예시
[
  { "id": "1", "text": "제임스, 그런 사례가 실제로 있어요?", "type": "question", "target": "james" },
  { "id": "2", "text": "린다, 반대 의견은 어떻게 생각해요?", "type": "question", "target": "linda" }
]
```

### suggestion_prompts/argument.txt
```
내가 발언할 좋은 논점 5개를 추천해주세요.

## 현재 상황
- 토론 주제: {topic}
- 내 입장: {user_position} ({position_label})
- 제임스 마지막 발언: {james_last}
- 린다 마지막 발언: {linda_last}

## 발언 유형 (골고루 포함)
1. 주장 강화: 내 입장을 뒷받침하는 논거
2. 반박: 상대 논점에 대한 반론
3. 예시: 구체적 사례 제시
4. 인정+반론: "그 점은 맞지만, ~"
5. 정리: 핵심 요점 강조

## 제약
- 20-40자 내외
- 완전한 문장 형태
- 바로 전송 가능한 자연스러운 발언

## 출력 예시
[
  { "id": "1", "text": "하지만 실제 데이터를 보면 다른 결과가 나와요", "type": "argument", "target": "general" },
  { "id": "2", "text": "제임스 말도 일리 있지만, 긍정적 측면도 있어요", "type": "argument", "target": "james" }
]
```

---

## 백엔드 구현

```python
# app/services/suggestion_service.py

from pathlib import Path
from typing import Literal, List, Optional
from pydantic import BaseModel

class Suggestion(BaseModel):
    id: str
    text: str
    type: Literal["topic", "question", "argument"]
    target: Optional[Literal["james", "linda", "general"]] = None

class SuggestionService:
    def __init__(self, llm):
        self.llm = llm
        self.prompts = self._load_prompts()
    
    def _load_prompts(self) -> dict:
        prompts_dir = Path(__file__).parent.parent / "prompts" / "suggestion_prompts"
        return {
            "topic": (prompts_dir / "topic.txt").read_text(),
            "question": (prompts_dir / "question.txt").read_text(),
            "argument": (prompts_dir / "argument.txt").read_text(),
        }
    
    async def generate_suggestions(
        self,
        suggestion_type: Literal["topic", "question", "argument"],
        topic: str = "",
        user_position: str = "",
        james_last: str = "",
        linda_last: str = "",
        lecture_context: str = ""
    ) -> List[Suggestion]:
        prompt = self.prompts[suggestion_type].format(
            topic=topic,
            user_position=user_position,
            position_label="찬성" if user_position == "pro" else "반대",
            james_last=james_last,
            linda_last=linda_last,
            lecture_context=lecture_context
        )
        
        response = await self.llm.ainvoke(prompt)
        suggestions = self._parse_suggestions(response.content)
        return suggestions
    
    def _parse_suggestions(self, content: str) -> List[Suggestion]:
        import json
        # JSON 파싱 후 Suggestion 객체로 변환
        data = json.loads(content)
        return [Suggestion(**item) for item in data]
```

```python
# app/api/v1/suggestions.py

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Literal

router = APIRouter(prefix="/suggestions", tags=["suggestions"])

class SuggestionContext(BaseModel):
    topic: Optional[str] = None
    user_position: Optional[Literal["pro", "con"]] = None
    james_last: Optional[str] = None
    linda_last: Optional[str] = None
    lecture_context: Optional[str] = None

class GenerateRequest(BaseModel):
    session_id: str
    suggestion_type: Literal["topic", "question", "argument"]
    context: SuggestionContext

class SuggestionResponse(BaseModel):
    id: str
    text: str
    type: str
    target: Optional[str] = None

class GenerateResponse(BaseModel):
    suggestions: List[SuggestionResponse]

@router.post("/generate", response_model=GenerateResponse)
async def generate_suggestions(request: GenerateRequest):
    suggestions = await suggestion_service.generate_suggestions(
        suggestion_type=request.suggestion_type,
        topic=request.context.topic or "",
        user_position=request.context.user_position or "",
        james_last=request.context.james_last or "",
        linda_last=request.context.linda_last or "",
        lecture_context=request.context.lecture_context or ""
    )
    return GenerateResponse(suggestions=suggestions)
```

---

## 프론트엔드 구현

### Hook

```typescript
// hooks/useSuggestions.ts

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface Suggestion {
  id: string;
  text: string;
  type: 'topic' | 'question' | 'argument';
  target?: 'james' | 'linda' | 'general';
}

interface UseSuggestionsProps {
  sessionId: string;
  topic?: string;
  userPosition?: 'pro' | 'con';
  jamesLast?: string;
  lindaLast?: string;
  lectureContext?: string;
}

export function useSuggestions({
  sessionId,
  topic,
  userPosition,
  jamesLast,
  lindaLast,
  lectureContext
}: UseSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = useCallback(async (
    type: 'topic' | 'question' | 'argument'
  ) => {
    setIsLoading(true);
    try {
      const response = await api.post('/suggestions/generate', {
        session_id: sessionId,
        suggestion_type: type,
        context: {
          topic,
          user_position: userPosition,
          james_last: jamesLast,
          linda_last: lindaLast,
          lecture_context: lectureContext
        }
      });
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, topic, userPosition, jamesLast, lindaLast, lectureContext]);

  const removeSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    isLoading,
    fetchSuggestions,
    removeSuggestion,
    clearSuggestions
  };
}
```

### Component

```tsx
// components/debate/SuggestionChips.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Suggestion } from '@/hooks/useSuggestions';

interface SuggestionChipsProps {
  suggestions: Suggestion[];
  isLoading: boolean;
  onSelect: (suggestion: Suggestion) => void;
  onRefresh: () => void;
}

export function SuggestionChips({
  suggestions,
  isLoading,
  onSelect,
  onRefresh
}: SuggestionChipsProps) {
  const getChipStyle = (type: string, target?: string) => {
    if (type === 'topic') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (target === 'james') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (target === 'linda') return 'bg-pink-100 text-pink-700 border-pink-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getEmoji = (type: string, target?: string) => {
    if (type === 'topic') return '🎯';
    if (type === 'question') return '❓';
    if (target === 'james') return '👔';
    if (target === 'linda') return '👩';
    return '💬';
  };

  return (
    <div className="relative px-4 py-2 border-t border-gray-100">
      {/* 새로고침 버튼 */}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full 
                   hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        <motion.span
          animate={isLoading ? { rotate: 360 } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          🔄
        </motion.span>
      </button>

      {/* 추천 칩 스크롤 영역 */}
      <div className="flex gap-2 overflow-x-auto pb-1 pr-10 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            // 로딩 스켈레톤
            [...Array(4)].map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-8 w-32 bg-gray-100 rounded-full animate-pulse shrink-0"
              />
            ))
          ) : (
            suggestions.map((suggestion) => (
              <motion.button
                key={suggestion.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(suggestion)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full
                  border text-sm font-medium whitespace-nowrap shrink-0
                  transition-colors hover:shadow-sm
                  ${getChipStyle(suggestion.type, suggestion.target)}
                `}
              >
                <span>{getEmoji(suggestion.type, suggestion.target)}</span>
                <span className="max-w-[200px] truncate">{suggestion.text}</span>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

### 통합 사용 예시

```tsx
// components/debate/DebateChat.tsx (사용 예시)

import { useState, useEffect } from 'react';
import { useSuggestions } from '@/hooks/useSuggestions';
import { SuggestionChips } from './SuggestionChips';

export function DebateChat({ sessionId, topic, userPosition }) {
  const [inputValue, setInputValue] = useState('');
  const [jamesLast, setJamesLast] = useState('');
  const [lindaLast, setLindaLast] = useState('');

  const {
    suggestions,
    isLoading,
    fetchSuggestions,
    removeSuggestion
  } = useSuggestions({
    sessionId,
    topic,
    userPosition,
    jamesLast,
    lindaLast
  });

  // 토론 시작 시 주제 추천 또는 질문/발언 추천
  useEffect(() => {
    if (!topic) {
      fetchSuggestions('topic');
    } else {
      fetchSuggestions('question');
    }
  }, [topic]);

  // AI 응답 후 새 추천 생성
  useEffect(() => {
    if (jamesLast || lindaLast) {
      fetchSuggestions('question');
    }
  }, [jamesLast, lindaLast]);

  const handleSuggestionSelect = (suggestion) => {
    // 입력창에 텍스트 설정
    setInputValue(suggestion.text);
    // 선택된 추천 제거 (페이드아웃)
    removeSuggestion(suggestion.id);
  };

  const handleRefresh = () => {
    const type = topic ? 'question' : 'topic';
    fetchSuggestions(type);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto">
        {/* ... messages ... */}
      </div>

      {/* 추천 버튼 영역 */}
      <SuggestionChips
        suggestions={suggestions}
        isLoading={isLoading}
        onSelect={handleSuggestionSelect}
        onRefresh={handleRefresh}
      />

      {/* 입력창 */}
      <div className="p-4 border-t">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="메시지를 입력하거나 위 추천을 선택하세요..."
          className="w-full p-3 border rounded-lg"
        />
      </div>
    </div>
  );
}
```

---

## UI/UX 가이드

### 버튼 스타일
- **주제 추천**: 보라색 계열 (`bg-purple-100`)
- **제임스에게 질문**: 파란색 계열 (`bg-blue-100`) + 👔 이모지
- **린다에게 질문**: 분홍색 계열 (`bg-pink-100`) + 👩 이모지
- **일반 발언**: 회색 계열 (`bg-gray-100`) + 💬 이모지

### 애니메이션
- 등장: 페이드인 + 스케일업 (0.2s)
- 선택 시: 페이드아웃 + 스케일다운 (0.15s)
- 호버: 살짝 확대 (scale 1.02)
- 새로고침: 로딩 스피너 회전

### 반응형
- 모바일: 가로 스크롤, 터치 친화적 버튼 크기
- 데스크톱: 호버 효과, 더 많은 버튼 노출

---

## 체크리스트

- [ ] 백엔드 프롬프트 파일 생성
- [ ] SuggestionService 구현
- [ ] API 엔드포인트 구현
- [ ] useSuggestions Hook 구현
- [ ] SuggestionChips 컴포넌트 구현
- [ ] DebateChat에 통합
- [ ] 로딩/에러 상태 처리
- [ ] 애니메이션 적용
- [ ] 모바일 터치 최적화
