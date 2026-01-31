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

    // 사용자의 total_tokens 업데이트 (atomic increment)
    const { data: updatedProfile, error: updateError } = await supabaseClient
      .rpc('increment_user_tokens', {
        target_user_id: user_id,
        token_amount: amount,
      })

    if (updateError) {
      // RPC 함수가 없으면 직접 업데이트
      console.error('RPC 호출 실패, 직접 업데이트 시도:', updateError)
      
      const { error: directUpdateError } = await supabaseClient
        .from('profiles')
        .update({ 
          total_tokens: supabaseClient.sql`total_tokens + ${amount}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', user_id)
      
      if (directUpdateError) {
        // SQL 표현식이 안되면 수동으로
        const { data: currentProfile } = await supabaseClient
          .from('profiles')
          .select('total_tokens')
          .eq('id', user_id)
          .single()
        
        if (currentProfile) {
          await supabaseClient
            .from('profiles')
            .update({ 
              total_tokens: (currentProfile.total_tokens || 0) + amount,
              updated_at: new Date().toISOString()
            })
            .eq('id', user_id)
        }
      }
    }

    // 세션의 토큰 적립량 업데이트 (세션이 있는 경우)
    if (session_id) {
      // 먼저 현재 tokens_earned 조회
      const { data: sessionData } = await supabaseClient
        .from('debate_sessions')
        .select('tokens_earned')
        .eq('id', session_id)
        .single()

      if (sessionData) {
        await supabaseClient
          .from('debate_sessions')
          .update({ 
            tokens_earned: (sessionData.tokens_earned || 0) + amount
          })
          .eq('id', session_id)
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
