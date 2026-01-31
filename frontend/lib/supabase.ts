/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'

// =============================================
// Supabase 클라이언트 초기화
// =============================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL 또는 Anon Key가 설정되지 않았습니다.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// =============================================
// 데이터베이스 타입 정의 (Task 1.3 스키마 기반)
// =============================================
export type Database = {
  public: {
    Tables: {
      // 사용자 프로필 (auth.users 확장)
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          total_tokens: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          total_tokens?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          total_tokens?: number
          created_at?: string
          updated_at?: string
        }
      }
      // 토론 세션
      debate_sessions: {
        Row: {
          id: string
          user_id: string
          lecture_id: string
          lecture_title: string
          topic: string | null
          tokens_earned: number
          started_at: string
          ended_at: string | null
          status: 'active' | 'completed' | 'abandoned'
          summary: string | null
          summary_created_at: string | null
          summary_model: string | null
        }
        Insert: {
          id?: string
          user_id: string
          lecture_id: string
          lecture_title: string
          topic?: string | null
          tokens_earned?: number
          started_at?: string
          ended_at?: string | null
          status?: 'active' | 'completed' | 'abandoned'
          summary?: string | null
          summary_created_at?: string | null
          summary_model?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          lecture_id?: string
          lecture_title?: string
          topic?: string | null
          tokens_earned?: number
          started_at?: string
          ended_at?: string | null
          status?: 'active' | 'completed' | 'abandoned'
          summary?: string | null
          summary_created_at?: string | null
          summary_model?: string | null
        }
      }
      // 토론 메시지
      debate_messages: {
        Row: {
          id: string
          session_id: string
          sender: 'user' | 'james' | 'linda' | 'system'
          content: string
          audio_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          sender: 'user' | 'james' | 'linda' | 'system'
          content: string
          audio_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          sender?: 'user' | 'james' | 'linda' | 'system'
          content?: string
          audio_url?: string | null
          created_at?: string
        }
      }
      // 토큰 트랜잭션
      token_transactions: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          amount: number
          reason: 'debate_participation' | 'good_argument' | 'streak_bonus' | 'daily_bonus' | 'achievement' | 'other'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          amount: number
          reason: 'debate_participation' | 'good_argument' | 'streak_bonus' | 'daily_bonus' | 'achievement' | 'other'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string | null
          amount?: number
          reason?: 'debate_participation' | 'good_argument' | 'streak_bonus' | 'daily_bonus' | 'achievement' | 'other'
          created_at?: string
        }
      }
      // 라이브 채팅 메시지
      live_chat_messages: {
        Row: {
          id: string
          room_id: string
          user_id: string | null
          username: string | null
          text: string
          emoji: string | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id?: string | null
          username?: string | null
          text: string
          emoji?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string | null
          username?: string | null
          text?: string
          emoji?: string | null
          created_at?: string
        }
      }
      // 라이브 배틀 방
      live_battle_rooms: {
        Row: {
          id: string
          title: string
          status: 'live' | 'ended'
          created_by: string | null
          created_at: string
          updated_at: string
          duration_seconds: number | null
          ends_at: string | null
        }
        Insert: {
          id?: string
          title: string
          status?: 'live' | 'ended'
          created_by?: string | null
          created_at?: string
          updated_at?: string
          duration_seconds?: number | null
          ends_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          status?: 'live' | 'ended'
          created_by?: string | null
          created_at?: string
          updated_at?: string
          duration_seconds?: number | null
          ends_at?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      // 토큰 적립량 증가 함수
      increment_tokens_earned: {
        Args: { session_id: string; token_amount: number }
        Returns: number
      }
      // 기간별 랭킹 조회
      get_leaderboard_by_period: {
        Args: { start_date: string; result_limit?: number; result_offset?: number }
        Returns: {
          rank: number
          user_id: string
          username: string
          avatar_url: string | null
          total_tokens: number
          debate_count: number
        }[]
      }
      // 사용자 통계 조회
      get_user_stats: {
        Args: { target_user_id: string }
        Returns: {
          total_tokens: number
          total_debates: number
          completed_debates: number
          total_messages: number
          global_rank: number
        }[]
      }
      // 라이브 방 참여자 수 조회
      get_live_room_participants: {
        Args: { room_ids: string[]; since_minutes?: number }
        Returns: { room_id: string; participant_count: number }[]
      }
    }
    Enums: {
      debate_status: 'active' | 'completed' | 'abandoned'
      message_sender: 'user' | 'james' | 'linda' | 'system'
      token_reason: 'debate_participation' | 'good_argument' | 'streak_bonus' | 'daily_bonus' | 'achievement' | 'other'
    }
  }
}

// =============================================
// 테이블 타입 헬퍼
// =============================================
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type DebateSession = Database['public']['Tables']['debate_sessions']['Row']
export type DebateSessionInsert = Database['public']['Tables']['debate_sessions']['Insert']
export type DebateSessionUpdate = Database['public']['Tables']['debate_sessions']['Update']

export type DebateMessage = Database['public']['Tables']['debate_messages']['Row']
export type DebateMessageInsert = Database['public']['Tables']['debate_messages']['Insert']
export type DebateMessageUpdate = Database['public']['Tables']['debate_messages']['Update']

export type TokenTransaction = Database['public']['Tables']['token_transactions']['Row']
export type TokenTransactionInsert = Database['public']['Tables']['token_transactions']['Insert']
export type TokenTransactionUpdate = Database['public']['Tables']['token_transactions']['Update']

export type LiveChatMessage = Database['public']['Tables']['live_chat_messages']['Row']
export type LiveChatMessageInsert = Database['public']['Tables']['live_chat_messages']['Insert']

export type LiveBattleRoom = Database['public']['Tables']['live_battle_rooms']['Row']
export type LiveBattleRoomInsert = Database['public']['Tables']['live_battle_rooms']['Insert']

// =============================================
// 인증 헬퍼 함수
// =============================================

/**
 * 현재 로그인한 사용자 조회
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('사용자 조회 오류:', error)
    return null
  }
  return user
}

/**
 * 현재 사용자의 프로필 조회
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('프로필 조회 오류:', error)
    return null
  }
  return data
}

/**
 * 프로필 upsert (로그인/회원가입 시 동기화)
 */
export async function upsertProfile(profile: ProfileInsert): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    console.error('프로필 저장 오류:', error)
    return null
  }
  return data
}

/**
 * Google 로그인
 * @param returnUrl 로그인 후 돌아갈 URL (기본값: 현재 페이지)
 */
export async function signInWithGoogle(returnUrl?: string) {
  // 로그인 후 돌아갈 URL을 localStorage에 저장
  const currentUrl = returnUrl || window.location.pathname + window.location.search
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_return_url', currentUrl)
  }
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  return { data, error }
}

/**
 * 로그아웃
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// =============================================
// 토론 세션 헬퍼 함수
// =============================================

/**
 * 새 토론 세션 생성
 */
export async function createDebateSession(
  lectureId: string,
  lectureTitle: string,
  topic?: string
): Promise<DebateSession | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await (supabase as any)
    .from('debate_sessions')
    .insert({
      user_id: user.id,
      lecture_id: lectureId,
      lecture_title: lectureTitle,
      topic,
    })
    .select()
    .single()

  if (error) {
    console.error('토론 세션 생성 오류:', error)
    return null
  }
  return data
}

/**
 * 토론 세션 종료
 */
export async function completeDebateSession(
  sessionId: string,
  status: 'completed' | 'abandoned' = 'completed'
): Promise<DebateSession | null> {
  const { data, error } = await (supabase as any)
    .from('debate_sessions')
    .update({
      status,
      ended_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) {
    console.error('토론 세션 종료 오류:', error)
    return null
  }
  return data
}

/**
 * 사용자의 토론 세션 목록 조회
 */
export async function getUserDebateSessions(): Promise<DebateSession[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('debate_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })

  if (error) {
    console.error('토론 세션 목록 조회 오류:', error)
    return []
  }
  return data || []
}

// =============================================
// 토론 메시지 헬퍼 함수
// =============================================

/**
 * 토론 메시지 추가
 */
export async function addDebateMessage(
  sessionId: string,
  sender: 'user' | 'james' | 'linda' | 'system',
  content: string,
  audioUrl?: string
): Promise<DebateMessage | null> {
  const { data, error } = await (supabase as any)
    .from('debate_messages')
    .insert({
      session_id: sessionId,
      sender,
      content,
      audio_url: audioUrl,
    })
    .select()
    .single()

  if (error) {
    console.error('토론 메시지 추가 오류:', error)
    return null
  }
  return data
}

/**
 * 세션의 토론 메시지 목록 조회
 */
export async function getDebateMessages(sessionId: string): Promise<DebateMessage[]> {
  const { data, error } = await supabase
    .from('debate_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('토론 메시지 조회 오류:', error)
    return []
  }
  return data || []
}

// =============================================
// 토큰 헬퍼 함수
// =============================================

/**
 * 토큰 적립 (직접 DB 업데이트 - Edge Function 대체)
 */
export async function addTokens(
  amount: number,
  reason: TokenTransactionInsert['reason'],
  sessionId?: string
): Promise<{ success: boolean; total_tokens?: number; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }

  try {
    // 1. 토큰 트랜잭션 기록 저장
    const { error: transactionError } = await (supabase as any)
      .from('token_transactions')
      .insert({
        user_id: user.id,
        session_id: sessionId || null,
        amount,
        reason,
      })

    if (transactionError) {
      console.error('트랜잭션 저장 오류:', transactionError)
      // 트랜잭션 저장 실패해도 토큰은 적립 시도
    }

    // 2. 현재 프로필 조회
    const { data: currentProfile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('total_tokens')
      .eq('id', user.id)
      .single()

    if (profileFetchError) {
      console.error('프로필 조회 오류:', profileFetchError)
      return { success: false, error: '프로필 조회 실패' }
    }

    const currentTokens = currentProfile?.total_tokens || 0
    const newTotal = currentTokens + amount

    // 3. 토큰 업데이트
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        total_tokens: newTotal,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('토큰 업데이트 오류:', updateError)
      return { success: false, error: updateError.message }
    }

    // 4. 세션 토큰도 업데이트 (있는 경우)
    if (sessionId) {
      const { data: sessionData } = await supabase
        .from('debate_sessions')
        .select('tokens_earned')
        .eq('id', sessionId)
        .single()

      if (sessionData) {
        await (supabase as any)
          .from('debate_sessions')
          .update({ 
            tokens_earned: (sessionData.tokens_earned || 0) + amount 
          })
          .eq('id', sessionId)
      }
    }

    return { success: true, total_tokens: newTotal }

  } catch (error: any) {
    console.error('토큰 적립 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류' }
  }
}

/**
 * 사용자의 토큰 내역 조회
 */
export async function getTokenTransactions(): Promise<TokenTransaction[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('token_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('토큰 내역 조회 오류:', error)
    return []
  }
  return data || []
}

// =============================================
// 랭킹 헬퍼 함수
// =============================================

export type LeaderboardEntry = {
  rank: number
  user_id: string
  username: string
  avatar_url: string | null
  total_tokens: number
  debate_count: number
}

/**
 * 리더보드 조회 (Edge Function 호출)
 */
export async function getLeaderboard(
  limit = 10,
  offset = 0,
  period: 'all' | 'weekly' | 'monthly' = 'all'
): Promise<{ leaderboard: LeaderboardEntry[]; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: _data, error: _error } = await supabase.functions.invoke('get-leaderboard', {
    body: {},
    // Edge Function은 query params 사용
  })

  // 직접 호출 방식
  const response = await fetch(
    `${supabaseUrl}/functions/v1/get-leaderboard?limit=${limit}&offset=${offset}&period=${period}`,
    {
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    }
  )

  if (!response.ok) {
    return { leaderboard: [], error: '랭킹 조회 실패' }
  }

  const result = await response.json()
  return { leaderboard: result.leaderboard || [] }
}

/**
 * 사용자 통계 조회
 */
export async function getUserStats(): Promise<{
  total_tokens: number
  total_debates: number
  completed_debates: number
  total_messages: number
  global_rank: number
} | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await (supabase as any).rpc('get_user_stats', {
    target_user_id: user.id,
  })

  if (error) {
    console.error('사용자 통계 조회 오류:', error)
    return null
  }

  return data?.[0] || null
}

/**
 * 토론 요약 생성 (Edge Function 호출)
 */
export async function summarizeDebateSession(sessionId: string): Promise<{
  summary?: string
  error?: string
}> {
  const nimSummaryUrl = (process.env.NEXT_PUBLIC_NIM_SUMMARY_URL || '').replace(/\/$/, '')
  if (nimSummaryUrl) {
    const response = await fetch(`${nimSummaryUrl}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId }),
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      return { error: errorBody?.error || `요약 요청 실패: ${response.status}` }
    }

    return response.json()
  }

  const { data, error } = await supabase.functions.invoke('summarize-debate', {
    body: { session_id: sessionId },
  })

  if (error) {
    console.error('토론 요약 생성 오류:', error)
    return { error: error.message }
  }

  return data || {}
}

// =============================================
// 라이브 배틀 방 헬퍼 함수
// =============================================

export async function getLiveBattleRooms(limit = 12): Promise<LiveBattleRoom[]> {
  const { data, error } = await supabase
    .from('live_battle_rooms')
    .select('*')
    .eq('status', 'live')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('라이브 배틀 방 조회 오류:', error)
    return []
  }
  return data || []
}

export async function createLiveBattleRoom(
  title: string,
  customRoomId?: string,
  durationSeconds = 3000
): Promise<LiveBattleRoom | null> {
  const user = await getCurrentUser()
  if (!user) return null

  // 커스텀 roomId가 있으면 기존 방이 있는지 확인
  if (customRoomId) {
    const existing = await getLiveBattleRoom(customRoomId)
    if (existing && existing.status === 'live') {
      return existing // 이미 존재하는 라이브 방 반환
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertData: any = {
    title,
    created_by: user.id,
    status: 'live',
    duration_seconds: durationSeconds,
  }

  // 커스텀 roomId가 있으면 id 지정
  if (customRoomId) {
    insertData.id = customRoomId
  }

  const { data, error } = await supabase
    .from('live_battle_rooms')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('라이브 배틀 방 생성 오류:', error)
    return null
  }
  return data
}

export async function getLiveBattleRoom(roomId: string): Promise<LiveBattleRoom | null> {
  const { data, error } = await supabase
    .from('live_battle_rooms')
    .select('*')
    .eq('id', roomId)
    .single()

  if (error) {
    console.error('라이브 배틀 방 조회 오류:', error)
    return null
  }
  return data
}

export async function endLiveBattleRoom(roomId: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  const { error } = await supabase
    .from('live_battle_rooms')
    .update({ status: 'ended', updated_at: new Date().toISOString() })
    .eq('id', roomId)

  if (error) {
    console.error('라이브 배틀 방 종료 오류:', error)
    return false
  }
  return true
}

export async function getLiveRoomParticipants(roomIds: string[], sinceMinutes = 10): Promise<Record<string, number>> {
  if (roomIds.length === 0) return {}

  const { data, error } = await supabase.rpc('get_live_room_participants', {
    room_ids: roomIds,
    since_minutes: sinceMinutes,
  })

  if (error) {
    console.error('라이브 방 참여자 수 조회 오류:', error)
    return {}
  }

  const result: Record<string, number> = {}
  ;(data || []).forEach((row) => {
    result[row.room_id] = row.participant_count
  })
  return result
}
