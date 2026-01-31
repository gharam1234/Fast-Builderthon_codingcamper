'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { api, Suggestion, SuggestionContext } from '@/lib/api'

interface UseSuggestionsProps {
  sessionId: string
  topic?: string
  userPosition?: 'pro' | 'con'
  lectureContext?: string
  /** 자동 갱신 간격 (ms), 0이면 비활성화 */
  autoRefreshInterval?: number
}

interface UseSuggestionsReturn {
  suggestions: Suggestion[]
  isLoading: boolean
  error: string | null
  /** 추천 가져오기 */
  fetchSuggestions: (type: 'topic' | 'question' | 'argument') => Promise<void>
  /** 특정 추천 제거 (선택 후 페이드아웃용) */
  removeSuggestion: (id: string) => void
  /** 모든 추천 제거 */
  clearSuggestions: () => void
  /** AI 응답으로 컨텍스트 업데이트 */
  updateContext: (jamesLast: string, lindaLast: string) => void
  /** 현재 추천 유형 */
  currentType: 'topic' | 'question' | 'argument' | null
}

export function useSuggestions({
  sessionId,
  topic,
  userPosition,
  lectureContext,
  autoRefreshInterval = 0,
}: UseSuggestionsProps): UseSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentType, setCurrentType] = useState<'topic' | 'question' | 'argument' | null>(null)
  
  // 컨텍스트 refs (최신 값 유지)
  const contextRef = useRef<SuggestionContext>({
    topic,
    user_position: userPosition,
    lecture_context: lectureContext,
  })
  
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 컨텍스트 업데이트
  useEffect(() => {
    contextRef.current = {
      ...contextRef.current,
      topic,
      user_position: userPosition,
      lecture_context: lectureContext,
    }
  }, [topic, userPosition, lectureContext])

  // AI 응답으로 컨텍스트 업데이트
  const updateContext = useCallback((jamesLast: string, lindaLast: string) => {
    contextRef.current = {
      ...contextRef.current,
      james_last: jamesLast,
      linda_last: lindaLast,
    }
  }, [])

  // 추천 가져오기
  const fetchSuggestions = useCallback(async (type: 'topic' | 'question' | 'argument') => {
    if (!sessionId) return

    setIsLoading(true)
    setError(null)
    setCurrentType(type)

    try {
      const response = await api.suggestions.generate({
        session_id: sessionId,
        suggestion_type: type,
        context: contextRef.current,
      })
      
      setSuggestions(response.suggestions)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '추천 생성 실패'
      setError(errorMessage)
      console.error('Failed to fetch suggestions:', err)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  // 특정 추천 제거
  const removeSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id))
  }, [])

  // 모든 추천 제거
  const clearSuggestions = useCallback(() => {
    setSuggestions([])
    setCurrentType(null)
  }, [])

  // 자동 갱신 (30초 무응답 시)
  useEffect(() => {
    if (autoRefreshInterval <= 0 || !currentType) return

    // 기존 타이머 정리
    if (autoRefreshTimerRef.current) {
      clearTimeout(autoRefreshTimerRef.current)
    }

    // 새 타이머 설정
    autoRefreshTimerRef.current = setTimeout(() => {
      if (currentType) {
        fetchSuggestions(currentType)
      }
    }, autoRefreshInterval)

    return () => {
      if (autoRefreshTimerRef.current) {
        clearTimeout(autoRefreshTimerRef.current)
      }
    }
  }, [autoRefreshInterval, currentType, fetchSuggestions, suggestions])

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (autoRefreshTimerRef.current) {
        clearTimeout(autoRefreshTimerRef.current)
      }
    }
  }, [])

  return {
    suggestions,
    isLoading,
    error,
    fetchSuggestions,
    removeSuggestion,
    clearSuggestions,
    updateContext,
    currentType,
  }
}
