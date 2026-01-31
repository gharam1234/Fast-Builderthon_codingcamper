'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Lecture } from '@/data/mockData'
import { TokenRewardPopup } from './TokenRewardPopup'

interface AppContextType {
  isLoggedIn: boolean
  tokens: number
  selectedLecture: Lecture | null
  selectedCategory: string
  login: () => void
  logout: () => void
  setSelectedLecture: (lecture: Lecture | null) => void
  setSelectedCategory: (category: string) => void
  earnTokens: (amount: number, message: string) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [tokens, setTokens] = useState(120)
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showReward, setShowReward] = useState(false)
  const [rewardAmount, setRewardAmount] = useState(0)
  const [rewardMessage, setRewardMessage] = useState('')

  const login = useCallback(() => setIsLoggedIn(true), [])
  const logout = useCallback(() => setIsLoggedIn(false), [])

  const earnTokens = useCallback((amount: number, message: string) => {
    setTokens(prev => prev + amount)
    setRewardAmount(amount)
    setRewardMessage(message)
    setShowReward(true)
    setTimeout(() => {
      setShowReward(false)
    }, 3000)
  }, [])

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        tokens,
        selectedLecture,
        selectedCategory,
        login,
        logout,
        setSelectedLecture,
        setSelectedCategory,
        earnTokens,
      }}
    >
      <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        {children}
        <TokenRewardPopup
          show={showReward}
          amount={rewardAmount}
          message={rewardMessage}
        />
      </div>
    </AppContext.Provider>
  )
}
