const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Generic API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `API Error: ${response.status}`)
  }

  return response.json()
}

// API Endpoints
export const api = {
  // 강의 관련
  lectures: {
    getAll: () => apiRequest<Lecture[]>('/lectures'),
    getById: (id: string) => apiRequest<Lecture>(`/lectures/${id}`),
    getByCategory: (category: string) => apiRequest<Lecture[]>(`/lectures?category=${category}`),
  },

  // 토론 관련
  debates: {
    create: (data: CreateDebateRequest) => 
      apiRequest<Debate>('/debates', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getById: (id: string) => apiRequest<Debate>(`/debates/${id}`),
    getUserDebates: (userId: string) => apiRequest<Debate[]>(`/debates/user/${userId}`),
    sendMessage: (debateId: string, message: SendMessageRequest) =>
      apiRequest<DebateMessage>(`/debates/${debateId}/messages`, {
        method: 'POST',
        body: JSON.stringify(message),
      }),
    getMessages: (debateId: string) => apiRequest<DebateMessage[]>(`/debates/${debateId}/messages`),
    complete: (debateId: string) =>
      apiRequest<Debate>(`/debates/${debateId}/complete`, {
        method: 'POST',
      }),
  },

  // AI 관련
  ai: {
    generateResponse: (data: AIGenerateRequest) =>
      apiRequest<AIResponse>('/ai/generate', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    textToSpeech: (data: TTSRequest) =>
      apiRequest<TTSResponse>('/ai/tts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    speechToText: (audioBlob: Blob) => {
      const formData = new FormData()
      formData.append('audio', audioBlob)
      return fetch(`${API_BASE_URL}/ai/stt`, {
        method: 'POST',
        body: formData,
      }).then(res => res.json() as Promise<STTResponse>)
    },
  },

  // 음성 합성 (Voice) 관련 - ElevenLabs TTS
  voice: {
    /**
     * 텍스트를 음성으로 변환하여 오디오 Blob 반환
     * @param text 변환할 텍스트
     * @param speaker 화자 (james 또는 linda)
     * @returns audio/mpeg Blob
     */
    synthesize: async (text: string, speaker: 'james' | 'linda'): Promise<Blob> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/voice/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: speaker }),
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.detail || `음성 합성 실패: ${response.status}`)
      }
      
      return response.blob()
    },

    /**
     * 텍스트를 음성으로 변환하여 스트리밍 Response 반환
     * @param text 변환할 텍스트
     * @param speaker 화자 (james 또는 linda)
     * @returns ReadableStream Response
     */
    synthesizeStream: async (text: string, speaker: 'james' | 'linda'): Promise<Response> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/voice/synthesize/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: speaker }),
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.detail || `음성 스트리밍 실패: ${response.status}`)
      }
      
      return response
    },

    /**
     * 사용 가능한 음성 목록 조회
     */
    getVoices: () => apiRequest<VoiceListResponse>('/api/v1/voice/voices'),
  },

  // 토큰 관련
  tokens: {
    getBalance: (userId: string) => apiRequest<{ balance: number }>(`/tokens/${userId}/balance`),
    earn: (userId: string, data: EarnTokenRequest) =>
      apiRequest<TokenTransaction>(`/tokens/${userId}/earn`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    spend: (userId: string, data: SpendTokenRequest) =>
      apiRequest<TokenTransaction>(`/tokens/${userId}/spend`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getHistory: (userId: string) => apiRequest<TokenTransaction[]>(`/tokens/${userId}/history`),
  },

  // 추천 시스템 관련
  suggestions: {
    /**
     * 추천 생성 (주제/질문/발언)
     * @param request 추천 생성 요청
     */
    generate: async (request: SuggestionGenerateRequest): Promise<SuggestionGenerateResponse> => {
      const response = await fetch(`${API_BASE_URL}/api/v1/suggestions/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.detail || `추천 생성 실패: ${response.status}`)
      }
      
      return response.json()
    },

    /**
     * 추천 유형 목록 조회
     */
    getTypes: () => apiRequest<{
      types: Array<{
        value: string
        label: string
        emoji: string
        description: string
      }>
    }>('/api/v1/suggestions/types'),
  },
}

// Types
export interface Lecture {
  id: string
  title: string
  description: string
  thumbnail_url: string | null
  category: string
  duration: number
  instructor: string
  created_at: string
}

export interface Debate {
  id: string
  user_id: string
  lecture_id: string
  topic: string
  james_position: string
  linda_position: string
  status: 'pending' | 'in_progress' | 'completed'
  winner: 'james' | 'linda' | 'draw' | null
  created_at: string
  updated_at: string
}

export interface DebateMessage {
  id: string
  debate_id: string
  speaker: 'james' | 'linda' | 'user' | 'system'
  content: string
  audio_url: string | null
  created_at: string
}

export interface CreateDebateRequest {
  lecture_id: string
  topic: string
}

export interface SendMessageRequest {
  content: string
  speaker: 'user'
}

export interface AIGenerateRequest {
  debate_id: string
  context: string
  speaker: 'james' | 'linda'
}

export interface AIResponse {
  content: string
  speaker: 'james' | 'linda'
}

export interface TTSRequest {
  text: string
  voice: 'james' | 'linda'
}

export interface TTSResponse {
  audio_url: string
}

export interface STTResponse {
  text: string
}

export interface TokenTransaction {
  id: string
  user_id: string
  amount: number
  type: 'earn' | 'spend'
  description: string
  created_at: string
}

export interface EarnTokenRequest {
  amount: number
  description: string
}

export interface SpendTokenRequest {
  amount: number
  description: string
}

// Voice API Types
export interface VoiceInfo {
  id: string
  name: string
  description: string
  language: string
}

export interface VoiceListResponse {
  voices: VoiceInfo[]
}

export interface VoiceSynthesizeRequest {
  text: string
  voice: 'james' | 'linda'
}

// Suggestion API Types
export interface Suggestion {
  id: string
  text: string
  type: 'topic' | 'question' | 'argument'
  target?: 'james' | 'linda' | 'general'
}

export interface SuggestionContext {
  topic?: string
  user_position?: 'pro' | 'con'
  james_last?: string
  linda_last?: string
  lecture_context?: string
}

export interface SuggestionGenerateRequest {
  session_id: string
  suggestion_type: 'topic' | 'question' | 'argument'
  context: SuggestionContext
}

export interface SuggestionGenerateResponse {
  suggestions: Suggestion[]
  generated_at: string
}

export default api
