'use client'

import { useRouter } from 'next/navigation'
import { AudienceLobby } from '@/components/AudienceLobby'

export default function AudiencePage() {
  const router = useRouter()

  return (
    <AudienceLobby
      onSelectTeam={() => router.push('/arena/battle')}
    />
  )
}
