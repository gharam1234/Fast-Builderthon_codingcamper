// Edge Function: get-leaderboard
// 랭킹 조회 함수

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  avatar_url: string | null
  total_tokens: number
  debate_count: number
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // URL 파라미터 파싱
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const period = url.searchParams.get('period') || 'all' // all, weekly, monthly

    // Supabase 클라이언트 생성
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // 기간 필터 설정
    let dateFilter = null
    const now = new Date()
    
    if (period === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter = weekAgo.toISOString()
    } else if (period === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      dateFilter = monthAgo.toISOString()
    }

    let query

    if (dateFilter) {
      // 기간별 랭킹: token_transactions에서 집계
      const { data: leaderboard, error } = await supabaseClient
        .rpc('get_leaderboard_by_period', {
          start_date: dateFilter,
          result_limit: limit,
          result_offset: offset
        })

      if (error) throw error

      return new Response(
        JSON.stringify({
          success: true,
          period,
          leaderboard: leaderboard || [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // 전체 랭킹: profiles 테이블에서 직접 조회
      const { data: profiles, error } = await supabaseClient
        .from('profiles')
        .select(`
          id,
          username,
          avatar_url,
          total_tokens
        `)
        .order('total_tokens', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      // 토론 횟수 조회
      const userIds = profiles?.map(p => p.id) || []
      
      const { data: debateCounts, error: debateError } = await supabaseClient
        .from('debate_sessions')
        .select('user_id')
        .in('user_id', userIds)
        .eq('status', 'completed')

      if (debateError) throw debateError

      // 사용자별 토론 횟수 집계
      const debateCountMap: Record<string, number> = {}
      debateCounts?.forEach(d => {
        debateCountMap[d.user_id] = (debateCountMap[d.user_id] || 0) + 1
      })

      // 랭킹 데이터 구성
      const leaderboard: LeaderboardEntry[] = (profiles || []).map((profile, index) => ({
        rank: offset + index + 1,
        user_id: profile.id,
        username: profile.username || 'Anonymous',
        avatar_url: profile.avatar_url,
        total_tokens: profile.total_tokens,
        debate_count: debateCountMap[profile.id] || 0,
      }))

      return new Response(
        JSON.stringify({
          success: true,
          period: 'all',
          leaderboard,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('랭킹 조회 오류:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
