'use client'

import { useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle, Circle, Camera, FileText, BarChart3, Trophy, Waves } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Lecture } from '@/types';
import { LiveArenaEvent } from './LiveArenaEvent';

interface CourseDashboardProps {
  lecture: Lecture;
  tokens: number;
  onStartDebate: () => void;
  onStartArena: () => void;
  onBack: () => void;
}

export function CourseDashboard({ lecture, tokens, onStartDebate, onStartArena, onBack }: CourseDashboardProps) {
  const [selectedChapter, setSelectedChapter] = useState(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex">
      {/* Left Sidebar - Curriculum */}
      <aside className="w-80 border-r border-white/10 bg-slate-950/50 backdrop-blur-xl flex flex-col">
        <div className="p-6 border-b border-white/10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>강의 목록으로</span>
          </button>
          <h2 className="font-bold text-white text-lg mb-1">{lecture.title}</h2>
          <p className="text-sm text-gray-400">{lecture.instructor} 강사</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-400">커리큘럼</h3>
              <span className="text-xs text-gray-500">2/{lecture.curriculum.length} 완료</span>
            </div>
            <div className="w-full bg-gray-800/50 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(2 / lecture.curriculum.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            {lecture.curriculum.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedChapter(item.id - 1)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  selectedChapter === item.id - 1
                    ? 'bg-cyan-950/50 border border-cyan-500/50'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {item.completed ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : item.current ? (
                      <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    ) : (
                      <Circle size={20} className="text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium mb-1 ${
                      selectedChapter === item.id - 1 ? 'text-cyan-400' : 'text-white'
                    }`}>
                      {item.id}. {item.title}
                    </h4>
                    <span className="text-xs text-gray-500">{item.duration}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Token Display */}
        <div className="p-4 border-t border-white/10 bg-slate-950/80">
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-950/30 to-orange-950/30 border border-yellow-500/30 rounded-xl">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400" size={20} />
              <span className="text-sm text-gray-300">보유 토큰</span>
            </div>
            <span className="text-xl font-bold text-yellow-400">{tokens}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
          {/* Assignment Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm mb-8"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="text-cyan-400" size={24} />
                  <span className="text-sm text-cyan-400 font-medium">Chapter 3 Mission</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Summarize Chapter 3
                </h1>
                <p className="text-gray-400">
                  Custom Hooks Best Practices를 학습하고 요약을 제출하세요
                </p>
              </div>
              <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-xl px-4 py-2">
                <span className="text-cyan-400 font-medium">+15 토큰</span>
              </div>
            </div>

            {/* Submission Options */}
            <div className="grid grid-cols-2 gap-6">
              {/* Quiz Option */}
              <button className="group bg-white/5 hover:bg-white/10 border border-white/20 hover:border-cyan-500/50 rounded-2xl p-6 transition-all text-left">
                <FileText className="text-blue-400 mb-4" size={32} />
                <h3 className="text-xl font-semibold text-white mb-2">Take Quiz</h3>
                <p className="text-sm text-gray-400 mb-4">
                  5개의 객관식 문제로 이해도를 확인하세요
                </p>
                <div className="text-sm text-blue-400 font-medium">
                  퀴즈 시작 →
                </div>
              </button>

              {/* OCR Option - Glowing */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="relative group bg-gradient-to-br from-cyan-950/50 to-blue-950/50 border-2 border-cyan-500/50 rounded-2xl p-6 transition-all text-left overflow-hidden"
              >
                {/* Glow Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-xl"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                
                <div className="relative z-10">
                  <Camera className="text-cyan-400 mb-4" size={40} />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Scan Handwriting Note
                  </h3>
                  <p className="text-sm text-gray-300 mb-4">
                    필기 노트를 촬영하면 OCR로 자동 분석합니다
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-cyan-400 font-medium">
                      📸 사진 업로드
                    </span>
                    <div className="bg-cyan-500/20 px-2 py-1 rounded-full text-xs text-cyan-300">
                      AI 분석
                    </div>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Live Arena Event - Between Chapter 3 and 4 */}
          {selectedChapter === 2 && (
            <LiveArenaEvent 
              onRegisterDebater={onStartArena}
              onJoinAudience={onStartArena}
            />
          )}

          {/* AI Feedback Report */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-purple-400" size={28} />
                <h2 className="text-2xl font-bold text-white">AI Feedback Report</h2>
              </div>
              <span className="text-sm text-gray-400">Last updated: 2 days ago</span>
            </div>

            {/* Logic Score Charts */}
            <div className="grid grid-cols-3 gap-6">
              {/* Understanding Score */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm text-gray-400 mb-4">이해도</h3>
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
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.85)}`}
                      className="text-cyan-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">85%</span>
                  </div>
                </div>
                <p className="text-xs text-center text-gray-400">Great job!</p>
              </div>

              {/* Participation Score */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm text-gray-400 mb-4">참여도</h3>
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
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.72)}`}
                      className="text-green-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">72%</span>
                  </div>
                </div>
                <p className="text-xs text-center text-gray-400">Keep it up!</p>
              </div>

              {/* Logic Score */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm text-gray-400 mb-4">논리력</h3>
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
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.68)}`}
                      className="text-purple-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">68%</span>
                  </div>
                </div>
                <p className="text-xs text-center text-gray-400">Room to grow</p>
              </div>
            </div>

            {/* AI Comments */}
            <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
              <h4 className="text-sm font-semibold text-white mb-2">AI 코멘트</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Custom Hooks의 핵심 개념을 잘 이해하고 있습니다. 특히 useEffect와의 차이점을 명확하게 설명했습니다. 
                다만 실제 사용 사례에 대한 논의가 부족했으니 다음 세미나에서 더 깊이 있는 토론을 추천합니다.
              </p>
            </div>
          </motion.div>

          {/* AI Seminar Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartDebate}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl p-6 transition-all shadow-2xl shadow-cyan-500/20 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <div className="relative z-10 flex items-center justify-center gap-4">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Waves size={32} />
              </motion.div>
              <div className="text-left">
                <h3 className="text-2xl font-bold mb-1">🌊 Yeoul AI 세미나 참여</h3>
                <p className="text-sm text-cyan-100">제임스🔥와 린다🍀와 함께 실시간 3자 토론을 시작하세요</p>
              </div>
            </div>
          </motion.button>

          {/* Live Arena Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartArena}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl p-6 transition-all shadow-2xl shadow-cyan-500/20 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <div className="relative z-10 flex items-center justify-center gap-4">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Waves size={32} />
              </motion.div>
              <div className="text-left">
                <h3 className="text-2xl font-bold mb-1">🌊 Yeoul Live Arena 참여</h3>
                <p className="text-sm text-cyan-100">실시간 대화형 토론을 시작하세요</p>
              </div>
            </div>
          </motion.button>
        </div>
      </main>
    </div>
  );
}