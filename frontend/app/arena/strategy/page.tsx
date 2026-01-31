'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StrategyRoom } from '@/components/StrategyRoom'
import { createLiveBattleRoom } from '@/lib/supabase'

export default function StrategyPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const getRoomId = () => {
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

    const room = await createLiveBattleRoom('라이브 토론 배틀')
    const roomId = room?.id || getRoomId()

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
