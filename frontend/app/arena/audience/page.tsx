'use client'

import { useRouter } from 'next/navigation'
import { AudienceLobby } from '@/components/AudienceLobby'

export default function AudiencePage() {
  const router = useRouter()

  const getRoomId = () => {
    if (typeof window === 'undefined') return ''
    const stored = window.sessionStorage.getItem('arena-room-id')
    if (stored) return stored
    const newRoomId = `arena-${crypto.randomUUID()}`
    window.sessionStorage.setItem('arena-room-id', newRoomId)
    return newRoomId
  }

  return (
    <AudienceLobby
      onSelectRoom={(roomId) => router.push(`/arena/battle?room=${roomId || getRoomId()}`)}
    />
  )
}
