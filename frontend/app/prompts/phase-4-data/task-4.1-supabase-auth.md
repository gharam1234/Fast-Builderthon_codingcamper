# Task 4.1: Supabase Auth 연동

## 📋 현재 상태 (2026-01-31)

### ✅ 완료된 항목
- ✅ task-1.3: Supabase 데이터베이스 스키마 설계
- ✅ useAuth Hook: 로컬스토리지 기반 임시 구현
- ✅ types/index.ts: UserProfile 타입 정의

### 🔄 진행 중인 항목
- 🔄 **Phase 4: Supabase 인증** (이 파일)
  - 이메일/비밀번호 인증
  - Google OAuth (선택)
  - 프로필 자동 생성

---

## 🎯 목표

**Supabase Auth 연동**: 사용자 인증 + 프로필 자동 생성

---

## 📝 구현 가이드

### 1. Supabase 클라이언트 설정

```typescript
// lib/supabase.ts

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// 클라이언트 컴포넌트용 (CSR)
export const supabase = createClientComponentClient();

// 서버 컴포넌트용 (SSR)
export const createServerClient = () => {
  return createServerComponentClient({ cookies });
};
```

### 2. AuthProvider 컨텍스트

```typescript
// components/providers/AuthProvider.tsx

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  User,
  Session,
  AuthChangeEvent,
} from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;

  // 인증 메서드
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    nickname: string,
    interest?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] =
    useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 초기 세션 로드
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        setSession(data.session);
        setUser(data.session?.user ?? null);

        // 사용자 프로필 로드
        if (data.session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          setUserProfile(profileData || null);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 인증 상태 변경 리스너
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (
        event: AuthChangeEvent,
        session: Session | null
      ) => {
        setSession(session);
        setUser(session?.user ?? null);

        // 프로필 업데이트
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUserProfile(profileData || null);
        } else {
          setUserProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (
    email: string,
    password: string
  ): Promise<void> => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      throw err;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    nickname: string,
    interest?: string
  ): Promise<void> => {
    try {
      setError(null);

      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname,
            interest,
          },
        },
      });

      if (error) throw error;

      // 프로필은 Database Trigger에 의해 자동 생성됨
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Sign up failed';
      setError(message);
      throw err;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setUser(null);
      setUserProfile(null);
      setSession(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
      throw err;
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'OAuth sign in failed';
      setError(message);
      throw err;
    }
  };

  const updateProfile = async (
    updates: Partial<UserProfile>
  ): Promise<void> => {
    try {
      setError(null);

      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setUserProfile((prev) =>
        prev ? { ...prev, ...updates } : null
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Update failed';
      setError(message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        session,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 3. 로그인 모달 컴포넌트

```typescript
// components/auth/LoginModal.tsx

'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { X, Loader2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [interest, setInterest] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, nickname, interest);
      } else {
        await signIn(email, password);
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Authentication failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center
      justify-center">
      <div className="bg-yeoul-navy rounded-2xl p-8 max-w-md w-full
        shadow-xl">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isSignUp ? '회원가입' : '로그인'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg
              bg-white/10 border border-white/20
              text-white placeholder:text-white/50"
            required
          />

          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg
              bg-white/10 border border-white/20
              text-white placeholder:text-white/50"
            required
          />

          {isSignUp && (
            <>
              <input
                type="text"
                placeholder="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2 rounded-lg
                  bg-white/10 border border-white/20
                  text-white placeholder:text-white/50"
                required
              />

              <input
                type="text"
                placeholder="관심사 (예: React, Python)"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="w-full px-4 py-2 rounded-lg
                  bg-white/10 border border-white/20
                  text-white placeholder:text-white/50"
              />
            </>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20
              border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-cyan-500 text-white
              rounded-lg font-semibold hover:bg-cyan-600
              transition-all disabled:opacity-50
              flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSignUp ? '회원가입' : '로그인'}
          </button>
        </form>

        {/* Google OAuth */}
        <button
          onClick={() => signInWithGoogle()}
          className="w-full mt-4 py-2 bg-white/10
            border border-white/20 text-white
            rounded-lg hover:bg-white/20 transition-all"
        >
          Google로 계속하기
        </button>

        {/* 토글 */}
        <p className="text-center text-white/60 text-sm mt-4">
          {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-cyan-400 hover:underline ml-1"
          >
            {isSignUp ? '로그인' : '회원가입'}
          </button>
        </p>
      </div>
    </div>
  );
}
```

### 4. 환경변수 설정

```env
# .env.local

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_API_URL=https://backend.replit.app
```

---

## 🔐 Supabase 설정

### 1. 프로젝트 생성
- [supabase.com](https://supabase.com) 접속
- "New Project" 생성
- Database Password 설정

### 2. Authentication 활성화
- Authentication > Providers > Email 활성화
- Google OAuth 설정 (선택)

### 3. Database Trigger 실행
(task-1.3에서 정의한 handle_new_user 트리거 확인)

---

## ✅ 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] lib/supabase.ts 클라이언트 설정
- [ ] AuthProvider 컴포넌트 구현
- [ ] LoginModal 컴포넌트 구현
- [ ] 환경변수 설정
- [ ] 이메일 인증 테스트
- [ ] Google OAuth 테스트 (선택)
- [ ] 프로필 자동 생성 확인

---

## 📚 참고 문서

- `task-1.3-supabase-schema.md` - 데이터베이스 스키마
- `task-4.2-debate-history.md` - 토론 히스토리
- Supabase Auth 문서

---

**상태**: 🟡 Phase 4 진행 중 (인증)
**다음**: task-4.2 (토론 히스토리)
**최종 업데이트**: 2026-01-31
