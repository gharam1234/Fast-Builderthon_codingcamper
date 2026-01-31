import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Types
export type Speaker = 'james' | 'linda' | 'user' | 'system'
export type DebateStatus = 'idle' | 'loading' | 'in_progress' | 'paused' | 'completed'

export interface DebateMessage {
  id: string
  speaker: Speaker
  content: string
  audioUrl?: string
  timestamp: Date
}

export interface DebateState {
  // 현재 토론 정보
  debateId: string | null
  lectureId: string | null
  topic: string
  jamesPosition: string
  lindaPosition: string
  
  // 상태
  status: DebateStatus
  currentSpeaker: Speaker | null
  isRecording: boolean
  isPlaying: boolean
  
  // 메시지
  messages: DebateMessage[]
  
  // 점수 및 결과
  jamesScore: number
  lindaScore: number
  userVote: 'james' | 'linda' | null
  winner: 'james' | 'linda' | 'draw' | null
  
  // 타이머
  timeRemaining: number
  totalTime: number
  
  // 오디오 상태
  audioQueue: string[]
  currentAudioIndex: number
}

export interface DebateActions {
  // 토론 시작/종료
  initDebate: (params: {
    debateId: string
    lectureId: string
    topic: string
    jamesPosition: string
    lindaPosition: string
  }) => void
  startDebate: () => void
  pauseDebate: () => void
  resumeDebate: () => void
  endDebate: () => void
  resetDebate: () => void
  
  // 메시지 관련
  addMessage: (message: Omit<DebateMessage, 'id' | 'timestamp'>) => void
  clearMessages: () => void
  
  // 녹음 관련
  setRecording: (isRecording: boolean) => void
  setPlaying: (isPlaying: boolean) => void
  setCurrentSpeaker: (speaker: Speaker | null) => void
  
  // 점수 관련
  updateScore: (speaker: 'james' | 'linda', delta: number) => void
  setUserVote: (vote: 'james' | 'linda' | null) => void
  determineWinner: () => void
  
  // 타이머 관련
  setTimeRemaining: (time: number) => void
  decrementTime: () => void
  
  // 오디오 관련
  addToAudioQueue: (audioUrl: string) => void
  playNextAudio: () => void
  clearAudioQueue: () => void
}

const initialState: DebateState = {
  debateId: null,
  lectureId: null,
  topic: '',
  jamesPosition: '',
  lindaPosition: '',
  status: 'idle',
  currentSpeaker: null,
  isRecording: false,
  isPlaying: false,
  messages: [],
  jamesScore: 50,
  lindaScore: 50,
  userVote: null,
  winner: null,
  timeRemaining: 300, // 5분
  totalTime: 300,
  audioQueue: [],
  currentAudioIndex: 0,
}

export const useDebateStore = create<DebateState & DebateActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        initDebate: (params) => {
          set({
            ...initialState,
            ...params,
            status: 'loading',
          })
        },

        startDebate: () => {
          set({ status: 'in_progress' })
        },

        pauseDebate: () => {
          set({ status: 'paused' })
        },

        resumeDebate: () => {
          set({ status: 'in_progress' })
        },

        endDebate: () => {
          get().determineWinner()
          set({ status: 'completed' })
        },

        resetDebate: () => {
          set(initialState)
        },

        addMessage: (message) => {
          const newMessage: DebateMessage = {
            ...message,
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
          }
          set((state) => ({
            messages: [...state.messages, newMessage],
          }))
        },

        clearMessages: () => {
          set({ messages: [] })
        },

        setRecording: (isRecording) => {
          set({ isRecording })
        },

        setPlaying: (isPlaying) => {
          set({ isPlaying })
        },

        setCurrentSpeaker: (speaker) => {
          set({ currentSpeaker: speaker })
        },

        updateScore: (speaker, delta) => {
          set((state) => ({
            jamesScore: speaker === 'james' 
              ? Math.max(0, Math.min(100, state.jamesScore + delta))
              : state.jamesScore,
            lindaScore: speaker === 'linda'
              ? Math.max(0, Math.min(100, state.lindaScore + delta))
              : state.lindaScore,
          }))
        },

        setUserVote: (vote) => {
          set({ userVote: vote })
        },

        determineWinner: () => {
          const { jamesScore, lindaScore, userVote } = get()
          
          // 유저 투표 가중치 적용
          const jamesFinal = jamesScore + (userVote === 'james' ? 10 : 0)
          const lindaFinal = lindaScore + (userVote === 'linda' ? 10 : 0)
          
          let winner: 'james' | 'linda' | 'draw'
          if (jamesFinal > lindaFinal) {
            winner = 'james'
          } else if (lindaFinal > jamesFinal) {
            winner = 'linda'
          } else {
            winner = 'draw'
          }
          
          set({ winner })
        },

        setTimeRemaining: (time) => {
          set({ timeRemaining: time })
        },

        decrementTime: () => {
          set((state) => ({
            timeRemaining: Math.max(0, state.timeRemaining - 1),
          }))
        },

        addToAudioQueue: (audioUrl) => {
          set((state) => ({
            audioQueue: [...state.audioQueue, audioUrl],
          }))
        },

        playNextAudio: () => {
          set((state) => ({
            currentAudioIndex: state.currentAudioIndex + 1,
          }))
        },

        clearAudioQueue: () => {
          set({
            audioQueue: [],
            currentAudioIndex: 0,
          })
        },
      }),
      {
        name: 'debate-storage',
        partialize: (state) => ({
          // 영구 저장할 상태만 선택
          debateId: state.debateId,
          messages: state.messages,
        }),
      }
    ),
    { name: 'DebateStore' }
  )
)

export default useDebateStore
