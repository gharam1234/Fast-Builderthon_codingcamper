# Task 4.4: 토큰 보상 시스템 구현

## 목표
프로젝트 Yeoul의 완전한 토큰 보상 시스템 구현 - 토론 참여 인센티브화를 통한 사용자 참여 극대화

---

## 프롬프트

```
프로젝트 Yeoul의 토큰 보상 시스템을 구현해줘.

## 프로젝트 컨텍스트
- Next.js 14 + TypeScript 프론트엔드
- FastAPI 백엔드
- Supabase (Auth, Database, Edge Functions)
- Zustand 상태관리
- Framer Motion 애니메이션

## 기존 인프라
- TokenRewardPopup.tsx 컴포넌트 존재 (애니메이션 팝업)
- Supabase Edge Function: add-tokens 존재
- profiles.total_tokens 필드 존재
- token_transactions 테이블 존재
- useDebateStore에 점수/상태 관리 존재

---

## 1. 토큰 적립 규칙 (TokenRules)

### 기본 적립
| 활동 | 토큰 | reason | 설명 |
|------|------|--------|------|
| 토론 시작 | +10 | debate_participation | 세션 생성 시 |
| 일반 발언 | +10 | debate_participation | 메시지 전송 시 |
| 긴 발언 (50자↑) | +20 | good_argument | 깊이 있는 발언 보상 |
| 질문 발언 (?포함) | +15 | good_argument | 질문하는 태도 장려 |
| 5회 연속 발언 | +30 | streak_bonus | 5의 배수 발언 시 추가 |
| 토론 완료 | +50 | debate_participation | 정상 종료 시 |

### 특별 보너스
| 활동 | 토큰 | reason | 조건 |
|------|------|--------|------|
| 첫 토론 | +100 | achievement | 첫 번째 완료된 토론 |
| 일일 첫 토론 | +20 | daily_bonus | 하루 첫 토론 완료 |
| 연속 출석 7일 | +50 | streak_bonus | 7일 연속 토론 참여 |
| 토론 마스터 | +200 | achievement | 10회 토론 완료 |

---

## 2. 구현할 파일 목록

### 프론트엔드
1. `lib/tokenService.ts` - 토큰 계산 로직 및 상수
2. `hooks/useTokenReward.ts` - 토큰 보상 관리 훅
3. `store/useTokenStore.ts` - 토큰 상태 전역 관리
4. `components/token/TokenDisplay.tsx` - 헤더 토큰 표시 컴포넌트
5. `components/token/TokenEarnedPopup.tsx` - 토큰 획득 알림 팝업
6. `components/debate/DebateSummaryModal.tsx` - 토론 종료 요약 모달
7. `components/token/TokenHistory.tsx` - 토큰 내역 컴포넌트
8. `components/token/Leaderboard.tsx` - 리더보드 컴포넌트

### 백엔드/DB
1. `supabase/migrations/token_functions.sql` - SQL 함수들
2. 기존 `add-tokens` Edge Function 업데이트

---

## 3. 구현 상세

### 3.1 lib/tokenService.ts

```typescript
// lib/tokenService.ts

export const TOKEN_RULES = {
  DEBATE_START: { amount: 10, reason: 'debate_participation', message: '토론 시작!' },
  MESSAGE_SENT: { amount: 10, reason: 'debate_participation', message: '발언 완료!' },
  LONG_MESSAGE: { amount: 20, reason: 'good_argument', message: '훌륭한 발언!' },
  QUESTION_ASKED: { amount: 15, reason: 'good_argument', message: '좋은 질문!' },
  STREAK_BONUS: { amount: 30, reason: 'streak_bonus', message: '연속 발언 보너스!' },
  DEBATE_COMPLETE: { amount: 50, reason: 'debate_participation', message: '토론 완료!' },
  FIRST_DEBATE: { amount: 100, reason: 'achievement', message: '첫 토론 완료!' },
  DAILY_FIRST: { amount: 20, reason: 'daily_bonus', message: '오늘의 첫 토론!' },
  WEEKLY_STREAK: { amount: 50, reason: 'streak_bonus', message: '7일 연속 참여!' },
  DEBATE_MASTER: { amount: 200, reason: 'achievement', message: '토론 마스터 달성!' },
} as const;

export type TokenReason = typeof TOKEN_RULES[keyof typeof TOKEN_RULES]['reason'];

export interface TokenCalculationResult {
  totalTokens: number;
  breakdown: Array<{
    amount: number;
    reason: TokenReason;
    message: string;
  }>;
}

/**
 * 발언에 따른 토큰 계산
 */
export function calculateMessageTokens(
  message: string,
  messageCount: number
): TokenCalculationResult {
  const breakdown: TokenCalculationResult['breakdown'] = [];
  
  // 기본 발언 토큰
  if (message.length >= 50) {
    breakdown.push({
      amount: TOKEN_RULES.LONG_MESSAGE.amount,
      reason: TOKEN_RULES.LONG_MESSAGE.reason,
      message: TOKEN_RULES.LONG_MESSAGE.message,
    });
  } else {
    breakdown.push({
      amount: TOKEN_RULES.MESSAGE_SENT.amount,
      reason: TOKEN_RULES.MESSAGE_SENT.reason,
      message: TOKEN_RULES.MESSAGE_SENT.message,
    });
  }
  
  // 질문 보너스
  if (message.includes('?') || message.includes('？')) {
    breakdown.push({
      amount: TOKEN_RULES.QUESTION_ASKED.amount - 10, // 추가분만
      reason: TOKEN_RULES.QUESTION_ASKED.reason,
      message: TOKEN_RULES.QUESTION_ASKED.message,
    });
  }
  
  // 스트릭 보너스 (5의 배수)
  if (messageCount > 0 && messageCount % 5 === 0) {
    breakdown.push({
      amount: TOKEN_RULES.STREAK_BONUS.amount,
      reason: TOKEN_RULES.STREAK_BONUS.reason,
      message: TOKEN_RULES.STREAK_BONUS.message,
    });
  }
  
  return {
    totalTokens: breakdown.reduce((sum, item) => sum + item.amount, 0),
    breakdown,
  };
}

/**
 * 토론 완료 토큰 계산
 */
export function calculateCompletionTokens(
  stats: {
    isFirstDebate: boolean;
    isFirstOfDay: boolean;
    totalDebates: number;
  }
): TokenCalculationResult {
  const breakdown: TokenCalculationResult['breakdown'] = [];
  
  // 기본 완료 토큰
  breakdown.push({
    amount: TOKEN_RULES.DEBATE_COMPLETE.amount,
    reason: TOKEN_RULES.DEBATE_COMPLETE.reason,
    message: TOKEN_RULES.DEBATE_COMPLETE.message,
  });
  
  // 첫 토론 보너스
  if (stats.isFirstDebate) {
    breakdown.push({
      amount: TOKEN_RULES.FIRST_DEBATE.amount,
      reason: TOKEN_RULES.FIRST_DEBATE.reason,
      message: TOKEN_RULES.FIRST_DEBATE.message,
    });
  }
  
  // 일일 첫 토론 보너스
  if (stats.isFirstOfDay) {
    breakdown.push({
      amount: TOKEN_RULES.DAILY_FIRST.amount,
      reason: TOKEN_RULES.DAILY_FIRST.reason,
      message: TOKEN_RULES.DAILY_FIRST.message,
    });
  }
  
  // 토론 마스터 (10회 달성 시)
  if (stats.totalDebates === 10) {
    breakdown.push({
      amount: TOKEN_RULES.DEBATE_MASTER.amount,
      reason: TOKEN_RULES.DEBATE_MASTER.reason,
      message: TOKEN_RULES.DEBATE_MASTER.message,
    });
  }
  
  return {
    totalTokens: breakdown.reduce((sum, item) => sum + item.amount, 0),
    breakdown,
  };
}
```

### 3.2 hooks/useTokenReward.ts

```typescript
// hooks/useTokenReward.ts

'use client';

import { useState, useCallback } from 'react';
import { addTokens } from '@/lib/supabase';
import { 
  calculateMessageTokens, 
  calculateCompletionTokens,
  TOKEN_RULES,
  TokenCalculationResult 
} from '@/lib/tokenService';
import { useTokenStore } from '@/store/useTokenStore';

interface TokenRewardState {
  isLoading: boolean;
  lastReward: {
    amount: number;
    message: string;
  } | null;
  showPopup: boolean;
}

export function useTokenReward() {
  const [state, setState] = useState<TokenRewardState>({
    isLoading: false,
    lastReward: null,
    showPopup: false,
  });
  
  const { addTokensLocal, incrementMessageCount, messageCount } = useTokenStore();
  
  // 팝업 표시
  const showRewardPopup = useCallback((amount: number, message: string) => {
    setState(prev => ({
      ...prev,
      lastReward: { amount, message },
      showPopup: true,
    }));
    
    // 3초 후 팝업 숨기기
    setTimeout(() => {
      setState(prev => ({ ...prev, showPopup: false }));
    }, 3000);
  }, []);
  
  // 토론 시작 토큰 적립
  const rewardDebateStart = useCallback(async (sessionId?: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await addTokens(
        TOKEN_RULES.DEBATE_START.amount,
        TOKEN_RULES.DEBATE_START.reason as any,
        sessionId
      );
      
      if (result.success) {
        addTokensLocal(TOKEN_RULES.DEBATE_START.amount);
        showRewardPopup(TOKEN_RULES.DEBATE_START.amount, TOKEN_RULES.DEBATE_START.message);
      }
      
      return result;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [addTokensLocal, showRewardPopup]);
  
  // 메시지 발언 토큰 적립
  const rewardMessage = useCallback(async (message: string, sessionId?: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const currentCount = messageCount + 1;
      incrementMessageCount();
      
      const calculation = calculateMessageTokens(message, currentCount);
      
      // 모든 토큰을 한 번에 적립
      const result = await addTokens(
        calculation.totalTokens,
        calculation.breakdown[0].reason as any,
        sessionId
      );
      
      if (result.success) {
        addTokensLocal(calculation.totalTokens);
        
        // 가장 높은 보상 메시지 표시
        const mainReward = calculation.breakdown.reduce(
          (max, curr) => (curr.amount > max.amount ? curr : max),
          calculation.breakdown[0]
        );
        showRewardPopup(calculation.totalTokens, mainReward.message);
      }
      
      return { ...result, calculation };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [messageCount, incrementMessageCount, addTokensLocal, showRewardPopup]);
  
  // 토론 완료 토큰 적립
  const rewardDebateComplete = useCallback(async (
    sessionId: string,
    stats: { isFirstDebate: boolean; isFirstOfDay: boolean; totalDebates: number }
  ) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const calculation = calculateCompletionTokens(stats);
      
      const result = await addTokens(
        calculation.totalTokens,
        'debate_participation',
        sessionId
      );
      
      if (result.success) {
        addTokensLocal(calculation.totalTokens);
      }
      
      return { ...result, calculation };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [addTokensLocal]);
  
  // 팝업 닫기
  const hidePopup = useCallback(() => {
    setState(prev => ({ ...prev, showPopup: false }));
  }, []);
  
  return {
    ...state,
    rewardDebateStart,
    rewardMessage,
    rewardDebateComplete,
    hidePopup,
    showRewardPopup,
  };
}
```

### 3.3 store/useTokenStore.ts

```typescript
// store/useTokenStore.ts

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface TokenState {
  totalTokens: number;
  sessionTokens: number;
  messageCount: number;
  pendingRewards: Array<{
    id: string;
    amount: number;
    message: string;
  }>;
}

interface TokenActions {
  setTotalTokens: (tokens: number) => void;
  addTokensLocal: (amount: number) => void;
  resetSessionTokens: () => void;
  incrementMessageCount: () => void;
  resetMessageCount: () => void;
  addPendingReward: (reward: { amount: number; message: string }) => void;
  clearPendingRewards: () => void;
}

const initialState: TokenState = {
  totalTokens: 0,
  sessionTokens: 0,
  messageCount: 0,
  pendingRewards: [],
};

export const useTokenStore = create<TokenState & TokenActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        
        setTotalTokens: (tokens) => set({ totalTokens: tokens }),
        
        addTokensLocal: (amount) => set((state) => ({
          totalTokens: state.totalTokens + amount,
          sessionTokens: state.sessionTokens + amount,
        })),
        
        resetSessionTokens: () => set({ sessionTokens: 0, messageCount: 0 }),
        
        incrementMessageCount: () => set((state) => ({
          messageCount: state.messageCount + 1,
        })),
        
        resetMessageCount: () => set({ messageCount: 0 }),
        
        addPendingReward: (reward) => set((state) => ({
          pendingRewards: [
            ...state.pendingRewards,
            { ...reward, id: `reward-${Date.now()}` },
          ],
        })),
        
        clearPendingRewards: () => set({ pendingRewards: [] }),
      }),
      {
        name: 'yeoul-token-storage',
        partialize: (state) => ({ totalTokens: state.totalTokens }),
      }
    )
  )
);
```

### 3.4 components/token/TokenDisplay.tsx

```typescript
// components/token/TokenDisplay.tsx

'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, TrendingUp } from 'lucide-react';
import { useTokenStore } from '@/store/useTokenStore';
import { getCurrentProfile } from '@/lib/supabase';

interface TokenDisplayProps {
  showSessionTokens?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function TokenDisplay({ showSessionTokens = false, size = 'md' }: TokenDisplayProps) {
  const { totalTokens, sessionTokens, setTotalTokens } = useTokenStore();
  
  // 초기 로딩 시 서버에서 토큰 동기화
  useEffect(() => {
    const syncTokens = async () => {
      const profile = await getCurrentProfile();
      if (profile) {
        setTotalTokens(profile.total_tokens);
      }
    };
    syncTokens();
  }, [setTotalTokens]);
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-1.5 text-base',
    lg: 'px-4 py-2 text-lg',
  };
  
  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };
  
  return (
    <div className="flex items-center gap-2">
      {/* 총 토큰 */}
      <motion.div
        className={`flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 
                   backdrop-blur-sm rounded-full border border-yellow-500/30 ${sizeClasses[size]}`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <Coins className="text-yellow-400" size={iconSizes[size]} />
        <AnimatePresence mode="wait">
          <motion.span
            key={totalTokens}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="font-bold text-yellow-400"
          >
            {totalTokens.toLocaleString()}
          </motion.span>
        </AnimatePresence>
      </motion.div>
      
      {/* 세션 토큰 (옵션) */}
      {showSessionTokens && sessionTokens > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`flex items-center gap-1 bg-green-500/20 backdrop-blur-sm 
                     rounded-full border border-green-500/30 ${sizeClasses[size]}`}
        >
          <TrendingUp className="text-green-400" size={iconSizes[size] - 2} />
          <span className="font-semibold text-green-400">+{sessionTokens}</span>
        </motion.div>
      )}
    </div>
  );
}
```

### 3.5 components/token/TokenEarnedPopup.tsx

```typescript
// components/token/TokenEarnedPopup.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Coins, Star, Zap } from 'lucide-react';

interface TokenEarnedPopupProps {
  show: boolean;
  amount: number;
  message: string;
  onClose?: () => void;
}

export function TokenEarnedPopup({ show, amount, message, onClose }: TokenEarnedPopupProps) {
  // 토큰 양에 따른 이모지 선택
  const getEmoji = () => {
    if (amount >= 100) return '🏆';
    if (amount >= 50) return '🎉';
    if (amount >= 30) return '⭐';
    return '✨';
  };
  
  // 토큰 양에 따른 색상
  const getColor = () => {
    if (amount >= 100) return 'from-purple-500 to-pink-500';
    if (amount >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-cyan-500 to-blue-500';
  };
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.5 }}
          transition={{ 
            type: 'spring', 
            damping: 15, 
            stiffness: 200 
          }}
          className="fixed bottom-24 right-4 z-50"
          onClick={onClose}
        >
          <div className="relative">
            {/* 글로우 효과 */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${getColor()} rounded-2xl blur-xl opacity-50`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            {/* 메인 카드 */}
            <motion.div
              className={`relative bg-gradient-to-r ${getColor()} rounded-2xl p-4 shadow-2xl 
                         min-w-[180px] backdrop-blur-xl border border-white/20`}
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* 파티클 효과 */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${10 + (i * 12)}%`,
                      top: '80%',
                    }}
                    animate={{
                      y: [-20, -60 - Math.random() * 40],
                      x: [(Math.random() - 0.5) * 30],
                      opacity: [1, 0],
                      scale: [1, 0.5],
                    }}
                    transition={{
                      duration: 1 + Math.random() * 0.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  >
                    {i % 2 === 0 ? (
                      <Star className="w-3 h-3 text-yellow-200" fill="currentColor" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-white/80" />
                    )}
                  </motion.div>
                ))}
              </div>
              
              {/* 콘텐츠 */}
              <div className="relative flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Coins className="w-8 h-8 text-white drop-shadow-lg" />
                </motion.div>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <motion.span
                      className="text-2xl font-black text-white drop-shadow-lg"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.3, repeat: 2 }}
                    >
                      +{amount}
                    </motion.span>
                    <span className="text-lg">{getEmoji()}</span>
                  </div>
                  <span className="text-xs text-white/80 font-medium">
                    {message}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 3.6 components/debate/DebateSummaryModal.tsx

```typescript
// components/debate/DebateSummaryModal.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Coins, MessageSquare, Clock, Trophy, Star, X } from 'lucide-react';
import { TokenCalculationResult } from '@/lib/tokenService';

interface DebateSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    totalMessages: number;
    duration: number; // 분 단위
    tokensEarned: number;
    tokenBreakdown?: TokenCalculationResult['breakdown'];
  };
}

export function DebateSummaryModal({ isOpen, onClose, stats }: DebateSummaryModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* 배경 오버레이 */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          
          {/* 모달 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 글로우 효과 */}
            <div className="absolute inset-0 bg-gradient-to-r from-yeoul-cyan/30 to-yeoul-blue/30 
                           rounded-3xl blur-2xl" />
            
            {/* 메인 카드 */}
            <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 
                           backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
              
              {/* 닫기 버튼 */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 
                          transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
              
              {/* 헤더 */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-block mb-3"
                >
                  <div className="relative">
                    <Trophy className="w-16 h-16 text-yellow-400" />
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Trophy className="w-16 h-16 text-yellow-400" />
                    </motion.div>
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-1">🎉 토론 완료!</h2>
                <p className="text-white/60">수고하셨습니다</p>
              </div>
              
              {/* 통계 */}
              <div className="space-y-3 mb-6">
                <StatItem
                  icon={<MessageSquare className="w-5 h-5 text-cyan-400" />}
                  label="발언 횟수"
                  value={`${stats.totalMessages}회`}
                  delay={0.3}
                />
                <StatItem
                  icon={<Clock className="w-5 h-5 text-purple-400" />}
                  label="토론 시간"
                  value={`${stats.duration}분`}
                  delay={0.4}
                />
              </div>
              
              {/* 토큰 보상 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 
                          rounded-2xl p-4 border border-yellow-500/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/60 font-medium">획득 토큰</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-6 h-6 text-yellow-400" />
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: 'spring' }}
                      className="text-3xl font-black text-yellow-400"
                    >
                      +{stats.tokensEarned}
                    </motion.span>
                  </div>
                </div>
                
                {/* 토큰 상세 내역 */}
                {stats.tokenBreakdown && (
                  <div className="space-y-1 pt-3 border-t border-yellow-500/20">
                    {stats.tokenBreakdown.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-white/50 flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {item.message}
                        </span>
                        <span className="text-yellow-400/80">+{item.amount}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
              
              {/* 확인 버튼 */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                onClick={onClose}
                className="w-full mt-6 py-4 bg-gradient-to-r from-yeoul-cyan to-yeoul-blue 
                          rounded-xl font-bold text-white text-lg shadow-lg 
                          shadow-yeoul-cyan/30 hover:shadow-yeoul-cyan/50 
                          transition-shadow"
              >
                확인
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 통계 아이템 컴포넌트
function StatItem({ 
  icon, 
  label, 
  value, 
  delay 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-white/60">{label}</span>
      </div>
      <span className="font-semibold text-white">{value}</span>
    </motion.div>
  );
}
```

### 3.7 components/token/Leaderboard.tsx

```typescript
// components/token/Leaderboard.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, User, ChevronUp, ChevronDown } from 'lucide-react';
import { getLeaderboard, LeaderboardEntry, getCurrentUser } from '@/lib/supabase';

type Period = 'weekly' | 'monthly' | 'all';

export function Leaderboard() {
  const [period, setPeriod] = useState<Period>('weekly');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [{ leaderboard }, user] = await Promise.all([
        getLeaderboard(10, 0, period),
        getCurrentUser(),
      ]);
      setEntries(leaderboard);
      setCurrentUserId(user?.id ?? null);
      setLoading(false);
    };
    fetchData();
  }, [period]);
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-300" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 text-center font-bold text-white/60">{rank}</span>;
    }
  };
  
  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3: return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/30';
      default: return 'bg-white/5 border-white/10';
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">리더보드</h2>
        </div>
        
        {/* 기간 선택 */}
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {(['weekly', 'monthly', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                ${period === p 
                  ? 'bg-yeoul-cyan text-white' 
                  : 'text-white/60 hover:text-white'
                }`}
            >
              {p === 'weekly' ? '주간' : p === 'monthly' ? '월간' : '전체'}
            </button>
          ))}
        </div>
      </div>
      
      {/* 리스트 */}
      <div className="space-y-2">
        {loading ? (
          // 스켈레톤 로딩
          Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i}
              className="h-16 bg-white/5 rounded-xl animate-pulse"
            />
          ))
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            아직 랭킹 데이터가 없습니다
          </div>
        ) : (
          entries.map((entry, index) => {
            const isCurrentUser = entry.user_id === currentUserId;
            
            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-transform
                  hover:scale-[1.02] ${getRankBg(entry.rank)}
                  ${isCurrentUser ? 'ring-2 ring-yeoul-cyan' : ''}`}
              >
                {/* 순위 */}
                <div className="flex-shrink-0 w-8 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                
                {/* 아바타 */}
                <div className="flex-shrink-0">
                  {entry.avatar_url ? (
                    <img
                      src={entry.avatar_url}
                      alt={entry.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-white/60" />
                    </div>
                  )}
                </div>
                
                {/* 유저 정보 */}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${isCurrentUser ? 'text-yeoul-cyan' : 'text-white'}`}>
                    {entry.username || '익명'}
                    {isCurrentUser && <span className="ml-2 text-xs">(나)</span>}
                  </p>
                  <p className="text-sm text-white/50">
                    토론 {entry.debate_count}회
                  </p>
                </div>
                
                {/* 토큰 */}
                <div className="flex-shrink-0 text-right">
                  <p className="font-bold text-yellow-400">
                    {entry.total_tokens.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/40">토큰</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
```

---

## 4. SQL 마이그레이션

### supabase/migrations/token_functions.sql

```sql
-- 토큰 증가 함수 (Atomic)
CREATE OR REPLACE FUNCTION increment_user_tokens(
  target_user_id UUID,
  token_amount INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  new_total INTEGER;
BEGIN
  UPDATE profiles
  SET 
    total_tokens = total_tokens + token_amount,
    updated_at = NOW()
  WHERE id = target_user_id
  RETURNING total_tokens INTO new_total;
  
  RETURN new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 세션 토큰 증가 함수
CREATE OR REPLACE FUNCTION increment_tokens_earned(
  target_session_id UUID,
  token_amount INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  new_total INTEGER;
BEGIN
  UPDATE debate_sessions
  SET tokens_earned = tokens_earned + token_amount
  WHERE id = target_session_id
  RETURNING tokens_earned INTO new_total;
  
  RETURN COALESCE(new_total, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자 통계 조회 함수
CREATE OR REPLACE FUNCTION get_user_stats(target_user_id UUID)
RETURNS TABLE (
  total_tokens INTEGER,
  total_debates BIGINT,
  completed_debates BIGINT,
  total_messages BIGINT,
  global_rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.total_tokens,
    COUNT(DISTINCT ds.id) AS total_debates,
    COUNT(DISTINCT ds.id) FILTER (WHERE ds.status = 'completed') AS completed_debates,
    COUNT(dm.id) AS total_messages,
    (
      SELECT COUNT(*) + 1
      FROM profiles p2
      WHERE p2.total_tokens > p.total_tokens
    ) AS global_rank
  FROM profiles p
  LEFT JOIN debate_sessions ds ON ds.user_id = p.id
  LEFT JOIN debate_messages dm ON dm.session_id = ds.id AND dm.sender = 'user'
  WHERE p.id = target_user_id
  GROUP BY p.id, p.total_tokens;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기간별 리더보드 조회 함수
CREATE OR REPLACE FUNCTION get_leaderboard_by_period(
  start_date TIMESTAMP DEFAULT '1970-01-01',
  result_limit INTEGER DEFAULT 10,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  total_tokens BIGINT,
  debate_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY SUM(tt.amount) DESC) AS rank,
    p.id AS user_id,
    p.username,
    p.avatar_url,
    COALESCE(SUM(tt.amount), 0)::BIGINT AS total_tokens,
    COUNT(DISTINCT ds.id)::BIGINT AS debate_count
  FROM profiles p
  LEFT JOIN token_transactions tt ON tt.user_id = p.id AND tt.created_at >= start_date
  LEFT JOIN debate_sessions ds ON ds.user_id = p.id AND ds.started_at >= start_date
  GROUP BY p.id, p.username, p.avatar_url
  HAVING COALESCE(SUM(tt.amount), 0) > 0
  ORDER BY total_tokens DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 일일 첫 토론 여부 확인 함수
CREATE OR REPLACE FUNCTION is_first_debate_of_day(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM debate_sessions
    WHERE user_id = target_user_id
      AND status = 'completed'
      AND DATE(ended_at) = CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 첫 토론 여부 확인 함수
CREATE OR REPLACE FUNCTION is_first_debate(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM debate_sessions
    WHERE user_id = target_user_id
      AND status = 'completed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 5. 통합 가이드

### 5.1 DebateRoom에서 토큰 보상 연동

```typescript
// components/debate/DebateRoom.tsx 에서 사용 예시

import { useTokenReward } from '@/hooks/useTokenReward';
import { TokenEarnedPopup } from '@/components/token/TokenEarnedPopup';
import { DebateSummaryModal } from '@/components/debate/DebateSummaryModal';

function DebateRoom() {
  const { 
    showPopup, 
    lastReward, 
    rewardDebateStart, 
    rewardMessage, 
    rewardDebateComplete,
    hidePopup 
  } = useTokenReward();
  
  const [showSummary, setShowSummary] = useState(false);
  const [summaryStats, setSummaryStats] = useState(null);
  
  // 토론 시작 시
  const handleStartDebate = async () => {
    const session = await createDebateSession(...);
    await rewardDebateStart(session.id);
  };
  
  // 메시지 전송 시
  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
    await rewardMessage(message, sessionId);
  };
  
  // 토론 완료 시
  const handleCompleteDebate = async () => {
    const stats = await getUserStats();
    const result = await rewardDebateComplete(sessionId, {
      isFirstDebate: stats.completed_debates === 0,
      isFirstOfDay: await isFirstDebateOfDay(),
      totalDebates: stats.completed_debates,
    });
    
    setSummaryStats({
      totalMessages: messageCount,
      duration: debateDuration,
      tokensEarned: result.calculation.totalTokens,
      tokenBreakdown: result.calculation.breakdown,
    });
    setShowSummary(true);
  };
  
  return (
    <>
      {/* 토론 UI */}
      
      {/* 토큰 팝업 */}
      <TokenEarnedPopup
        show={showPopup}
        amount={lastReward?.amount || 0}
        message={lastReward?.message || ''}
        onClose={hidePopup}
      />
      
      {/* 토론 완료 모달 */}
      <DebateSummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        stats={summaryStats}
      />
    </>
  );
}
```

### 5.2 헤더에 토큰 표시

```typescript
// components/layout/Header.tsx

import { TokenDisplay } from '@/components/token/TokenDisplay';

function Header() {
  return (
    <header className="...">
      {/* 다른 헤더 요소들 */}
      <TokenDisplay size="md" showSessionTokens />
    </header>
  );
}
```

---

## 6. 예상 결과물

| 파일 | 설명 |
|------|------|
| `lib/tokenService.ts` | 토큰 계산 로직 및 상수 |
| `hooks/useTokenReward.ts` | 토큰 보상 관리 훅 |
| `store/useTokenStore.ts` | Zustand 토큰 상태 스토어 |
| `components/token/TokenDisplay.tsx` | 헤더 토큰 표시 |
| `components/token/TokenEarnedPopup.tsx` | 토큰 획득 알림 팝업 |
| `components/debate/DebateSummaryModal.tsx` | 토론 종료 요약 모달 |
| `components/token/Leaderboard.tsx` | 리더보드 컴포넌트 |
| `supabase/migrations/token_functions.sql` | SQL 함수 스크립트 |

---

## 7. 예상 시간
약 1.5 ~ 2시간

## 8. 체크리스트

- [ ] tokenService.ts 생성 및 토큰 규칙 정의
- [ ] useTokenReward 훅 구현
- [ ] useTokenStore Zustand 스토어 생성
- [ ] TokenDisplay 컴포넌트 구현
- [ ] TokenEarnedPopup 컴포넌트 구현
- [ ] DebateSummaryModal 컴포넌트 구현
- [ ] Leaderboard 컴포넌트 구현
- [ ] SQL 함수 마이그레이션 실행
- [ ] DebateRoom에 토큰 시스템 통합
- [ ] 헤더에 TokenDisplay 추가
- [ ] 테스트 및 디버깅
```

---

## 참고 사항

- 기존 `TokenRewardPopup.tsx`와 `add-tokens` Edge Function 활용
- Supabase RPC 함수로 atomic 업데이트 보장
- Zustand persist로 오프라인 상태 유지
- Framer Motion으로 풍부한 애니메이션 효과
```
