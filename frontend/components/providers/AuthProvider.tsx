'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, signInWithGoogle as supabaseSignInWithGoogle, signOut as supabaseSignOut } from '@/lib/supabase'

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
    }}>
      {children}
    </AuthContext.Provider>
  )
}