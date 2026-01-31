'use client'

import { useRouter } from 'next/navigation'
import { HomePage } from '@/components/HomePage'
import { useApp } from '@/components/providers'

export default function Home() {
  const router = useRouter()
  const { isLoggedIn, login, setSelectedCategory } = useApp()

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    router.push(`/lectures?category=${categoryId}`)
  }

  return (
    <HomePage
      isLoggedIn={isLoggedIn}
      onLogin={login}
      onCategoryClick={handleCategoryClick}
    />
  )
}
