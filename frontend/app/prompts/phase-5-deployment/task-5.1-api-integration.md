# Task 5.1: Frontend-Backend API 연동

## 목표
프론트엔드와 백엔드 API를 연동하는 서비스 레이어 구현

---

## 프롬프트

```
프론트엔드와 백엔드 API를 연동하는 서비스 레이어를 구현해줘.

요구사항:
1. API 클라이언트 (lib/api.ts):

class YeoulAPI {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL;
  }
  
  // 토론 세션 시작
  async startDebate(lectureId: string, lectureContext: string): Promise<Session>
  
  // 메시지 전송 & AI 응답 받기
  async sendMessage(sessionId: string, message: string): Promise<DebateResponse>
  
  // TTS 오디오 스트림 가져오기  
  async synthesizeSpeech(text: string, speaker: Speaker): Promise<ArrayBuffer>
  
  // 헬스체크
  async healthCheck(): Promise<boolean>
}

2. React Query 통합 (선택):
   - useMutation for sendMessage
   - 낙관적 업데이트
   - 에러 재시도

3. 에러 처리:
   - 네트워크 에러 → 재시도 토스트
   - 서버 에러 → 에러 메시지 표시
   - 타임아웃 → 로딩 취소

4. 로딩 상태:
   - AI 응답 대기 중 스켈레톤
   - TTS 로딩 중 표시

5. 스트리밍 (선택):
   - Server-Sent Events로 AI 응답 스트리밍
   - 토큰 단위 실시간 표시
```

---

## API 클라이언트 구현

```typescript
// lib/api.ts

interface DebateResponse {
  james_response: string;
  linda_response: string;
  tokens_earned: number;
}

interface StartDebateResponse {
  session_id: string;
  initial_message: string;
}

class YeoulAPI {
  private baseUrl: string;
  private timeout: number = 30000;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new APIError(
          error.message || `HTTP ${response.status}`,
          response.status
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIError('Request timeout', 408);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // 헬스체크
  async healthCheck(): Promise<boolean> {
    try {
      await this.request('/api/v1/health');
      return true;
    } catch {
      return false;
    }
  }

  // 토론 세션 시작
  async startDebate(
    lectureId: string,
    lectureContext: string
  ): Promise<StartDebateResponse> {
    return this.request('/api/v1/debate/start', {
      method: 'POST',
      body: JSON.stringify({
        lecture_id: lectureId,
        lecture_context: lectureContext,
      }),
    });
  }

  // 메시지 전송 & AI 응답 받기
  async sendMessage(
    sessionId: string,
    message: string,
    lectureContext: string
  ): Promise<DebateResponse> {
    return this.request('/api/v1/debate/message', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        user_message: message,
        lecture_context: lectureContext,
      }),
    });
  }

  // TTS 오디오 가져오기
  async synthesizeSpeech(
    text: string,
    speaker: 'james' | 'linda'
  ): Promise<ArrayBuffer> {
    const response = await fetch(`${this.baseUrl}/api/v1/voice/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, speaker }),
    });

    if (!response.ok) {
      throw new APIError('Failed to synthesize speech', response.status);
    }

    return response.arrayBuffer();
  }
}

// 커스텀 에러 클래스
class APIError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'APIError';
  }
}

// 싱글톤 인스턴스
export const api = new YeoulAPI();
```

## React Query Hooks

```typescript
// hooks/useDebateAPI.ts

import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useDebateStore } from '@/store/useDebateStore';
import { toast } from 'sonner';

export function useStartDebate() {
  const { setSession } = useDebateStore();

  return useMutation({
    mutationFn: ({ lectureId, lectureContext }: { 
      lectureId: string; 
      lectureContext: string 
    }) => api.startDebate(lectureId, lectureContext),
    
    onSuccess: (data) => {
      setSession(data.session_id);
    },
    
    onError: (error) => {
      toast.error('토론 시작에 실패했습니다. 다시 시도해주세요.');
      console.error('Start debate error:', error);
    },
  });
}

export function useSendMessage() {
  const { addMessage, incrementTokens } = useDebateStore();

  return useMutation({
    mutationFn: ({ sessionId, message, lectureContext }: {
      sessionId: string;
      message: string;
      lectureContext: string;
    }) => api.sendMessage(sessionId, message, lectureContext),

    onMutate: async ({ message }) => {
      // 낙관적 업데이트: 사용자 메시지 즉시 표시
      addMessage({
        sender: 'user',
        content: message,
        timestamp: new Date(),
      });
    },

    onSuccess: (data) => {
      // AI 응답 추가
      addMessage({
        sender: 'james',
        content: data.james_response,
        timestamp: new Date(),
      });
      addMessage({
        sender: 'linda',
        content: data.linda_response,
        timestamp: new Date(),
      });
      
      // 토큰 적립
      incrementTokens(data.tokens_earned);
    },

    onError: (error) => {
      toast.error('메시지 전송에 실패했습니다.');
      console.error('Send message error:', error);
    },

    retry: 2,
    retryDelay: 1000,
  });
}

export function useSynthesizeSpeech() {
  return useMutation({
    mutationFn: ({ text, speaker }: { 
      text: string; 
      speaker: 'james' | 'linda' 
    }) => api.synthesizeSpeech(text, speaker),

    onError: (error) => {
      console.error('TTS error:', error);
      // TTS 실패 시 조용히 넘어감 (텍스트는 표시됨)
    },
  });
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.healthCheck(),
    refetchInterval: 30000, // 30초마다 체크
  });
}
```

## 통합 사용 예시

```tsx
// components/debate/DebateRoom.tsx

function DebateRoom() {
  const { messages, currentSession } = useDebateStore();
  const { mutate: sendMessage, isPending } = useSendMessage();
  const { mutate: synthesize, isPending: isSynthesizing } = useSynthesizeSpeech();
  const { speak, isPlaying } = useTextToSpeech();

  const handleSend = async (message: string) => {
    if (!currentSession) return;

    sendMessage(
      {
        sessionId: currentSession.id,
        message,
        lectureContext: currentSession.lectureContext,
      },
      {
        onSuccess: async (data) => {
          // James 음성 재생
          await speak(data.james_response, 'james');
          // Linda 음성 재생
          await speak(data.linda_response, 'linda');
        },
      }
    );
  };

  return (
    <div>
      {/* 메시지 목록 */}
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}

      {/* AI 응답 대기 중 */}
      {isPending && <TypingIndicator speaker="james" />}

      {/* 입력 영역 */}
      <MessageInput onSend={handleSend} disabled={isPending} />
    </div>
  );
}
```

## 예상 결과물

- `/lib/api.ts` - API 클라이언트
- `/hooks/useDebateAPI.ts` - React Query hooks
- 에러 처리 및 토스트 연동
- 로딩 상태 UI

## 예상 시간
약 1시간
