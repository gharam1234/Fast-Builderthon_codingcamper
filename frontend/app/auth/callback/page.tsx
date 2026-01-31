'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL의 해시에서 토큰을 자동으로 처리
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setError(error.message)
          setTimeout(() => router.push('/'), 1500)
          return
        }

        if (session?.user) {
          console.log('로그인 성공:', session.user.email)
          // 즉시 리다이렉트
          router.push('/')
        } else {
          console.log('세션 없음')
          router.push('/')
        }
      } catch (err) {
        console.error('Callback error:', err)
        setError(err instanceof Error ? err.message : '알 수 없는 오류')
        setTimeout(() => router.push('/'), 1500)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-red-400 mb-4">{error}</p>
            <p className="text-white text-sm">홈으로 이동 중...</p>
          </>
        ) : (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
            <p className="text-white">로그인 중입니다...</p>
          </>
        )}
      </div>
    </div>
  )
}
