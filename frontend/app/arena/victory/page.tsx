'use client'

import { useRouter } from 'next/navigation'
import { VictoryScreen } from '@/components/VictoryScreen'

export default function VictoryPage() {
  const router = useRouter()

  return (
    <VictoryScreen
      onClose={() => router.push('/dashboard')}
    />
  )
}
