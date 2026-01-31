'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { TokenRewardPopup } from '../TokenRewardPopup'
import { getCurrentProfile, addTokens as addTokensToDb } from '@/lib/supabase'

interface TokenContextType {
  tokens: number
  earnTokens: (amount: number, message: string) => void
}

const TokenContext = createContext<TokenContextType | null>(null)

export function useToken() {
  const context = useContext(TokenContext)
  if (!context) {
    throw new Error('useToken must be used within a TokenProvider')
  }
  return context
}

export function TokenProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState(0)

  // DB에서 토큰 동기화
  useEffect(() => {
    const syncTokens = async () => {
      const profile = await getCurrentProfile()
      if (profile) {
        setTokens(profile.total_tokens)
      }
    }
    syncTokens()
  }, [])
  const [showReward, setShowReward] = useState(false)
  const [rewardAmount, setRewardAmount] = useState(0)
  const [rewardMessage, setRewardMessage] = useState('')

  const earnTokens = useCallback(async (amount: number, message: string) => {
    // DB에 토큰 저장
    const result = await addTokensToDb(amount, 'debate_participation')
    if (result.success && result.total_tokens !== undefined) {
      setTokens(result.total_tokens)
    } else {
      // DB 저장 실패해도 로컬에서는 증가
      setTokens(prev => prev + amount)
    }
    setRewardAmount(amount)
    setRewardMessage(message)
    setShowReward(true)
    setTimeout(() => {
      setShowReward(false)
    }, 3000)
  }, [])

  return (
    <TokenContext.Provider value={{ tokens, earnTokens }}>
      {children}
      <TokenRewardPopup
        show={showReward}
        amount={rewardAmount}
        message={rewardMessage}
      />
    </TokenContext.Provider>
  )
}
