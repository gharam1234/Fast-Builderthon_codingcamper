# Task 2.3: 토론장 인터페이스 (Scene 3)

## 목표
3자 대화 토론장 인터페이스 구현

---

## 프롬프트

```
3자 대화 토론장 인터페이스를 구현해줘.

디자인 요구사항:
1. 헤더:
   - 제목: "AI 세미나" + LIVE 뱃지
   - 토큰 카운터 (금색 배경, 코인 아이콘)
   - X 닫기 버튼
2. 참가자 바:
   - 제임스 (🎭 빨강), 린다 (🌟 초록), 나 (👤 파랑) 아바타
3. 채팅 영역:
   - 사용자 버블: 오른쪽 정렬, 파란 그라디언트
   - 제임스 버블: 왼쪽 정렬, 빨강 테두리, 반투명 배경
   - 린다 버블: 왼쪽 정렬, 초록 테두리, 반투명 배경
   - 시스템 메시지: 중앙 정렬, 회색 뱃지
   - 타이핑 인디케이터 (점 3개 bounce)
4. 입력 영역:
   - 텍스트 입력 (rounded, 반투명)
   - Send 버튼 (입력 있을 때만 활성화)
   - 마이크 FAB (큰 원형, 글로우)
5. 녹음 중 상태:
   - 마이크 버튼 빨강 + pulse
   - 오디오 파형 비주얼라이저 표시

상태 관리 (Zustand store):
- messages: Message[]
- isRecording: boolean
- isAISpeaking: boolean
- currentSpeaker: 'james' | 'linda' | null
- tokens: number

메서드:
- addMessage(msg)
- setRecording(bool)
- incrementTokens(amount)
```

---

## 채팅 버블 스타일

### 사용자 (User)
```css
.bubble-user {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 18px 18px 4px 18px;
  margin-left: auto;
}
```

### 제임스 (James)
```css
.bubble-james {
  background: rgba(255, 71, 87, 0.15);
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: 18px 18px 18px 4px;
}
```

### 린다 (Linda)
```css
.bubble-linda {
  background: rgba(46, 213, 115, 0.15);
  border: 1px solid rgba(46, 213, 115, 0.3);
  border-radius: 18px 18px 18px 4px;
}
```

## Message 타입 정의

```typescript
interface Message {
  id: string;
  sender: 'user' | 'james' | 'linda' | 'system';
  content: string;
  audioUrl?: string;
  timestamp: Date;
}
```

## 예상 결과물

- `/components/debate/DebateRoom.tsx`
- `/components/debate/ChatBubble.tsx`
- `/components/debate/MessageInput.tsx`
- `/components/debate/MicButton.tsx`
- `/store/useDebateStore.ts`

## 예상 시간
약 1시간
