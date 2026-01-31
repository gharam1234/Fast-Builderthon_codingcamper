'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Video, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';

interface StrategyRoomProps {
  onComplete: () => void;
  onBack?: () => void;
}

export function StrategyRoom({ onComplete, onBack }: StrategyRoomProps) {
  const { formattedTime } = useTimer({ initialSeconds: 180 });
  const [strategies, setStrategies] = useState<string[]>([]);

  useEffect(() => {
    const strategyTimer = setTimeout(() => {
      setStrategies([
        '주장을 먼저 명확하게 제시하세요',
        '상대의 근거 부족을 공략하세요',
        '구체적인 예시를 준비하세요',
      ]);
    }, 2000);

    return () => clearTimeout(strategyTimer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-900 flex">
      {/* Security Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-8 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="뒤로가기"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Lock size={24} />
          </motion.div>
          <div>
            <h2 className="font-bold text-lg">🔒 비공개 전략 모드</h2>
            <p className="text-sm text-red-100">상대방은 이 대화를 들을 수 없습니다</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{formattedTime}</div>
          <div className="text-sm text-red-100">작전 시간 남음</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-24 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-6 h-[calc(100vh-150px)]">
            {/* James AI Coach - Left */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-red-950/50 to-orange-950/50 border-2 border-red-500/50 rounded-3xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-2xl">
                  🔥
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">James</h3>
                  <p className="text-sm text-red-400">비평가 코치</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-black/30 rounded-xl p-4 border border-red-500/30">
                  <h4 className="text-sm font-semibold text-red-400 mb-2">📍 공격 포인트</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {strategies.map((strategy, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.3 }}
                        className="flex items-start gap-2"
                      >
                        <span className="text-red-500">•</span>
                        <span>{strategy}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="bg-black/30 rounded-xl p-4 border border-red-500/30">
                  <h4 className="text-sm font-semibold text-red-400 mb-2">⚠️ 주의사항</h4>
                  <p className="text-xs text-gray-400">
                    감정적 대응은 피하고, 논리적 근거를 중심으로 반박하세요.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Center - User Webcam */}
            <div className="bg-white/5 border-2 border-cyan-500/50 rounded-3xl p-6 backdrop-blur-sm flex flex-col">
              <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden">
                <Video className="text-gray-600" size={64} />
                <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-2xl" />
                <motion.div
                  className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded-full text-white text-sm font-medium flex items-center gap-2"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                  전략 회의 중
                </motion.div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-sm font-semibold text-white mb-3">💬 메모 및 준비사항</h4>
                <textarea
                  placeholder="핵심 주장과 근거를 메모하세요..."
                  className="w-full bg-white/5 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-white/10 resize-none h-24"
                />
              </div>
            </div>

            {/* Linda AI Coach - Right */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-green-950/50 to-emerald-950/50 border-2 border-green-500/50 rounded-3xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-2xl">
                  🍀
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Linda</h3>
                  <p className="text-sm text-green-400">지지자 코치</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-black/30 rounded-xl p-4 border border-green-500/30">
                  <h4 className="text-sm font-semibold text-green-400 mb-2">✨ 강점 강화</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <motion.li
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-start gap-2"
                    >
                      <span className="text-green-500">•</span>
                      <span>긍정적인 사례를 먼저 제시하세요</span>
                    </motion.li>
                    <motion.li
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                      className="flex items-start gap-2"
                    >
                      <span className="text-green-500">•</span>
                      <span>논리적 연결을 명확히 하세요</span>
                    </motion.li>
                  </ul>
                </div>

                <div className="bg-black/30 rounded-xl p-4 border border-green-500/30">
                  <h4 className="text-sm font-semibold text-green-400 mb-2">🎯 목표</h4>
                  <p className="text-xs text-gray-400">
                    설득력 80% 이상 달성 시 추가 토큰 보너스를 받을 수 있습니다.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom - Opponent Muted Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 w-64 bg-black/80 border border-white/20 rounded-xl p-3 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">상대방 화면</span>
              <div className="flex items-center gap-1 text-xs text-red-400">
                <Lock size={12} />
                <span>음소거됨</span>
              </div>
            </div>
            <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg flex items-center justify-center border border-white/10">
              <Video className="text-gray-700" size={32} />
            </div>
          </motion.div>

          {/* Ready Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-cyan-500/30 flex items-center gap-3"
          >
            <Sparkles size={24} />
            전략 완료 - 배틀 시작하기
            <ArrowRight size={24} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
