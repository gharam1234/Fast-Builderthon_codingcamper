# Task 4.3: 토큰 시스템 구현

## 📋 현재 상태 (2026-01-31)

### ✅ 완료된 항목
- ✅ task-1.3: 토큰_transactions 테이블
- ✅ task-4.1: Supabase Auth
- ✅ task-4.2: 히스토리 저장

### 🔄 진행 중인 항목
- 🔄 **Phase 4: 토큰 시스템** (이 파일)

---

## 🎯 목표

**토큰 시스템**: 사용자 활동에 따라 토큰 획득, 소비, 리더보드

---

## 토큰 계산 로직

```typescript
// lib/tokenService.ts

export const TOKEN_RULES = {
  DEBATE_START: { amount: 10, reason: 'debate_start' },
  MESSAGE_SENT: { amount: 10, reason: 'message_sent' },
  LONG_MESSAGE: { amount: 20, reason: 'long_message' },      // 50자 이상
  QUESTION_ASKED: { amount: 15, reason: 'question_asked' },  // ? 포함
  STREAK_BONUS: { amount: 30, reason: 'streak_bonus' },      // 5회 연속
  DEBATE_COMPLETE: { amount: 50, reason: 'debate_complete' },
} as const;

export function calculateTokens(message: string, messageCount: number): number {
  let tokens = TOKEN_RULES.MESSAGE_SENT.amount;
  
  // 긴 메시지 보너스
  if (message.length >= 50) {
    tokens = TOKEN_RULES.LONG_MESSAGE.amount;
  }
  
  // 질문 보너스
  if (message.includes('?')) {
    tokens += 5; // 추가 보너스
  }
  
  // 스트릭 보너스 (5의 배수)
  if (messageCount > 0 && messageCount % 5 === 0) {
    tokens += TOKEN_RULES.STREAK_BONUS.amount;
  }
  
  return tokens;
}
```

## Supabase Edge Function

```typescript
// supabase/functions/add-tokens/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { userId, sessionId, amount, reason } = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // 1. 트랜잭션 기록
  const { error: txError } = await supabase
    .from('token_transactions')
    .insert({
      user_id: userId,
      session_id: sessionId,
      amount,
      reason
    });
  
  if (txError) {
    return new Response(JSON.stringify({ error: txError.message }), {
      status: 400
    });
  }
  
  // 2. 프로필 토큰 업데이트 (atomic)
  const { data, error } = await supabase.rpc('increment_tokens', {
    user_id: userId,
    amount: amount
  });
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400
    });
  }
  
  return new Response(JSON.stringify({ 
    success: true, 
    newTotal: data 
  }));
});
```

## SQL 함수 (Atomic Update)

```sql
-- Supabase SQL Editor에서 실행

CREATE OR REPLACE FUNCTION increment_tokens(
  user_id UUID,
  amount INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  new_total INTEGER;
BEGIN
  UPDATE profiles
  SET total_tokens = total_tokens + amount
  WHERE id = user_id
  RETURNING total_tokens INTO new_total;
  
  RETURN new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 토큰 획득 팝업 컴포넌트

```tsx
// components/ui/TokenPopup.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';

interface TokenPopupProps {
  amount: number;
  isVisible: boolean;
}

export function TokenPopup({ amount, isVisible }: TokenPopupProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          className="fixed top-20 right-4 z-50"
        >
          <div className="token-badge px-4 py-2 rounded-full flex items-center gap-2
                        shadow-lg shadow-yellow-500/20">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-lg font-bold text-yellow-400">
              +{amount}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

## 토론 종료 요약 모달

```tsx
// components/debate/DebateSummaryModal.tsx

interface DebateSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    totalMessages: number;
    tokensEarned: number;
    duration: number; // minutes
  };
}

export function DebateSummaryModal({ isOpen, onClose, stats }: DebateSummaryProps) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="glass-dark p-6 rounded-2xl max-w-sm mx-auto">
        <h2 className="text-xl font-bold text-center mb-6">🎉 토론 완료!</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-white/60">발언 횟수</span>
            <span className="font-semibold">{stats.totalMessages}회</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-white/60">토론 시간</span>
            <span className="font-semibold">{stats.duration}분</span>
          </div>
          
          <div className="border-t border-white/10 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-white/60">획득 토큰</span>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-xl font-bold text-yellow-400">
                  +{stats.tokensEarned}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-gradient-to-r from-yeoul-cyan to-yeoul-blue
                   rounded-xl font-semibold"
        >
          확인
        </button>
      </div>
    </Dialog>
  );
}
```

## 예상 결과물

- `/lib/tokenService.ts`
- `/supabase/functions/add-tokens/index.ts`
- `/components/ui/TokenPopup.tsx`
- `/components/debate/DebateSummaryModal.tsx`
- SQL 함수 스크립트

## 예상 시간
약 30분
