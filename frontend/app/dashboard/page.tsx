'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CourseDashboard } from '@/components/CourseDashboard'
import { useApp } from '@/components/providers'

export default function DashboardPage() {
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
      onStartArena={() => router.push('/arena/strategy')}
      onBack={() => router.push('/lectures')}
    />
  )
}
