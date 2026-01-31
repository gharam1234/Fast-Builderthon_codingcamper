'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useApp } from '@/components/providers'

// 동적 로드로 SSR 문제 해결
const CourseDashboard = dynamic(
  () => import('@/components/CourseDashboard').then((mod) => mod.CourseDashboard),
  { ssr: false }
)

export default function DashboardContent() {
  const router = useRouter()
  const { selectedLecture, tokens } = useApp()

  useEffect(() => {
    if (!selectedLecture) {
      router.push('/')
    }
  }, [selectedLecture, router])

  if (!selectedLecture) {
    return null
  }

  return (
    <CourseDashboard
      lecture={selectedLecture}
      tokens={tokens}
      onStartDebate={() => router.push('/debate')}
      onStartArena={() => router.push(`/arena/strategy?lecture=${selectedLecture.id}`)}
      onBack={() => router.push('/lectures')}
    />
  )
}
