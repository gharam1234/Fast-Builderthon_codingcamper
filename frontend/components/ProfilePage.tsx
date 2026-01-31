'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Phone, LogOut, User, Zap, Camera } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'

interface ProfilePageProps {
  onBack: () => void
  onLogout: () => void
  onViewOCRHistory?: () => void
}

export function ProfilePage({ onBack, onLogout, onViewOCRHistory }: ProfilePageProps) {
  const { user } = useAuth()

  const handleLogout = async () => {
    await onLogout()
    onBack()
  }

  const userEmail = user?.email || '이메일 없음'
  const userPhone = user?.user_metadata?.phone || '미등록'
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || '사용자'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="text-cyan-400" size={24} />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-white">마이페이지</h1>
              <p className="text-xs text-cyan-400 mt-1">계정 정보 & 통계</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-8 py-12">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-cyan-500/30 rounded-2xl p-8 mb-8 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                <span className="text-4xl font-bold text-white">{username.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">{username}</h2>
                <div className="flex items-center gap-2">
                  <User className="text-cyan-400" size={16} />
                  <p className="text-cyan-400 font-medium">Yeoul 회원</p>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  {user?.created_at
                    ? `가입: ${new Date(user.created_at).toLocaleDateString('ko-KR')}`
                    : ''}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold py-2.5 px-5 rounded-lg border border-red-600/30 transition-all"
            >
              <LogOut size={18} />
              로그아웃
            </motion.button>
          </div>

          {/* User Info Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="text-cyan-400" size={20} />
                <p className="text-gray-400 text-sm">이메일</p>
              </div>
              <p className="text-white font-semibold text-lg break-all">{userEmail}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="text-cyan-400" size={20} />
                <p className="text-gray-400 text-sm">전화번호</p>
              </div>
              <p className="text-white font-semibold text-lg">{userPhone}</p>
            </div>
          </div>
        </motion.div>

        {/* Statistics Section */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-cyan-950/30 to-blue-950/30 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm font-medium">수강 중</p>
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <span className="text-cyan-400 text-lg">📚</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">3</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-950/30 to-emerald-950/30 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm font-medium">완강</p>
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <span className="text-green-400 text-lg">✅</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">12</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-950/30 to-amber-950/30 border border-yellow-500/30 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm font-medium">토큰</p>
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Zap className="text-yellow-400" size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-yellow-400">120</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-950/30 to-pink-950/30 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm font-medium">학습 시간</p>
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <span className="text-purple-400 text-lg">⏱️</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">42h</p>
          </motion.div>
        </div>

        {/* Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-slate-900 via-blue-950/50 to-slate-900 border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
        >
          <h3 className="text-xl font-bold text-white mb-6">최근 활동</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-white/10">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-cyan-400 text-lg">🎓</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">React 강의 수료</p>
                <p className="text-gray-400 text-sm">2일 전</p>
              </div>
              <p className="text-yellow-400 font-semibold">+50 토큰</p>
            </div>
            <div className="flex items-center gap-4 pb-4 border-b border-white/10">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 text-lg">💬</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">AI 토론 참가</p>
                <p className="text-gray-400 text-sm">5일 전</p>
              </div>
              <p className="text-yellow-400 font-semibold">+30 토큰</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-400 text-lg">🏆</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">토론 우승</p>
                <p className="text-gray-400 text-sm">1주 전</p>
              </div>
              <p className="text-yellow-400 font-semibold">+100 토큰</p>
            </div>
          </div>
        </motion.div>

        {/* OCR History Section */}
        {onViewOCRHistory && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={onViewOCRHistory}
            className="w-full mt-8 bg-gradient-to-r from-cyan-950/50 to-blue-950/50 border border-cyan-500/30 hover:border-cyan-500/50 rounded-2xl p-6 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Camera className="text-cyan-400 group-hover:scale-110 transition-transform" size={24} />
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">OCR 히스토리</h3>
                  <p className="text-sm text-gray-400">촬영한 필기 인식 기록 보기</p>
                </div>
              </div>
              <div className="text-cyan-400 font-bold">→</div>
            </div>
          </motion.button>
        )}
      </main>
    </div>
  )
}
