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

export default api
