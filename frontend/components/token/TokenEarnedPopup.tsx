// components/token/TokenEarnedPopup.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Coins, Star } from 'lucide-react';
import { getTokenEmoji, getTokenColorClass } from '@/lib/tokenService';

interface TokenEarnedPopupProps {
  show: boolean;
  amount: number;
  message: string;
  onClose?: () => void;
}

export function TokenEarnedPopup({ show, amount, message, onClose }: TokenEarnedPopupProps) {
  const emoji = getTokenEmoji(amount);
  const colorClass = getTokenColorClass(amount);
  
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
          className="fixed bottom-24 right-4 z-50 pointer-events-auto"
          onClick={onClose}
        >
          <div className="relative">
            {/* 글로우 효과 */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${colorClass} rounded-2xl blur-xl opacity-50`}
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
              className={`relative bg-gradient-to-r ${colorClass} rounded-2xl p-4 shadow-2xl 
                         min-w-[180px] backdrop-blur-xl border border-white/20 cursor-pointer`}
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
                    <span className="text-lg">{emoji}</span>
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

// 미니 토큰 팝업 (인라인용)
export function TokenMiniPopup({ 
  show, 
  amount,
  position = 'top',
}: { 
  show: boolean; 
  amount: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const positionStyles = {
    top: { initial: { y: 10 }, animate: { y: -30 } },
    bottom: { initial: { y: -10 }, animate: { y: 30 } },
    left: { initial: { x: 10 }, animate: { x: -30 } },
    right: { initial: { x: -10 }, animate: { x: 30 } },
  };
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, ...positionStyles[position].initial }}
          animate={{ opacity: 1, scale: 1, ...positionStyles[position].animate }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="absolute pointer-events-none z-10"
        >
          <span className="inline-flex items-center gap-1 px-2 py-1 
                         bg-yellow-500 text-white text-xs font-bold rounded-full shadow-lg">
            <Coins size={12} />
            +{amount}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
