'use client'

import { useRouter } from 'next/navigation'
import { StrategyRoom } from '@/components/StrategyRoom'

export default function StrategyPage() {
  const router = useRouter()

  return (
    <StrategyRoom
      onComplete={() => router.push('/arena/battle')}
    />
  )
}
