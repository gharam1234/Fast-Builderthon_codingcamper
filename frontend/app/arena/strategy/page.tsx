'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { StrategyRoom } from '@/components/StrategyRoom'
import { createLiveBattleRoom } from '@/lib/supabase'

export default function StrategyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isCreating, setIsCreating] = useState(false)

  // 강의 ID 기반 roomId 생성
  const lectureId = searchParams.get('lecture')

  const getRoomId = () => {
    // 강의 ID가 있으면 강의 기반 roomId 사용
    if (lectureId) {
      return `lecture-${lectureId}-arena`
    }
    // 없으면 세션 기반 roomId (기존 로직)
    if (typeof window === 'undefined') return ''
    const stored = window.sessionStorage.getItem('arena-room-id')
    if (stored) return stored
    const newRoomId = `arena-${crypto.randomUUID()}`
    window.sessionStorage.setItem('arena-room-id', newRoomId)
    return newRoomId
  }

  const handleComplete = async () => {
    if (isCreating) return
    setIsCreating(true)

    const roomId = getRoomId()
    const room = await createLiveBattleRoom('라이브 토론 배틀', roomId)

    if (typeof window !== 'undefined' && roomId) {
      window.sessionStorage.setItem('arena-room-id', roomId)
    }

    router.push(`/arena/battle?room=${roomId}`)
    setIsCreating(false)
  }

  return (
    <StrategyRoom
      onComplete={handleComplete}
      onBack={() => router.back()}
    />
  )
}
