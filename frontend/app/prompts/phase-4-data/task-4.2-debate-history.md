# Task 4.2: 토론 히스토리 저장

## 📋 현재 상태 (2026-01-31)

### ✅ 완료된 항목
- ✅ task-1.3: Supabase 스키마 (debate_sessions, debate_messages)
- ✅ task-4.1: Supabase Auth
- ✅ useChat Hook: API 연동

### 🔄 진행 중인 항목
- 🔄 **Phase 4: 히스토리 저장** (이 파일)

---

## 🎯 목표

**토론 히스토리 저장**: 세션과 메시지를 Supabase에 자동 저장

---

## 📝 구현 가이드

### 1. debateService.ts

```typescript
// lib/debateService.ts

import { supabase } from './supabase';
import type { DebateSession, DebateMessage } from '@/types';

export const debateService = {
  // 세션 생성
  async createSession(
    userId: string,
    lectureId: string,
    lectureTitle: string,
    lectureContext: string
  ): Promise<DebateSession> {
    const { data, error } = await supabase
      .from('debate_sessions')
      .insert({
        user_id: userId,
        lecture_id: lectureId,
        lecture_title: lectureTitle,
        lecture_context: lectureContext,
        status: 'active',
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
        audio_url: audioUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 세션 종료
  async endSession(
    sessionId: string,
    tokensEarned: number
  ): Promise<void> {
    const { error } = await supabase
      .from('debate_sessions')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        tokens_earned: tokensEarned,
      })
      .eq('id', sessionId);

    if (error) throw error;
  },

  // 최근 세션 조회
  async getRecentSessions(
    userId: string,
    limit = 10
  ): Promise<DebateSession[]> {
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
  async getSessionMessages(
    sessionId: string
  ): Promise<DebateMessage[]> {
    const { data, error } = await supabase
      .from('debate_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // 사용자 통계
  async getUserStats(userId: string) {
    const { data, error } = await supabase
      .from('debate_sessions')
      .select('tokens_earned, started_at, ended_at')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (error) throw error;

    const totalSessions = data.length;
    const totalTokens = data.reduce(
      (sum, s) => sum + (s.tokens_earned || 0),
      0
    );
    const totalMinutes = data.reduce((sum, s) => {
      if (s.ended_at && s.started_at) {
        const diff =
          new Date(s.ended_at).getTime() -
          new Date(s.started_at).getTime();
        return sum + diff / 60000;
      }
      return sum;
    }, 0);

    return {
      totalSessions,
      totalTokens,
      totalMinutes: Math.round(totalMinutes),
    };
  },
};
```

### 2. useChat Hook 통합

```typescript
// hooks/useChat.ts 수정

import { debateService } from '@/lib/debateService';
import { useAuth } from './useAuth';

export function useChat(options: UseChatOptions) {
  const { userProfile } = useAuth();
  const [currentSessionId, setCurrentSessionId] = useState<
    string | null
  >(null);

  const handleStartDebate = async () => {
    if (!userProfile) return;

    const session = await debateService.createSession(
      userProfile.id,
      options.lectureId,
      'Lecture Title', // 실제 제목 전달
      options.lectureContext
    );

    setCurrentSessionId(session.id);
  };

  const handleSendMessage = async (text: string) => {
    if (!currentSessionId) return;

    // 1. 사용자 메시지 저장
    await debateService.saveMessage(
      currentSessionId,
      'user',
      text
    );

    // 2. 백엔드 호출
    const response = await callBackendAPI(/*...*/);

    // 3. AI 응답 저장
    await debateService.saveMessage(
      currentSessionId,
      'james',
      response.james_response
    );
    await debateService.saveMessage(
      currentSessionId,
      'linda',
      response.linda_response
    );
  };

  const handleEndDebate = async () => {
    if (!currentSessionId) return;

    await debateService.endSession(
      currentSessionId,
      tokens // 획득한 토큰 수
    );

    setCurrentSessionId(null);
  };

  return {
    // ... 기존 반환값
    handleStartDebate,
    handleEndDebate,
  };
}
```

---

## ✅ 체크리스트

- [ ] debateService.ts 구현
- [ ] 세션 생성 시 자동 저장
- [ ] 메시지 실시간 저장
- [ ] 세션 종료 시 상태 업데이트
- [ ] 히스토리 조회 구현
- [ ] 통계 계산 함수

---

## 📚 참고 문서

- `task-1.3-supabase-schema.md` - 스키마
- `task-4.3-token-system.md` - 토큰 시스템
- Supabase 문서

---

**상태**: 🟡 Phase 4 진행 중 (히스토리)
**최종 업데이트**: 2026-01-31
