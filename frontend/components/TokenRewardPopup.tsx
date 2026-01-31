import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface TokenRewardPopupProps {
  show: boolean;
  amount: number;
  message: string;
}

export function TokenRewardPopup({ show, amount, message }: TokenRewardPopupProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="relative">
            {/* Glow Effect */}
            <motion.div
              className="absolute inset-0 bg-yellow-500/30 rounded-3xl blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Main Card */}
            <motion.div
              className="relative bg-gradient-to-br from-yellow-500/90 to-amber-600/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-yellow-400/50 min-w-[280px]"
              animate={{
                rotate: [-2, 2, -2],
              }}
              transition={{
                duration: 0.5,
                repeat: 3,
                ease: 'easeInOut',
              }}
            >
              {/* Confetti Particles */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#f59e0b' : '#ef4444',
                      left: `${Math.random() * 100}%`,
                      top: '50%',
                    }}
                    animate={{
                      y: [0, -100 - Math.random() * 100],
                      x: [(Math.random() - 0.5) * 100],
                      opacity: [1, 0],
                      rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                    }}
                    transition={{
                      duration: 1 + Math.random(),
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="relative text-center">
                <motion.div
                  className="mb-4 flex justify-center"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 0.5, repeat: Infinity, repeatDelay: 0.5 },
                  }}
                >
                  <Sparkles className="text-white" size={48} />
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-2">🎉</h2>
                <p className="text-lg font-semibold text-white mb-3">
                  {message}
                </p>

                <motion.div
                  className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 inline-block"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                >
                  <span className="text-2xl font-bold text-white">
                    +{amount} 토큰
                  </span>
                </motion.div>
              </div>

              {/* Sparkle Effects */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    x: [0, Math.cos((i * Math.PI) / 3) * 80],
                    y: [0, Math.sin((i * Math.PI) / 3) * 80],
                    opacity: [1, 0],
                    scale: [1, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    ease: 'easeOut',
                    delay: 0.2,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
