'use client'

import { useRouter } from 'next/navigation'
import { BattleArena } from '@/components/BattleArena'
import { useApp } from '@/components/providers'

export default function BattlePage() {
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
