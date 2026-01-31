// Edge Function: add-tokens
// 토큰 적립 함수

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AddTokensRequest {
  user_id: string
  session_id?: string
  amount: number
  reason: 'debate_participation' | 'good_argument' | 'streak_bonus' | 'daily_bonus' | 'achievement' | 'other'
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Supabase 클라이언트 생성
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 요청 본문 파싱
    const { user_id, session_id, amount, reason }: AddTokensRequest = await req.json()

    // 유효성 검사
    if (!user_id || !amount || !reason) {
      return new Response(
        JSON.stringify({ error: 'user_id, amount, reason은 필수입니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'amount는 양수여야 합니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 토큰 트랜잭션 생성
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('token_transactions')
      .insert({
        user_id,
        session_id,
        amount,
        reason,
      })
      .select()
      .single()

    if (transactionError) {
      throw transactionError
    }

    // 세션의 토큰 적립량 업데이트 (세션이 있는 경우)
    if (session_id) {
      const { error: sessionError } = await supabaseClient
        .from('debate_sessions')
        .update({ 
          tokens_earned: supabaseClient.rpc('increment_tokens_earned', { 
            session_id, 
            token_amount: amount 
          })
        })
        .eq('id', session_id)

      if (sessionError) {
        console.error('세션 토큰 업데이트 실패:', sessionError)
      }
    }

    // 업데이트된 사용자 토큰 조회
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('total_tokens')
      .eq('id', user_id)
      .single()

    if (profileError) {
      throw profileError
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction,
        total_tokens: profile.total_tokens,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('토큰 적립 오류:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
