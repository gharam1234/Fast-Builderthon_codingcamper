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
 * Google 로그인
 */
export async function signInWithGoogle() {
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

  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
 * 토큰 적립 (Edge Function 호출)
 */
export async function addTokens(
  amount: number,
  reason: TokenTransactionInsert['reason'],
  sessionId?: string
): Promise<{ success: boolean; total_tokens?: number; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }

  const { data, error } = await supabase.functions.invoke('add-tokens', {
    body: {
      user_id: user.id,
      session_id: sessionId,
      amount,
      reason,
    },
  })

  if (error) {
    console.error('토큰 적립 오류:', error)
    return { success: false, error: error.message }
  }

  return data
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
  const { data, error } = await supabase.functions.invoke('get-leaderboard', {
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

  const { data, error } = await supabase.rpc('get_user_stats', {
    target_user_id: user.id,
  })

  if (error) {
    console.error('사용자 통계 조회 오류:', error)
    return null
  }

  return data?.[0] || null
}
