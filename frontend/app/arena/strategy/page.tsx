'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { StrategyRoom } from '@/components/StrategyRoom'
import { createLiveBattleRoom } from '@/lib/supabase'

function StrategyPageContent() {
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
    await createLiveBattleRoom('라이브 토론 배틀', roomId)

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

export default function StrategyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-white">로딩 중...</div>
      </div>
    }>
      <StrategyPageContent />
    </Suspense>
  )
}
