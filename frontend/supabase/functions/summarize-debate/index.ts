// Edge Function: summarize-debate
// 토론 종료 후 요약 생성 (NVIDIA NIM)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SummarizeRequest {
  session_id: string
}

type ChatMessage = {
  sender: string
  content: string
  created_at: string
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const nimApiKey = Deno.env.get('NIM_API_KEY') ?? ''
    const nimBaseUrl = (Deno.env.get('NIM_BASE_URL') ?? 'https://api.nim.nvidia.com').replace(/\/$/, '')
    const nimModel = Deno.env.get('NIM_MODEL') ?? 'meta/llama-3.1-8b-instruct'

    if (!nimApiKey) {
      return new Response(
        JSON.stringify({ error: 'NIM_API_KEY가 설정되지 않았습니다.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { session_id }: SummarizeRequest = await req.json()
    if (!session_id) {
      return new Response(
        JSON.stringify({ error: 'session_id는 필수입니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    const { data: session, error: sessionError } = await supabaseClient
      .from('debate_sessions')
      .select('id, topic, lecture_title, user_id')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: '세션을 찾을 수 없습니다.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: messages, error: messageError } = await supabaseClient
      .from('debate_messages')
      .select('sender, content, created_at')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })

    if (messageError) {
      throw messageError
    }

    const transcript = (messages || [])
      .map((msg: ChatMessage) => `${msg.sender}: ${msg.content}`)
      .join('\n')

    if (!transcript) {
      return new Response(
        JSON.stringify({ error: '요약할 메시지가 없습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const systemPrompt = [
      '너는 토론을 요약하는 AI다.',
      '출력은 한국어로 간결하고 구조화된 요약이어야 한다.',
      '형식: 핵심 주장(2~4줄), 근거/반박 요약(불릿), 결론/다음 액션(1줄).',
    ].join('\n')

    const userPrompt = [
      `토론 주제: ${session.topic ?? session.lecture_title ?? '자유 토론'}`,
      '토론 기록:',
      transcript,
    ].join('\n')

    const nimResponse = await fetch(`${nimBaseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${nimApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: nimModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    })

    if (!nimResponse.ok) {
      const errorText = await nimResponse.text()
      throw new Error(`NIM 요청 실패: ${nimResponse.status} ${errorText}`)
    }

    const nimJson = await nimResponse.json()
    const summary = nimJson?.choices?.[0]?.message?.content?.trim() || ''

    if (!summary) {
      throw new Error('NIM 응답에서 요약을 찾을 수 없습니다.')
    }

    await supabaseClient
      .from('debate_sessions')
      .update({
        summary,
        summary_created_at: new Date().toISOString(),
        summary_model: nimModel,
      })
      .eq('id', session_id)

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('토론 요약 오류:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
