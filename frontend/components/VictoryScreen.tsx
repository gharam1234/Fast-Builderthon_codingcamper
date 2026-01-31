import { motion } from 'framer-motion';
import { Trophy, Target, Award, TrendingUp, CheckCircle, Sparkles } from 'lucide-react';

interface VictoryScreenProps {
  onClose: () => void;
}

export function VictoryScreen({ onClose }: VictoryScreenProps) {
  const scores = {
    logic: 85,
    persuasion: 78,
    evidence: 82,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-8"
    >
      {/* Confetti Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: -20,
              rotate: 0,
            }}
            animate={{
              y: window.innerHeight + 20,
              rotate: 360,
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="relative max-w-4xl w-full bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border-4 border-yellow-500/50 rounded-3xl p-12 shadow-2xl"
      >
        {/* Trophy Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="absolute -top-16 left-1/2 -translate-x-1/2"
        >
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
              <Trophy size={64} className="text-white" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(234, 179, 8, 0.5)',
                  '0 0 60px rgba(234, 179, 8, 0.8)',
                  '0 0 20px rgba(234, 179, 8, 0.5)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </div>
        </motion.div>

        {/* Winner Announcement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-8 mt-8"
        >
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 mb-4">
            WINNER: Team Yeoul
          </h1>
          <p className="text-2xl text-white mb-2">축하합니다! 🎉</p>
          <p className="text-lg text-gray-400">50분 라이브 토론 배틀에서 승리했습니다</p>
        </motion.div>

        {/* Assignment Completed Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-green-950/50 to-emerald-950/50 border-2 border-green-500/50 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-400 mb-1">
                🎉 Special Event Completed!
              </h3>
              <p className="text-green-300">Assignment Verified</p>
            </div>
          </div>
          <div className="bg-black/30 rounded-xl p-4 border border-green-500/30">
            <p className="text-sm text-gray-300">
              ✅ Chapter 3 과제가 자동으로 완료 처리되었습니다<br/>
              ✅ 학습 기록에 저장되었습니다<br/>
              ✅ 토큰 보상이 지급되었습니다
            </p>
          </div>
        </motion.div>

        {/* Performance Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Target className="text-purple-400" size={24} />
            Performance Analysis
          </h3>

          {/* Radar Chart Visual */}
          <div className="grid grid-cols-3 gap-6">
            {/* Logic Score */}
            <div className="bg-white/5 border border-cyan-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-cyan-500 rounded-full" />
                <span className="text-sm text-gray-400">논리력 (Logic)</span>
              </div>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-gray-800"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - scores.logic / 100)}`}
                    className="text-cyan-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{scores.logic}%</span>
                </div>
              </div>
              <p className="text-xs text-center text-cyan-400 font-medium">Excellent!</p>
            </div>

            {/* Persuasion Score */}
            <div className="bg-white/5 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="text-sm text-gray-400">설득력 (Persuasion)</span>
              </div>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-gray-800"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - scores.persuasion / 100)}`}
                    className="text-purple-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{scores.persuasion}%</span>
                </div>
              </div>
              <p className="text-xs text-center text-purple-400 font-medium">Great job!</p>
            </div>

            {/* Evidence Score */}
            <div className="bg-white/5 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-400">근거력 (Evidence)</span>
              </div>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-gray-800"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - scores.evidence / 100)}`}
                    className="text-green-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{scores.evidence}%</span>
                </div>
              </div>
              <p className="text-xs text-center text-green-400 font-medium">Very good!</p>
            </div>
          </div>
        </motion.div>

        {/* Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-gradient-to-r from-yellow-950/30 to-orange-950/30 border border-yellow-500/30 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-4">
            <Award className="text-yellow-400" size={32} />
            <div className="flex-1">
              <h4 className="font-bold text-white mb-2">획득한 보상</h4>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-yellow-400" size={16} />
                  <span className="text-gray-300">+50 토큰</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-green-400" size={16} />
                  <span className="text-gray-300">+100 XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="text-orange-400" size={16} />
                  <span className="text-gray-300">배틀 승리 뱃지</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Clapping */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="flex items-center justify-center gap-8 mb-8"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className="text-6xl"
          >
            🔥
          </motion.div>
          <div className="text-center">
            <p className="text-white font-medium mb-1">AI Agents</p>
            <p className="text-sm text-gray-400">축하합니다! 👏</p>
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className="text-6xl"
          >
            🍀
          </motion.div>
        </motion.div>

        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 rounded-2xl font-bold text-lg shadow-2xl"
        >
          대시보드로 돌아가기
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
