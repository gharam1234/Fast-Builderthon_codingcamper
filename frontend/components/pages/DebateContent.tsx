'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useApp } from '@/components/providers'

// 동적 로드로 SSR 문제 해결
const MainChatUI = dynamic(
  () => import('@/components/MainChatUI').then((mod) => mod.MainChatUI),
  { ssr: false }
)

export default function DebateContent() {
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
