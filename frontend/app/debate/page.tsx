'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainChatUI } from '@/components/MainChatUI'
import { useApp } from '@/components/providers'

export default function DebatePage() {
  const router = useRouter()
  const { selectedLecture, tokens, earnTokens } = useApp()

  useEffect(() => {
    if (!selectedLecture) {
      router.push('/')
    }
  }, [selectedLecture, router])

  if (!selectedLecture) {
    return null
  }

  return (
    <MainChatUI
      lecture={selectedLecture}
      tokens={tokens}
      onEarnTokens={earnTokens}
      onBack={() => router.push('/dashboard')}
    />
  )
}
