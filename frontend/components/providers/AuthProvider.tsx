'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, upsertProfile } from '@/lib/supabase'

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loginWithGoogle: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface SignUpCredentials {
  email: string;
  password: string;
  userData: {
    username: string;
    phone: string;
  };
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const syncProfile = async (authUser: User) => {
    const metadata = authUser.user_metadata as Record<string, unknown> | undefined
    const username =
      (metadata?.username as string | undefined) ||
      (metadata?.full_name as string | undefined) ||
      (metadata?.name as string | undefined) ||
      authUser.email?.split('@')[0] ||
      null

    const avatarUrl =
      (metadata?.avatar_url as string | undefined) ||
      (metadata?.picture as string | undefined) ||
      null

    await upsertProfile({
      id: authUser.id,
      username,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
  }

  useEffect(() => {
    // 1. 초기 세션 확인 (빠르게)
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
      
      // 프로필 동기화는 백그라운드에서 (비차단)
      if (session?.user) {
        void syncProfile(session.user)
      }
    }
    checkUser()

    // 2. 실시간 로그인 상태 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        void syncProfile(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      throw new Error(error.message)
    }
  }

  const signUp = async (credentials: SignUpCredentials) => {
    const { email, password, userData } = credentials

    // 1. Supabase Auth에 회원가입
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: userData.username,
          phone: userData.phone,
        },
      },
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('회원가입 실패')
    }

    await upsertProfile({
      id: authData.user.id,
      username: userData.username,
      avatar_url: null,
      updated_at: new Date().toISOString(),
    })
  }

  const sendPasswordResetEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    if (error) {
      throw new Error(error.message)
    }
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      throw new Error(error.message)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        loginWithGoogle,
        signInWithPassword,
        signUp,
        sendPasswordResetEmail,
        updatePassword,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}
