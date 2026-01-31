import { motion } from 'framer-motion';
import { Swords, Users, Ticket, Sparkles } from 'lucide-react';

interface LiveArenaEventProps {
  onRegisterDebater: () => void;
  onJoinAudience: () => void;
}

export function LiveArenaEvent({ onRegisterDebater, onJoinAudience }: LiveArenaEventProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative my-6"
    >
      {/* Glowing Background Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"
        animate={{
          opacity: [0.4, 0.8, 0.4],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main Card */}
      <div className="relative bg-gradient-to-br from-purple-950/50 via-blue-950/50 to-cyan-950/50 border-2 border-cyan-500/50 rounded-3xl p-8 backdrop-blur-sm overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0, 255, 255, 0.1) 35px, rgba(0, 255, 255, 0.1) 70px)',
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Badge */}
          <div className="flex items-center justify-between mb-6">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full"
            >
              <Sparkles size={20} className="text-white" />
              <span className="text-sm font-bold text-white">SPECIAL EVENT</span>
            </motion.div>
            <div className="flex items-center gap-2 text-cyan-400">
              <Ticket size={20} />
              <span className="text-sm font-medium">Limited Slots</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="mb-8">
            <motion.h3
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-3"
              animate={{
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                backgroundSize: '200% 200%',
              }}
            >
              🏆 Yeoul Live Arena
            </motion.h3>
            <h4 className="text-2xl font-semibold text-white mb-3">
              Live Debate Battle
            </h4>
            <p className="text-lg text-cyan-300 mb-2">
              지루한 과제는 그만! 50분 라이브 토론으로 과제를 대체하세요
            </p>
            <p className="text-gray-400">
              실시간 1:1 토론 배틀 • AI 코치 전략 지원 • 관중 참여 • 과제 완료 인증
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-cyan-400">50min</div>
              <div className="text-xs text-gray-400">배틀 시간</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-green-400">+50</div>
              <div className="text-xs text-gray-400">토큰 보상</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-purple-400">1:1</div>
              <div className="text-xs text-gray-400">실시간 대결</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-yellow-400">∞</div>
              <div className="text-xs text-gray-400">관중 참여</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-6">
            {/* Debater Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRegisterDebater}
              className="relative group bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-2xl p-6 transition-all shadow-2xl shadow-cyan-500/30"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 rounded-2xl blur-xl"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
              <div className="relative z-10">
                <Swords className="mx-auto mb-3 text-white" size={36} />
                <h4 className="text-xl font-bold text-white mb-2">토론자로 등록</h4>
                <p className="text-sm text-cyan-100 mb-4">
                  AI 코치와 함께 상대방과 배틀
                </p>
                <div className="text-xs text-cyan-200 font-medium">
                  → 과제 완료 인증 가능
                </div>
              </div>
            </motion.button>

            {/* Audience Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onJoinAudience}
              className="relative group bg-white/5 hover:bg-white/10 border-2 border-purple-500/50 hover:border-purple-400 rounded-2xl p-6 transition-all"
            >
              <div className="relative z-10">
                <Users className="mx-auto mb-3 text-purple-400" size={36} />
                <h4 className="text-xl font-bold text-white mb-2">관전자로 참여</h4>
                <p className="text-sm text-gray-300 mb-4">
                  실시간 토론 관람 & 채팅
                </p>
                <div className="text-xs text-purple-400 font-medium">
                  → 토큰 리워드 획득 가능
                </div>
              </div>
            </motion.button>
          </div>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              💡 팀 여울 vs 챌린저 • 실시간 로직 점수 • AI 전략 지원
            </div>
            <div className="text-sm text-cyan-400 font-medium">
              다음 배틀: 15분 후
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
