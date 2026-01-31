# Task 4.2: 토론 히스토리 저장

## 목표
토론 세션과 메시지를 Supabase에 저장하는 기능 구현

---

## 프롬프트

```
토론 세션과 메시지를 Supabase에 저장하는 기능을 구현해줘.

요구사항:
1. 세션 생성 (토론 시작 시):
   
   async function createDebateSession(lectureId, lectureTitle) {
     const { data } = await supabase
       .from('debate_sessions')
       .insert({ 
         user_id: user.id,
         lecture_id: lectureId,
         lecture_title: lectureTitle 
       })
       .select()
       .single();
     return data;
   }

2. 메시지 저장 (실시간):
   
   async function saveMessage(sessionId, sender, content, audioUrl?) {
     await supabase
       .from('debate_messages')
       .insert({ session_id: sessionId, sender, content, audio_url: audioUrl });
   }

3. 세션 종료:
   
   async function endDebateSession(sessionId, tokensEarned) {
     await supabase
       .from('debate_sessions')
       .update({ 
         status: 'completed',
         ended_at: new Date().toISOString(),
         tokens_earned: tokensEarned
       })
       .eq('id', sessionId);
   }

4. 히스토리 조회:
   - 최근 토론 목록 (10개)
   - 특정 세션의 전체 메시지
   - 총 토론 시간/횟수 통계

5. 실시간 구독 (선택):
   - Supabase Realtime으로 메시지 실시간 동기화
```

---

## 서비스 클래스 구현

```typescript
// lib/debateService.ts

import { supabase } from './supabase';
import type { DebateSession, DebateMessage } from '@/types';

export const debateService = {
  // 세션 생성
  async createSession(
    userId: string,
    lectureId: string,
    lectureTitle: string
  ): Promise<DebateSession> {
    const { data, error } = await supabase
      .from('debate_sessions')
      .insert({
        user_id: userId,
        lecture_id: lectureId,
        lecture_title: lectureTitle,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 메시지 저장
  async saveMessage(
    sessionId: string,
    sender: 'user' | 'james' | 'linda' | 'system',
    content: string,
    audioUrl?: string
  ): Promise<DebateMessage> {
    const { data, error } = await supabase
      .from('debate_messages')
      .insert({
        session_id: sessionId,
        sender,
        content,
        audio_url: audioUrl
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 세션 종료
  async endSession(sessionId: string, tokensEarned: number): Promise<void> {
    const { error } = await supabase
      .from('debate_sessions')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        tokens_earned: tokensEarned
      })
      .eq('id', sessionId);

    if (error) throw error;
  },

  // 최근 토론 목록 조회
  async getRecentSessions(userId: string, limit = 10): Promise<DebateSession[]> {
    const { data, error } = await supabase
      .from('debate_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // 세션 메시지 조회
  async getSessionMessages(sessionId: string): Promise<DebateMessage[]> {
    const { data, error } = await supabase
      .from('debate_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // 사용자 통계 조회
  async getUserStats(userId: string) {
    const { data, error } = await supabase
      .from('debate_sessions')
      .select('tokens_earned, started_at, ended_at')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (error) throw error;

    const totalSessions = data.length;
    const totalTokens = data.reduce((sum, s) => sum + (s.tokens_earned || 0), 0);
    const totalMinutes = data.reduce((sum, s) => {
      if (s.ended_at && s.started_at) {
        const diff = new Date(s.ended_at).getTime() - new Date(s.started_at).getTime();
        return sum + diff / 60000;
      }
      return sum;
    }, 0);

    return {
      totalSessions,
      totalTokens,
      totalMinutes: Math.round(totalMinutes)
    };
  }
};
```

## TypeScript 타입 정의

```typescript
// types/index.ts

export interface DebateSession {
  id: string;
  user_id: string;
  lecture_id: string;
  lecture_title: string;
  topic?: string;
  tokens_earned: number;
  started_at: string;
  ended_at?: string;
  status: 'active' | 'completed' | 'abandoned';
}

export interface DebateMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'james' | 'linda' | 'system';
  content: string;
  audio_url?: string;
  created_at: string;
}
```

## Store 연동

```typescript
// store/useDebateStore.ts

import { create } from 'zustand';
import { debateService } from '@/lib/debateService';

interface DebateStore {
  currentSession: DebateSession | null;
  messages: DebateMessage[];
  
  // 액션
  startSession: (userId: string, lectureId: string, lectureTitle: string) => Promise<void>;
  addMessage: (sender: string, content: string) => Promise<void>;
  endSession: () => Promise<void>;
}

export const useDebateStore = create<DebateStore>((set, get) => ({
  currentSession: null,
  messages: [],

  startSession: async (userId, lectureId, lectureTitle) => {
    const session = await debateService.createSession(userId, lectureId, lectureTitle);
    set({ currentSession: session, messages: [] });
  },

  addMessage: async (sender, content) => {
    const { currentSession, messages } = get();
    if (!currentSession) return;
    
    const message = await debateService.saveMessage(
      currentSession.id,
      sender as any,
      content
    );
    set({ messages: [...messages, message] });
  },

  endSession: async () => {
    const { currentSession } = get();
    if (!currentSession) return;
    
    // 토큰 계산 로직...
    const tokensEarned = 50; // 예시
    
    await debateService.endSession(currentSession.id, tokensEarned);
    set({ currentSession: null });
  }
}));
```

## 예상 결과물

- `/lib/debateService.ts`
- `/types/index.ts` (타입 추가)
- `/store/useDebateStore.ts` (업데이트)

## 예상 시간
약 30분
