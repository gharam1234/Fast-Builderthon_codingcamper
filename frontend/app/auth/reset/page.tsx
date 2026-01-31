'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const exchangeSession = async () => {
      const code = searchParams.get('code')
      if (!code) return
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        setStatus('error')
        setMessage('세션 확인에 실패했습니다. 다시 시도해주세요.')
      }
    }

    exchangeSession()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirmPassword) return
    if (password !== confirmPassword) {
      setStatus('error')
      setMessage('비밀번호가 일치하지 않습니다.')
      return
    }

    setStatus('loading')
    setMessage('')
    try {
      await updatePassword(password)
      setStatus('success')
      setMessage('비밀번호가 변경되었습니다. 로그인해주세요.')
      setTimeout(() => router.push('/'), 1500)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-bold text-white mb-2">비밀번호 재설정</h1>
        <p className="text-sm text-gray-400 mb-6">새 비밀번호를 입력해주세요.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">새 비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-800/50 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-gray-700/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-800/50 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-gray-700/50"
              required
            />
          </div>

          {message && (
            <div
              className={`text-sm rounded-lg px-3 py-2 ${
                status === 'error' ? 'bg-red-900/30 text-red-300' : 'bg-emerald-900/30 text-emerald-300'
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg py-3 transition-all disabled:opacity-60"
          >
            {status === 'loading' ? '처리 중...' : '비밀번호 변경'}
          </button>
        </form>
      </div>
    </div>
  )
}
