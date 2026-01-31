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

export interface TokenBreakdownItem {
  amount: number;
  reason: TokenReason;
  message: string;
}

export interface TokenCalculationResult {
  totalTokens: number;
  breakdown: TokenBreakdownItem[];
}

/**
 * 발언에 따른 토큰 계산
 */
export function calculateMessageTokens(
  message: string,
  messageCount: number
): TokenCalculationResult {
  const breakdown: TokenBreakdownItem[] = [];
  
  const isLongMessage = message.length >= 50;
  const isQuestion = message.includes('?') || message.includes('？');
  
  // 기본 발언 토큰 계산 (긴 발언, 질문, 일반 발언 중 하나만 적용)
  // 우선순위: 긴 발언(20) > 질문(15) > 일반(10)
  if (isLongMessage) {
    breakdown.push({
      amount: TOKEN_RULES.LONG_MESSAGE.amount,
      reason: TOKEN_RULES.LONG_MESSAGE.reason,
      message: TOKEN_RULES.LONG_MESSAGE.message,
    });
  } else if (isQuestion) {
    breakdown.push({
      amount: TOKEN_RULES.QUESTION_ASKED.amount,
      reason: TOKEN_RULES.QUESTION_ASKED.reason,
      message: TOKEN_RULES.QUESTION_ASKED.message,
    });
  } else {
    breakdown.push({
      amount: TOKEN_RULES.MESSAGE_SENT.amount,
      reason: TOKEN_RULES.MESSAGE_SENT.reason,
      message: TOKEN_RULES.MESSAGE_SENT.message,
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
  const breakdown: TokenBreakdownItem[] = [];
  
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
  if (stats.isFirstOfDay && !stats.isFirstDebate) {
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

/**
 * 토큰 reason에 따른 한글 설명 반환
 */
export function getReasonLabel(reason: TokenReason | 'other'): string {
  switch (reason) {
    case 'debate_participation':
      return '토론 참여';
    case 'good_argument':
      return '좋은 발언';
    case 'streak_bonus':
      return '연속 보너스';
    case 'daily_bonus':
      return '일일 보너스';
    case 'achievement':
      return '업적 달성';
    case 'other':
      return '기타';
    default:
      return '기타';
  }
}

/**
 * 토큰 양에 따른 이모지 반환
 */
export function getTokenEmoji(amount: number): string {
  if (amount >= 100) return '🏆';
  if (amount >= 50) return '🎉';
  if (amount >= 30) return '⭐';
  if (amount >= 20) return '✨';
  return '💫';
}

/**
 * 토큰 양에 따른 그라데이션 색상 클래스 반환
 */
export function getTokenColorClass(amount: number): string {
  if (amount >= 100) return 'from-purple-500 to-pink-500';
  if (amount >= 50) return 'from-yellow-500 to-orange-500';
  if (amount >= 30) return 'from-green-500 to-emerald-500';
  return 'from-cyan-500 to-blue-500';
}
