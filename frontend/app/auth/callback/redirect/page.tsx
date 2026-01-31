'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * 로그인 후 저장된 URL로 리다이렉트하는 클라이언트 페이지
 * localStorage에 저장된 auth_return_url을 확인하고 해당 페이지로 이동
 */
export default function AuthRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // localStorage에서 저장된 URL 확인
    const returnUrl = localStorage.getItem('auth_return_url')
    
    // 저장된 URL 삭제 (일회용)
    localStorage.removeItem('auth_return_url')
    
    // 저장된 URL이 있으면 해당 페이지로, 없으면 홈으로 이동
    if (returnUrl && returnUrl !== '/auth/callback' && !returnUrl.includes('/auth/')) {
      router.replace(returnUrl)
    } else {
      router.replace('/')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">로그인 완료, 이전 페이지로 이동 중...</p>
      </div>
    </div>
  )
}
