# Task 4.1: Supabase Auth 연동

## 목표
Supabase 인증을 Next.js에 연동

---

## 프롬프트

```
Supabase 인증을 Next.js에 연동해줘.

요구사항:
1. 인증 방식: 
   - 이메일/비밀번호
   - Google OAuth (선택)
   - Magic Link (선택)

2. 컴포넌트:
   - LoginModal.tsx (로그인 모달)
   - AuthProvider.tsx (Context Provider)
   
3. Custom Hook: useAuth()
   
   const {
     user,           // User | null
     loading,        // 로딩 상태
     signIn,         // (email, password) => Promise
     signUp,         // (email, password, username) => Promise
     signOut,        // () => Promise
     signInWithGoogle
   } = useAuth();

4. 미들웨어:
   - /lecture/* 경로는 인증 필요
   - 미인증 시 로그인 모달 표시

5. 프로필 자동 생성:
   - auth.users INSERT 시 profiles 테이블에 자동 생성 (Trigger)

6. 세션 유지:
   - Supabase Auth Helpers 사용
   - 쿠키 기반 세션
```

---

## Supabase 클라이언트 설정

```typescript
// lib/supabase.ts

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// 클라이언트 컴포넌트용
export const supabase = createClientComponentClient();

// 서버 컴포넌트용
export const createServerClient = () => {
  return createServerComponentClient({ cookies });
};
```

## Auth Provider

```tsx
// providers/AuthProvider.tsx

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 세션 초기화
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      signInWithGoogle
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

## 프로필 자동 생성 Trigger (SQL)

```sql
-- Supabase SQL Editor에서 실행

-- 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 로그인 모달 컴포넌트

```tsx
// components/auth/LoginModal.tsx

'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { X, Mail, Lock, User } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  
  const { signIn, signUp, signInWithGoogle } = useAuth();
  
  // ... 구현
}
```

## 예상 결과물

- `/lib/supabase.ts`
- `/providers/AuthProvider.tsx`
- `/components/auth/LoginModal.tsx`
- `/app/auth/callback/route.ts`
- SQL Trigger 스크립트

## 예상 시간
약 1시간
