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
  className?: string;
}

export function TokenDisplay({ 
  showSessionTokens = false, 
  size = 'md',
  className = '',
}: TokenDisplayProps) {
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
    sm: 'px-2 py-1 text-sm gap-1.5',
    md: 'px-3 py-1.5 text-base gap-2',
    lg: 'px-4 py-2 text-lg gap-2.5',
  };
  
  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 총 토큰 */}
      <motion.div
        className={`flex items-center bg-gradient-to-r from-yellow-500/20 to-amber-500/20 
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
          exit={{ scale: 0, opacity: 0 }}
          className={`flex items-center bg-green-500/20 backdrop-blur-sm 
                     rounded-full border border-green-500/30 ${sizeClasses[size]}`}
        >
          <TrendingUp className="text-green-400" size={iconSizes[size] - 2} />
          <span className="font-semibold text-green-400">+{sessionTokens}</span>
        </motion.div>
      )}
    </div>
  );
}

// 간단한 인라인 토큰 표시용 컴포넌트
export function TokenBadge({ 
  amount, 
  showPlus = false,
  size = 'sm',
}: { 
  amount: number; 
  showPlus?: boolean;
  size?: 'sm' | 'md';
}) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
  };
  
  const iconSizes = {
    sm: 12,
    md: 14,
  };
  
  return (
    <span className={`inline-flex items-center rounded-full bg-yellow-500/20 
                     text-yellow-400 font-medium ${sizeClasses[size]}`}>
      <Coins size={iconSizes[size]} />
      {showPlus && '+'}
      {amount.toLocaleString()}
    </span>
  );
}
