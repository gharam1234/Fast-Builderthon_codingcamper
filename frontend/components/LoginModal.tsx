'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Waves, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider'; // 👈 [추가] 로그인 기능 불러오기

interface LoginModalProps {
  onClose: () => void;
  onSwitchToSignUp?: () => void;
  // onLogin prop은 이제 AuthProvider가 처리하므로 필수는 아니지만, 
  // 로그인 성공 후 모달 닫기용으로 남겨둡니다.
  onLogin?: () => void; 
}

export function LoginModal({ onClose, onSwitchToSignUp, onLogin }: LoginModalProps) {
  const { loginWithGoogle, signInWithPassword } = useAuth(); // 👈 [추가] 훅 사용
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalMode, setModalMode] = useState<'login' | 'forgot-password' | 'forgot-email'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // ... (기존 state들 유지)
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');

  // 1. 이메일 로그인 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!email || !password) {
      setErrorMessage('이메일과 비밀번호를 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithPassword(email, password);
      onClose();
      if (onLogin) onLogin();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '로그인에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 구글 로그인 버튼 핸들러 (🔥 여기가 핵심!)
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // 로그인 성공 시 리다이렉트 되므로 추가 동작 불필요
    } catch (error) {
      console.error("Google Login Failed:", error);
      alert("로그인에 실패했습니다.");
    }
  };

  // ... (handleForgotPassword, handleForgotEmail 등 기존 로직 그대로 유지)
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryEmail) {
      setRecoveryMessage('✓ 비밀번호 재설정 링크를 이메일로 전송했습니다.');
      setTimeout(() => setModalMode('login'), 2000);
    }
  };

  const handleForgotEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryPhone) {
      setRecoveryMessage('✓ 계정 정보를 등록된 전화번호로 전송했습니다.');
      setTimeout(() => setModalMode('login'), 2000);
    }
  };

  const renderContent = () => {
    if (modalMode === 'forgot-password') {
        // ... (기존 코드 그대로)
        return (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => {
                setModalMode('login');
                setRecoveryMessage('');
              }}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronLeft className="text-gray-400" size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white">비밀번호 찾기</h2>
              <p className="text-sm text-gray-400 mt-1">등록한 이메일로 재설정 링크를 보내드립니다</p>
            </div>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full bg-gray-800/50 text-white placeholder-gray-500 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-gray-700/50"
                  required
                />
              </div>
            </div>
            {recoveryMessage && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-green-900/30 border border-green-700/50 rounded-lg text-green-400 text-sm">
                {recoveryMessage}
              </motion.div>
            )}
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg py-3 transition-all shadow-lg shadow-cyan-500/20">
              재설정 링크 전송
            </motion.button>
          </form>
        </div>
      );
    }

    if (modalMode === 'forgot-email') {
        // ... (기존 코드 그대로)
        return (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => {
                setModalMode('login');
                setRecoveryMessage('');
              }}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronLeft className="text-gray-400" size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white">이메일 찾기</h2>
              <p className="text-sm text-gray-400 mt-1">가입시 등록한 전화번호를 입력해주세요</p>
            </div>
          </div>

          <form onSubmit={handleForgotEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">전화번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="tel"
                  value={recoveryPhone}
                  onChange={(e) => setRecoveryPhone(e.target.value)}
                  placeholder="010-1234-5678"
                  className="w-full bg-gray-800/50 text-white placeholder-gray-500 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-gray-700/50"
                  required
                />
              </div>
            </div>
            {recoveryMessage && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-green-900/30 border border-green-700/50 rounded-lg text-green-400 text-sm">
                {recoveryMessage}
              </motion.div>
            )}
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg py-3 transition-all shadow-lg shadow-cyan-500/20">
              계정 정보 찾기
            </motion.button>
          </form>
        </div>
      );
    }

    // Default login mode
    return (
      <div>
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3">
            <Waves className="text-cyan-400" size={48} />
            <motion.div
              className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
          <h2 className="text-2xl font-bold text-white">로그인</h2>
          <p className="text-sm text-gray-400 mt-1">FastCampus에 오신 것을 환영합니다</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm">
              {errorMessage}
            </motion.div>
          )}
          {/* ... (이메일/비밀번호 입력창 UI 그대로 유지) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">이메일</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" className="w-full bg-gray-800/50 text-white placeholder-gray-500 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-gray-700/50" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-800/50 text-white placeholder-gray-500 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-gray-700/50" required />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-gray-900" />
              로그인 상태 유지
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setModalMode('forgot-email')} className="text-cyan-400 hover:text-cyan-300 transition-colors">이메일 찾기</button>
              <span className="text-gray-600">·</span>
              <button type="button" onClick={() => setModalMode('forgot-password')} className="text-cyan-400 hover:text-cyan-300 transition-colors">비밀번호 찾기</button>
            </div>
          </div>

          {/* 일반 로그인 버튼 (데모용) */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 transition-all shadow-lg shadow-cyan-500/20"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </motion.button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-gray-900 text-gray-400">또는</span>
            </div>
          </div>

          {/* 🔥 Google 로그인 버튼 */}
          <motion.button
            type="button"
            onClick={handleGoogleLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-3 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 로그인
          </motion.button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-gray-900 text-gray-400">계정이 없으신가요?</span>
            </div>
          </div>

          {/* 회원가입으로 계정 만들기 */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToSignUp?.();
            }}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-3 transition-colors font-medium"
          >
            회원가입
          </button>
        </form>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        >
          {modalMode === 'login' && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="text-gray-400" size={20} />
            </button>
          )}
          {renderContent()}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}