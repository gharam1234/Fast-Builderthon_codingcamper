import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error.message)
      return NextResponse.redirect(`${origin}/?error=auth_error`)
    }
  }

  // 로그인 성공 후 저장된 URL 또는 홈으로 리다이렉트
  // 클라이언트 사이드에서 localStorage를 확인하기 위한 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/auth/callback/redirect`)
}
