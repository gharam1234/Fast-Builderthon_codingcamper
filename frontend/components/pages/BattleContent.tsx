'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useApp } from '@/components/providers'
import { endLiveBattleRoom, getLiveBattleRoom } from '@/lib/supabase'

// 동적 로드로 SSR 문제 해결
const BattleArena = dynamic(
  () => import('@/components/BattleArena').then((mod) => mod.BattleArena),
  { ssr: false }
)

export default function BattleContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { earnTokens } = useApp()
  const [roomId, setRoomId] = useState<string>('')
  const [initialSeconds, setInitialSeconds] = useState(3000)
  const hasCompletedRef = useRef(false)

  useEffect(() => {
    const queryRoomId = searchParams.get('room')
    if (queryRoomId) {
      setRoomId(queryRoomId)
      return
    }

    if (typeof window === 'undefined') return
    const stored = window.sessionStorage.getItem('arena-room-id')
    const newRoomId = stored || `arena-${crypto.randomUUID()}`
    window.sessionStorage.setItem('arena-room-id', newRoomId)
    setRoomId(newRoomId)
    router.replace(`/arena/battle?room=${newRoomId}`)
  }, [router, searchParams])

  useEffect(() => {
    let isMounted = true
    const fetchRoom = async () => {
      if (!roomId) return
      const room = await getLiveBattleRoom(roomId)
      if (!room || !isMounted) return

      if (room.ends_at) {
        const remaining = Math.max(
          0,
          Math.ceil((new Date(room.ends_at).getTime() - Date.now()) / 1000)
        )
        setInitialSeconds(remaining)
        return
      }

      setInitialSeconds(room.duration_seconds ?? 3000)
    }

    fetchRoom()
    return () => {
      isMounted = false
    }
  }, [roomId])

  const handleComplete = useCallback(() => {
    if (hasCompletedRef.current) return
    hasCompletedRef.current = true
    earnTokens(50, '라이브 배틀 승리!')
    if (roomId) {
      void endLiveBattleRoom(roomId)
    }
    router.push('/arena/audience')
  }, [earnTokens, roomId, router])

  useEffect(() => {
    if (initialSeconds <= 0) {
      handleComplete()
    }
  }, [handleComplete, initialSeconds])

  return (
    <BattleArena
      onComplete={handleComplete}
      roomId={roomId}
      initialSeconds={initialSeconds}
      onBack={() => router.back()}
    />
  )
}
