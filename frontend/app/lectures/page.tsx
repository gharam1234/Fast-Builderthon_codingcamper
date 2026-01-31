'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LectureListPage } from '@/components/LectureListPage'
import { useApp } from '@/components/providers'
import { Lecture } from '@/data/mockData'

function LecturesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setSelectedLecture } = useApp()

  const category = searchParams.get('category') || 'all'

  const handleLectureClick = (lecture: Lecture) => {
    setSelectedLecture(lecture)
    router.push('/dashboard')
  }

  const handleBack = () => {
    router.push('/')
  }

  return (
    <LectureListPage
      category={category}
      onLectureClick={handleLectureClick}
      onBack={handleBack}
    />
  )
}

export default function LecturesPage() {
  return (
    <Suspense>
      <LecturesContent />
    </Suspense>
  )
}
