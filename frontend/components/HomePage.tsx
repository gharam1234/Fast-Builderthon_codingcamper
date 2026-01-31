import { useState } from 'react';
import { Search, User, Bell, Waves } from 'lucide-react';
import { motion } from 'framer-motion';
import { LoginModal } from './LoginModal';
import { categories } from '@/data/mockData';

interface HomePageProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onCategoryClick: (categoryId: string) => void;
}

export function HomePage({ isLoggedIn, onLogin, onCategoryClick }: HomePageProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Waves className="text-cyan-400" size={36} />
              <div>
                <h1 className="text-2xl font-bold text-white">Yeoul</h1>
                <p className="text-xs text-cyan-400">AI-Powered Learning Platform</p>
              </div>
            </div>
            
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="배우고 싶은 강의를 검색하세요..."
                  className="w-full bg-white/5 text-white placeholder-gray-400 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-white/10"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <button className="p-2 hover:bg-white/10 rounded-xl transition-colors relative">
                    <Bell className="text-gray-300" size={22} />
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <User className="text-gray-300" size={22} />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-cyan-500/20"
                >
                  로그인
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1762330918491-f4288a62adb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMGVkdWNhdGlvbiUyMGxhcHRvcHxlbnwxfHx8fDE3Njk3NDYzNjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Hero"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-6xl font-bold text-white mb-6">
              AI와 함께하는 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">새로운 학습</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              🌊 Yeoul AI 세미나로 비평가 제임스와 지지자 린다와 함께<br/>실시간 3자 토론을 경험하세요
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20 text-white">
                🔥 실시간 AI 토론
              </span>
              <span className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20 text-white">
                🍀 토큰 리워드 시스템
              </span>
              <span className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20 text-white">
                💬 음성/텍스트 입력
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-white mb-2">카테고리</h3>
          <p className="text-gray-400">관심 있는 분야를 선택하세요</p>
        </div>
        
        <div className="grid grid-cols-5 gap-6">
          {categories.slice(0, 10).map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onCategoryClick(category.id)}
              className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-2xl p-8 transition-all hover:scale-105 backdrop-blur-sm"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{category.icon}</div>
              <h4 className="font-semibold text-white text-lg">{category.name}</h4>
            </motion.button>
          ))}
        </div>

        {/* Stats */}
        {isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 bg-gradient-to-r from-cyan-950/30 to-blue-950/30 border border-cyan-500/30 rounded-2xl p-8 backdrop-blur-sm"
          >
            <h4 className="font-semibold text-cyan-400 mb-6 text-lg">학습 현황</h4>
            <div className="grid grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-5xl font-bold text-white mb-2">3</p>
                <p className="text-sm text-gray-400">수강 중</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-white mb-2">12</p>
                <p className="text-sm text-gray-400">완강</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-yellow-400 mb-2">120</p>
                <p className="text-sm text-gray-400">토큰</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-cyan-400 mb-2">42h</p>
                <p className="text-sm text-gray-400">학습 시간</p>
              </div>
            </div>
          </motion.div>
        )}
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLoginSuccess}
        />
      )}
    </div>
  );
}
