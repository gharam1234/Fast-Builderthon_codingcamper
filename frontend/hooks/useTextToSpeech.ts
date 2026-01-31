'use client'

import { useState, useRef, useCallback } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type Speaker = 'james' | 'linda'

interface UseTextToSpeechReturn {
  /** 텍스트를 음성으로 변환하여 재생 */
  speak: (text: string, speaker: Speaker) => Promise<void>
  /** 현재 재생 중인지 여부 */
  isPlaying: boolean
  /** 재생 중인 음성 중지 */
  stop: () => void
  /** 현재 재생 중인 화자 */
  currentSpeaker: Speaker | null
  /** 에러 상태 */
  error: string | null
  /** 에러 초기화 */
  clearError: () => void
  /** 여러 응답을 순차 재생 (James → Linda) */
  speakSequential: (
    jamesText: string,
    lindaText: string,
    onComplete?: () => void
  ) => Promise<void>
  /** 로딩 상태 (음성 생성 중) */
  isLoading: boolean
}

/**
 * ElevenLabs TTS Hook
 * 
 * 텍스트를 음성으로 변환하여 재생하는 React Hook입니다.
 * 
 * @example
 * ```tsx
 * const { speak, isPlaying, stop, currentSpeaker } = useTextToSpeech()
 * 
 * // 단일 재생
 * await speak('안녕하세요', 'james')
 * 
 * // 순차 재생 (James → Linda)
 * await speakSequential('제임스 응답', '린다 응답')
 * ```
 */
export function useTextToSpeech(): UseTextToSpeechReturn {
  const isTtsDisabled = process.env.NEXT_PUBLIC_DISABLE_TTS === 'true'
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const mockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mockResolveRef = useRef<(() => void) | null>(null)

  /**
   * 오디오 리소스만 정리 (fetch 요청은 취소하지 않음)
   */
  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }
  }, [])

  /**
   * 전체 리소스 정리 (fetch 요청도 취소)
   */
  const cleanupMockPlayback = useCallback(() => {
    if (mockTimeoutRef.current) {
      clearTimeout(mockTimeoutRef.current)
      mockTimeoutRef.current = null
    }
    if (mockResolveRef.current) {
      mockResolveRef.current()
      mockResolveRef.current = null
    }
  }, [])

  const cleanup = useCallback(() => {
    cleanupMockPlayback()
    cleanupAudio()
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [cleanupAudio, cleanupMockPlayback])

  /**
   * 재생 중지
   */
  const stop = useCallback(() => {
    cleanup()
    setIsPlaying(false)
    setCurrentSpeaker(null)
    setIsLoading(false)
  }, [cleanup])

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * 텍스트를 음성으로 변환하여 재생
   */
  const speak = useCallback(async (text: string, speaker: Speaker): Promise<void> => {
    if (!text.trim()) {
      return
    }

    if (isTtsDisabled) {
      cleanup()
      setError(null)
      setIsLoading(false)
      setIsPlaying(true)
      setCurrentSpeaker(speaker)

      const duration = Math.min(5000, Math.max(1200, text.length * 60))

      return new Promise((resolve) => {
        mockResolveRef.current = resolve
        mockTimeoutRef.current = setTimeout(() => {
          setIsPlaying(false)
          setCurrentSpeaker(null)
          mockResolveRef.current = null
          resolve()
        }, duration)
      })
    }

    // 기존 재생 중지
    cleanup()
    
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      setIsLoading(true)
      setError(null)
      setCurrentSpeaker(speaker)
      
      // API 호출하여 음성 생성
      const response = await fetch(`${API_BASE_URL}/api/v1/voice/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: speaker,
        }),
        signal: abortController.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `TTS 요청 실패: ${response.status}`)
      }

      // 오디오 Blob 생성
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      audioUrlRef.current = audioUrl

      // 오디오 재생
      return new Promise((resolve, reject) => {
        const audio = new Audio(audioUrl)
        audioRef.current = audio

        audio.onloadeddata = () => {
          setIsLoading(false)
          setIsPlaying(true)
        }

        audio.onended = () => {
          // 오디오만 정리하고 abortController는 건드리지 않음
          // 다음 메시지 재생 시 새 요청이 취소되는 것을 방지
          cleanupAudio()
          setIsPlaying(false)
          setCurrentSpeaker(null)
          resolve()
        }

        audio.onerror = (e) => {
          cleanupAudio()
          setIsPlaying(false)
          setCurrentSpeaker(null)
          reject(new Error('오디오 재생 중 오류가 발생했습니다.'))
        }

        audio.play().catch((err) => {
          cleanupAudio()
          setIsPlaying(false)
          setCurrentSpeaker(null)
          setIsLoading(false)
          reject(err)
        })
      })
    } catch (err) {
      setIsLoading(false)
      setIsPlaying(false)
      setCurrentSpeaker(null)
      
      if (err instanceof Error) {
        // AbortError는 의도적 취소이므로 에러로 처리하지 않음
        if (err.name === 'AbortError') {
          return
        }
        setError(err.message)
        throw err
      }
      const errorMessage = '음성 합성 중 알 수 없는 오류가 발생했습니다.'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [cleanup])

  /**
   * James와 Linda 응답을 순차적으로 재생
   * James 응답 완료 후 Linda 응답 재생
   */
  const speakSequential = useCallback(async (
    jamesText: string,
    lindaText: string,
    onComplete?: () => void
  ): Promise<void> => {
    setError(null)
    let hasError = false
    
    // James 응답 재생
    if (jamesText.trim()) {
      try {
        await speak(jamesText, 'james')
      } catch (err) {
        hasError = true
        console.error('TTS James error:', err)
      }
    }
    
    // Linda 응답 재생 (James 실패 시에도 시도)
    if (lindaText.trim()) {
      try {
        await speak(lindaText, 'linda')
      } catch (err) {
        hasError = true
        console.error('TTS Linda error:', err)
      }
    }
    
    // 완료 콜백 실행 (실패 여부와 무관하게 호출)
    if (!hasError) {
      onComplete?.()
      return
    }
    onComplete?.()
  }, [speak])

  return {
    speak,
    isPlaying,
    stop,
    currentSpeaker,
    error,
    clearError,
    speakSequential,
    isLoading,
  }
}

export default useTextToSpeech
