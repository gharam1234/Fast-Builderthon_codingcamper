'use client'

import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// 동적 로드로 SSR 문제 해결
const VictoryScreen = dynamic(
  () => import('@/components/VictoryScreen').then((mod) => mod.VictoryScreen),
  { ssr: false }
)

export default function VictoryPage() {
  const router = useRouter()

  return (
    <VictoryScreen
      onClose={() => router.push('/dashboard')}
    />
  )
}
