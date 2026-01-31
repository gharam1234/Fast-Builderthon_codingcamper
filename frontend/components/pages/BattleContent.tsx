'use client'

import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useApp } from '@/components/providers'

// 동적 로드로 SSR 문제 해결
const BattleArena = dynamic(
  () => import('@/components/BattleArena').then((mod) => mod.BattleArena),
  { ssr: false }
)

export default function BattleContent() {
  const router = useRouter()
  const { earnTokens } = useApp()

  const handleComplete = () => {
    earnTokens(50, '라이브 배틀 승리!')
    router.push('/arena/victory')
  }

  return (
    <BattleArena
      onComplete={handleComplete}
    />
  )
}
