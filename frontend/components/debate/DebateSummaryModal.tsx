// components/debate/DebateSummaryModal.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Coins, MessageSquare, Clock, Trophy, Star, X, Share2 } from 'lucide-react';
import { TokenBreakdownItem } from '@/lib/tokenService';

interface DebateSummaryStats {
  totalMessages: number;
  duration: number; // 분 단위
  tokensEarned: number;
  tokenBreakdown?: TokenBreakdownItem[];
  winner?: 'james' | 'linda' | 'draw' | null;
  topic?: string;
}

interface DebateSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: DebateSummaryStats;
  onShare?: () => void;
}

export function DebateSummaryModal({ 
  isOpen, 
  onClose, 
  stats,
  onShare,
}: DebateSummaryModalProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 1) return '1분 미만';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
    }
    return `${minutes}분`;
  };

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
          <motion.div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
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
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 
                           rounded-3xl blur-2xl" />
            
            {/* 메인 카드 */}
            <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 
                           backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
              
              {/* 닫기 버튼 */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 
                          transition-colors z-10"
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
                
                {stats.topic && (
                  <p className="mt-2 text-sm text-white/40 truncate max-w-xs mx-auto">
                    주제: {stats.topic}
                  </p>
                )}
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
                  value={formatDuration(stats.duration)}
                  delay={0.4}
                />
                {stats.winner && stats.winner !== 'draw' && (
                  <StatItem
                    icon={<Trophy className="w-5 h-5 text-yellow-400" />}
                    label="승자"
                    value={stats.winner === 'james' ? 'James' : 'Linda'}
                    delay={0.45}
                  />
                )}
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
                {stats.tokenBreakdown && stats.tokenBreakdown.length > 0 && (
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
              
              {/* 버튼들 */}
              <div className="flex gap-3 mt-6">
                {onShare && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    onClick={onShare}
                    className="flex-1 py-4 bg-white/10 hover:bg-white/20 
                              rounded-xl font-semibold text-white transition-colors
                              flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    공유
                  </motion.button>
                )}
                
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  onClick={onClose}
                  className={`py-4 bg-gradient-to-r from-cyan-500 to-blue-500 
                            rounded-xl font-bold text-white text-lg shadow-lg 
                            shadow-cyan-500/30 hover:shadow-cyan-500/50 
                            transition-shadow ${onShare ? 'flex-1' : 'w-full'}`}
                >
                  확인
                </motion.button>
              </div>
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
