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

interface RewardResult {
  success: boolean;
  total_tokens?: number;
  error?: string;
  calculation?: TokenCalculationResult;
}

export function useTokenReward() {
  const [state, setState] = useState<TokenRewardState>({
    isLoading: false,
    lastReward: null,
    showPopup: false,
  });
  
  const { 
    addTokensLocal, 
    incrementMessageCount, 
    messageCount,
    addPendingReward,
  } = useTokenStore();
  
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
  
  // 팝업 닫기
  const hidePopup = useCallback(() => {
    setState(prev => ({ ...prev, showPopup: false }));
  }, []);
  
  // 토론 시작 토큰 적립
  const rewardDebateStart = useCallback(async (sessionId?: string): Promise<RewardResult> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await addTokens(
        TOKEN_RULES.DEBATE_START.amount,
        TOKEN_RULES.DEBATE_START.reason as 'debate_participation',
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
  const rewardMessage = useCallback(async (
    message: string, 
    sessionId?: string
  ): Promise<RewardResult> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const currentCount = messageCount + 1;
      incrementMessageCount();
      
      const calculation = calculateMessageTokens(message, currentCount);
      
      // 모든 토큰을 한 번에 적립
      const result = await addTokens(
        calculation.totalTokens,
        calculation.breakdown[0].reason as 'debate_participation' | 'good_argument' | 'streak_bonus',
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
        
        // 펜딩 보상으로도 추가 (나중에 요약에서 표시)
        addPendingReward({
          amount: calculation.totalTokens,
          message: mainReward.message,
        });
      }
      
      return { ...result, calculation };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [messageCount, incrementMessageCount, addTokensLocal, showRewardPopup, addPendingReward]);
  
  // 토론 완료 토큰 적립
  const rewardDebateComplete = useCallback(async (
    sessionId: string,
    stats: { isFirstDebate: boolean; isFirstOfDay: boolean; totalDebates: number }
  ): Promise<RewardResult> => {
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
  
  // 커스텀 토큰 적립 (업적 등)
  const rewardCustom = useCallback(async (
    amount: number,
    reason: 'debate_participation' | 'good_argument' | 'streak_bonus' | 'daily_bonus' | 'achievement' | 'other',
    message: string,
    sessionId?: string
  ): Promise<RewardResult> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await addTokens(amount, reason, sessionId);
      
      if (result.success) {
        addTokensLocal(amount);
        showRewardPopup(amount, message);
      }
      
      return result;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [addTokensLocal, showRewardPopup]);
  
  return {
    // 상태
    isLoading: state.isLoading,
    lastReward: state.lastReward,
    showPopup: state.showPopup,
    
    // 액션
    rewardDebateStart,
    rewardMessage,
    rewardDebateComplete,
    rewardCustom,
    hidePopup,
    showRewardPopup,
  };
}
