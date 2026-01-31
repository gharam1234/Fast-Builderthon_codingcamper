'use client'

import { useState } from 'react';
import { motion } from 'motion/react';
import { Headphones, Zap, Users, TrendingUp } from 'lucide-react';

interface AudienceLobbyProps {
  onSelectTeam: (team: 'yeoul' | 'challenger') => void;
}

export function AudienceLobby({ onSelectTeam }: AudienceLobbyProps) {
  const [hoveredTeam, setHoveredTeam] = useState<'yeoul' | 'challenger' | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-900 flex items-center justify-center p-8">
      {/* Background Arena */}
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.unsplash.com/photo-1614738499301-d2eed34f7b11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3BvcnRzJTIwYXJlbmElMjBnYW1pbmclMjBiYXR0bGV8ZW58MXx8fHwxNzY5ODQwOTI0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Arena"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-full mb-4"
          >
            <span className="text-white font-bold flex items-center gap-2">
              <Users size={20} />
              관전자 모드
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold text-white mb-4"
          >
            Choose a Strategy Room to Spy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-400"
          >
            어느 팀의 작전회의를 엿들을까요? 🎧
          </motion.p>
        </div>

        {/* Team Selection */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Team Yeoul */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onHoverStart={() => setHoveredTeam('yeoul')}
            onHoverEnd={() => setHoveredTeam(null)}
            className="relative"
          >
            <div className={`bg-gradient-to-br from-cyan-950/50 to-blue-950/50 border-4 rounded-3xl p-8 transition-all cursor-pointer ${
              hoveredTeam === 'yeoul' ? 'border-cyan-400 scale-105' : 'border-cyan-600/50'
            }`}>
              {/* Glow Effect */}
              {hoveredTeam === 'yeoul' && (
                <motion.div
                  className="absolute inset-0 bg-cyan-500/20 rounded-3xl blur-2xl"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              <div className="relative z-10">
                {/* Team Badge */}
                <div className="flex items-center justify-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-5xl shadow-2xl">
                    🌊
                  </div>
                </div>

                {/* Team Info */}
                <h3 className="text-3xl font-bold text-cyan-400 text-center mb-3">
                  Team Yeoul
                </h3>
                <p className="text-center text-gray-300 mb-6">
                  AI 코치와 의논 중...
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/30 rounded-xl p-3 border border-cyan-500/30">
                    <div className="text-xs text-gray-400 mb-1">현재 관전자</div>
                    <div className="text-2xl font-bold text-cyan-400">127</div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3 border border-cyan-500/30">
                    <div className="text-xs text-gray-400 mb-1">승률</div>
                    <div className="text-2xl font-bold text-cyan-400">72%</div>
                  </div>
                </div>

                {/* Listen Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectTeam('yeoul')}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl"
                >
                  <Headphones size={24} />
                  🎧 엿듣기
                </motion.button>

                {/* Status */}
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center gap-2 text-sm text-cyan-400">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    전략 회의 진행 중
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Team Challenger */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onHoverStart={() => setHoveredTeam('challenger')}
            onHoverEnd={() => setHoveredTeam(null)}
            className="relative"
          >
            <div className={`bg-gradient-to-br from-red-950/50 to-orange-950/50 border-4 rounded-3xl p-8 transition-all cursor-pointer ${
              hoveredTeam === 'challenger' ? 'border-red-400 scale-105' : 'border-red-600/50'
            }`}>
              {/* Glow Effect */}
              {hoveredTeam === 'challenger' && (
                <motion.div
                  className="absolute inset-0 bg-red-500/20 rounded-3xl blur-2xl"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              <div className="relative z-10">
                {/* Team Badge */}
                <div className="flex items-center justify-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center text-5xl shadow-2xl">
                    ⚔️
                  </div>
                </div>

                {/* Team Info */}
                <h3 className="text-3xl font-bold text-red-400 text-center mb-3">
                  Team Challenger
                </h3>
                <p className="text-center text-gray-300 mb-6">
                  전략 수립 중...
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/30 rounded-xl p-3 border border-red-500/30">
                    <div className="text-xs text-gray-400 mb-1">현재 관전자</div>
                    <div className="text-2xl font-bold text-red-400">98</div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3 border border-red-500/30">
                    <div className="text-xs text-gray-400 mb-1">승률</div>
                    <div className="text-2xl font-bold text-red-400">68%</div>
                  </div>
                </div>

                {/* Listen Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectTeam('challenger')}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl"
                >
                  <Headphones size={24} />
                  🎧 엿듣기
                </motion.button>

                {/* Status */}
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center gap-2 text-sm text-red-400">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    전략 회의 진행 중
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* VS Lightning */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        >
          <div className="relative">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="w-32 h-32 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-2xl"
            >
              VS
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(234, 179, 8, 0.5)',
                  '0 0 40px rgba(234, 179, 8, 0.8)',
                  '0 0 20px rgba(234, 179, 8, 0.5)',
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
            <Zap className="absolute -top-8 -right-8 text-yellow-400" size={48} />
          </div>
        </motion.div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm inline-block">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-cyan-400" size={20} />
                <span className="text-gray-300">실시간 채팅 참여 가능</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-xl">🎁</span>
                <span className="text-gray-300">관전 참여 시 +5 토큰</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
