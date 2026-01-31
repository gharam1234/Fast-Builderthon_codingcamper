# Task 2.3: 토론장 인터페이스 (Scene 3)

## 📋 현재 상태 (2026-01-31)

### ✅ 완료된 항목
- ✅ Phase 1: 프로젝트 기본 구조
- ✅ useChat Hook: 토론 로직 + 백엔드 연동
- ✅ useAuth Hook: 사용자 인증 + 프로필

### 🔄 진행 중인 항목
- 🔄 **Phase 2: 토론장 UI** (이 파일)
  - 채팅 버블 (사용자, James, Linda)
  - 입력 영역 + 마이크 버튼
  - 토큰 카운터

---

## 🎯 목표

**토론장 인터페이스 구현**: 3자 대화 채팅 UI + 토큰 시스템 연동

---

## 📂 파일 구조

```
components/
├── chat/
│   ├── ChatHeader.tsx       (헤더 + 토큰 카운터)
│   ├── ChatMessages.tsx     (메시지 목록)
│   ├── ChatInput.tsx        (입력 영역)
│   └── ChatBubble.tsx       (메시지 버블)
├── debate/
│   ├── MicButton.tsx        (마이크 녹음 버튼)
│   └── LiveChatPanel.tsx    (관중 채팅)
└── ui/
    └── TypingIndicator.tsx  (타이핑 표시)
```

---

## 🎨 채팅 버블 스타일

### User 버블
```css
.bubble-user {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 18px 18px 4px 18px;
  margin-left: auto;
  max-width: 70%;
}
```

### James 버블 (비평적)
```css
.bubble-james {
  background: rgba(255, 71, 87, 0.15);
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: 18px 18px 18px 4px;
  max-width: 70%;
}
```

### Linda 버블 (지지적)
```css
.bubble-linda {
  background: rgba(46, 213, 115, 0.15);
  border: 1px solid rgba(46, 213, 115, 0.3);
  border-radius: 18px 18px 18px 4px;
  max-width: 70%;
}
```

---

## 📝 구현 가이드

### 1. ChatBubble.tsx

```typescript
// components/chat/ChatBubble.tsx

import { Message } from '@/types';
import { motion } from 'framer-motion';

interface ChatBubbleProps {
  message: Message;
  isFirst?: boolean;
  isLast?: boolean;
}

export function ChatBubble({
  message,
  isFirst = false,
  isLast = false,
}: ChatBubbleProps) {
  const isUser = message.sender === 'user';
  const isJames = message.sender === 'james';
  const isLinda = message.sender === 'linda';
  const isSystem = message.sender === 'system';

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center mb-4"
      >
        <div className="px-4 py-2 rounded-full
          bg-white/10 text-white/60 text-sm">
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* 아바타 */}
      {!isUser && isFirst && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center
          mr-3 text-lg flex-shrink-0">
          {isJames ? '🎭' : '🌟'}
        </div>
      )}
      {!isUser && !isFirst && <div className="w-8 mr-3" />}

      {/* 버블 */}
      <div
        className={`px-4 py-3 rounded-lg max-w-xs
          ${
            isUser
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
              : isJames
                ? 'bg-red-500/15 border border-red-500/30 text-white rounded-bl-none'
                : 'bg-green-500/15 border border-green-500/30 text-white rounded-bl-none'
          }`}
      >
        <p className="break-words">{message.content}</p>
        <p className="text-xs opacity-50 mt-1">
          {new Date(message.timestamp).toLocaleTimeString('ko-KR')}
        </p>
      </div>
    </motion.div>
  );
}
```

### 2. ChatMessages.tsx

```typescript
// components/chat/ChatMessages.tsx

import { Message } from '@/types';
import { ChatBubble } from './ChatBubble';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatMessages({
  messages,
  isLoading = false,
}: ChatMessagesProps) {
  const endRef = useRef<HTMLDivElement>(null);

  // 새 메시지 시 자동 스크롤
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((msg, idx) => (
        <ChatBubble
          key={msg.id}
          message={msg}
          isFirst={
            idx === 0 ||
            messages[idx - 1].sender !== msg.sender
          }
          isLast={
            idx === messages.length - 1 ||
            messages[idx + 1].sender !== msg.sender
          }
        />
      ))}

      {/* 타이핑 인디케이터 */}
      {isLoading && (
        <motion.div className="flex gap-1 p-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-white/50"
              animate={{ y: [-4, 4, -4] }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                repeat: Infinity,
              }}
            />
          ))}
        </motion.div>
      )}

      <div ref={endRef} />
    </div>
  );
}
```

### 3. ChatInput.tsx

```typescript
// components/chat/ChatInput.tsx

import { useState } from 'react';
import { Send, Mic } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onMicStart: () => void;
  onMicEnd: () => void;
  isRecording?: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  onMicStart,
  onMicEnd,
  isRecording = false,
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className="p-4 border-t border-white/10
      flex gap-3 items-end">
      {/* 텍스트 입력 */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="메시지를 입력하세요..."
        disabled={disabled}
        className="flex-1 px-4 py-3 rounded-lg
          bg-white/5 border border-white/10
          text-white placeholder:text-white/40
          resize-none max-h-24
          disabled:opacity-50"
        rows={1}
      />

      {/* 마이크 버튼 */}
      <button
        onMouseDown={onMicStart}
        onMouseUp={onMicEnd}
        onTouchStart={onMicStart}
        onTouchEnd={onMicEnd}
        disabled={disabled}
        className={`p-3 rounded-lg transition-all
          ${
            isRecording
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-white/10 text-white hover:bg-white/20'
          }
          disabled:opacity-50`}
      >
        <Mic className="w-5 h-5" />
      </button>

      {/* Send 버튼 */}
      <button
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        className="p-3 rounded-lg bg-cyan-500 text-white
          hover:bg-cyan-600 transition-all
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}
```

### 4. ChatHeader.tsx

```typescript
// components/chat/ChatHeader.tsx

import { X, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatHeaderProps {
  lectureTitle: string;
  tokens: number;
  onClose: () => void;
}

export function ChatHeader({
  lectureTitle,
  tokens,
  onClose,
}: ChatHeaderProps) {
  return (
    <div className="p-4 border-b border-white/10
      flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-white
          flex items-center gap-2">
          {lectureTitle}
          <span className="px-2 py-1 rounded text-xs
            bg-red-500/20 text-red-300">
            LIVE
          </span>
        </h1>
      </div>

      {/* 토큰 카운터 */}
      <motion.div
        key={tokens}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-2
          px-4 py-2 rounded-full
          bg-yellow-500/20 border border-yellow-500/50"
      >
        <Coins className="w-5 h-5 text-yellow-400" />
        <span className="font-semibold text-yellow-400">
          {tokens}
        </span>
      </motion.div>

      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="p-2 hover:bg-white/10 rounded-lg
          transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
```

### 5. 통합 DebateRoom.tsx

```typescript
// components/debate/DebateRoom.tsx

'use client';

import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useToken } from '@/hooks/useToken';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';
import { useRouter } from 'next/navigation';

interface DebateRoomProps {
  lectureId: string;
  lectureTitle: string;
  lectureContext: string;
}

export function DebateRoom({
  lectureId,
  lectureTitle,
  lectureContext,
}: DebateRoomProps) {
  const router = useRouter();
  const { userProfile } = useAuth();
  const { tokens, addTokens } = useToken();
  const {
    messages,
    inputText,
    isRecording,
    isLoadingFromBackend,
    handleSendMessage,
    startRecording,
    stopRecording,
    handleEarnTokens,
  } = useChat({
    userProfile: userProfile!,
    lectureContext,
    lectureId,
    onEarnTokens: addTokens,
  });

  const handleClose = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br
      from-yeoul-navy via-blue-900 to-yeoul-navy">
      <ChatHeader
        lectureTitle={lectureTitle}
        tokens={tokens}
        onClose={handleClose}
      />

      <ChatMessages
        messages={messages}
        isLoading={isLoadingFromBackend}
      />

      <ChatInput
        onSend={(text) => {
          handleSendMessage(text);
          handleEarnTokens(10);
        }}
        onMicStart={startRecording}
        onMicEnd={stopRecording}
        isRecording={isRecording}
        disabled={isLoadingFromBackend}
      />
    </div>
  );
}
```

---

## ✅ 체크리스트

- [ ] ChatBubble 컴포넌트 구현
- [ ] ChatMessages 스크롤 자동화
- [ ] ChatInput 텍스트/마이크 입력
- [ ] ChatHeader 토큰 카운터
- [ ] 토큰 증가 애니메이션
- [ ] 3자 대화 메시지 UI 구분
- [ ] 반응형 레이아웃

---

## 📚 참고 문서

- `task-3.2-voice-recognition.md` - STT 연동
- `task-4.3-token-system.md` - 토큰 시스템
- `INTEGRATION_GUIDE.md` - 백엔드 연동

---

**상태**: 🟡 Phase 2 진행 중 (토론 UI)
**다음**: Phase 3 (음성, TTS)
**최종 업데이트**: 2026-01-31
