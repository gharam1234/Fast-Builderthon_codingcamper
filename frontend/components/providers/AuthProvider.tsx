'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, signInWithGoogle as supabaseSignInWithGoogle, signOut as supabaseSignOut, upsertProfile } from '@/lib/supabase'

interface SignUpCredentials {
  email: string
  password: string
  userData: {
    username: string
    phone: string
  }
}

interface AuthContextType {
  isLoggedIn: boolean
  user: User | null
  session: Session | null
  isLoading: boolean
  login: () => void
  logout: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signUp: (credentials: SignUpCredentials) => Promise<void>
  loginWithGoogle: () => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  sendPasswordResetEmail: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 프로필 동기화
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

  // 세션 상태 초기화 및 변경 감지
  useEffect(() => {
    // 초기 세션 확인
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          setIsLoggedIn(true)
          // 프로필 동기화는 백그라운드에서
          void syncProfile(currentSession.user)
        }
      } catch (error) {
        console.error('세션 초기화 오류:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.email)
        
        if (newSession) {
          setSession(newSession)
          setUser(newSession.user)
          setIsLoggedIn(true)
          // 프로필 동기화
          void syncProfile(newSession.user)
        } else {
          setSession(null)
          setUser(null)
          setIsLoggedIn(false)
        }
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 간단한 로그인 (데모용, 실제로는 사용하지 않음)
  const login = useCallback(() => setIsLoggedIn(true), [])

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      await supabaseSignOut()
      setSession(null)
      setUser(null)
      setIsLoggedIn(false)
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }, [])

  // 이메일/비밀번호 로그인
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        return { error }
      }
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }, [])

  // 이메일/비밀번호 회원가입
  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        return { error }
      }
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }, [])

  // Google 로그인
  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabaseSignInWithGoogle()
      if (error) {
        return { error }
      }
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }, [])

  // Compatibility: signUp with user data
  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    const { email, password, userData } = credentials
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          username: userData.username,
          phone: userData.phone,
        },
      },
    })
    if (error) {
      throw new Error(error.message)
    }
    if (!data.user) {
      throw new Error('회원가입 실패')
    }
  }, [])

  // Compatibility: loginWithGoogle
  const loginWithGoogle = useCallback(async () => {
    // 로그인 후 돌아갈 URL을 localStorage에 저장
    const currentUrl = window.location.pathname + window.location.search
    localStorage.setItem('auth_return_url', currentUrl)
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }, [])

  // Compatibility: signInWithPassword
  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      throw new Error(error.message)
    }
  }, [])

  // 비밀번호 재설정 이메일 전송
  const sendPasswordResetEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    if (error) {
      throw new Error(error.message)
    }
  }, [])

  // 비밀번호 업데이트
  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      throw new Error(error.message)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user, 
      session, 
      isLoading,
      login, 
      logout,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signUp,
      loginWithGoogle,
      signInWithPassword,
      sendPasswordResetEmail,
      updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
