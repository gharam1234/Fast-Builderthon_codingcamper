'use client'

import { ReactNode } from 'react'
import { AuthProvider, useAuth } from './providers/AuthProvider'
import { TokenProvider, useToken } from './providers/TokenProvider'
import { LectureProvider, useLecture } from './providers/LectureProvider'

// Re-export individual hooks for granular access
export { useAuth } from './providers/AuthProvider'
export { useToken } from './providers/TokenProvider'
export { useLecture } from './providers/LectureProvider'

// Composite hook for backward compatibility
export function useApp() {
  const { isLoggedIn, user, isLoading, login, logout, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()
  const { tokens, earnTokens } = useToken()
  const { selectedLecture, selectedCategory, setSelectedLecture, setSelectedCategory } = useLecture()

  return {
    isLoggedIn,
    user,
    isLoading,
    tokens,
    selectedLecture,
    selectedCategory,
    login,
    logout,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    setSelectedLecture,
    setSelectedCategory,
    earnTokens,
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LectureProvider>
        <TokenProvider>
          <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
            {children}
          </div>
        </TokenProvider>
      </LectureProvider>
    </AuthProvider>
  )
}
