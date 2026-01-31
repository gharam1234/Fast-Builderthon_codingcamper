'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// Web Speech API 타입 정의
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

// 에러 메시지 매핑
const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': '마이크 권한을 허용해주세요',
  'no-speech': '음성이 감지되지 않았습니다',
  'network': '네트워크 연결을 확인해주세요',
  'aborted': '음성 인식이 취소되었습니다',
  'audio-capture': '마이크를 찾을 수 없습니다',
  'service-not-allowed': '음성 인식 서비스를 사용할 수 없습니다',
}

export interface UseVoiceRecognitionReturn {
  isListening: boolean
  transcript: string
  interimTranscript: string
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  error: string | null
  isSupported: boolean
}

interface UseVoiceRecognitionOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  maxDuration?: number // 최대 녹음 시간 (초)
  silenceTimeout?: number // 무음 타임아웃 (초)
  onTranscriptChange?: (transcript: string) => void
  onListeningEnd?: (finalTranscript: string) => void
}

export function useVoiceRecognition(
  options: UseVoiceRecognitionOptions = {}
): UseVoiceRecognitionReturn {
  const {
    language = 'ko-KR',
    continuous = true,
    interimResults = true,
    maxDuration = 60,
    silenceTimeout = 3,
    onTranscriptChange,
    onListeningEnd,
  } = options

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const maxDurationTimerRef = useRef<NodeJS.Timeout | null>(null)
  const finalTranscriptRef = useRef('')
  const isListeningRef = useRef(false)

  // 브라우저 지원 여부 확인
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // 타이머 클리어 함수
  const clearTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current)
      maxDurationTimerRef.current = null
    }
  }, [])

  // 무음 타이머 리셋 함수
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
    }
    
    if (isListeningRef.current && silenceTimeout > 0) {
      silenceTimerRef.current = setTimeout(() => {
        if (recognitionRef.current && isListeningRef.current) {
          recognitionRef.current.stop()
        }
      }, silenceTimeout * 1000)
    }
  }, [silenceTimeout])

  // 녹음 중지 함수
  const stopListening = useCallback(() => {
    clearTimers()
    
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop()
    }
    
    isListeningRef.current = false
    setIsListening(false)
  }, [clearTimers])

  // 텍스트 초기화 함수
  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    finalTranscriptRef.current = ''
    setError(null)
  }, [])

  // 녹음 시작 함수
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('브라우저가 음성 인식을 지원하지 않습니다')
      return
    }

    if (isListeningRef.current) {
      return
    }

    setError(null)
    resetTranscript()

    try {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognitionAPI()

      recognition.lang = language
      recognition.continuous = continuous
      recognition.interimResults = interimResults

      recognition.onstart = () => {
        isListeningRef.current = true
        setIsListening(true)
        setError(null)
        
        // 최대 녹음 시간 타이머 설정
        if (maxDuration > 0) {
          maxDurationTimerRef.current = setTimeout(() => {
            if (recognitionRef.current && isListeningRef.current) {
              recognitionRef.current.stop()
            }
          }, maxDuration * 1000)
        }
        
        // 초기 무음 타이머 설정
        resetSilenceTimer()
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalText = ''
        let interimText = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const text = result[0].transcript

          if (result.isFinal) {
            finalText += text
          } else {
            interimText += text
          }
        }

        if (finalText) {
          finalTranscriptRef.current += finalText
          setTranscript(finalTranscriptRef.current)
          onTranscriptChange?.(finalTranscriptRef.current)
        }

        setInterimTranscript(interimText)
        
        // 음성 감지 시 무음 타이머 리셋
        resetSilenceTimer()
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errorMessage =
          ERROR_MESSAGES[event.error] || `음성 인식 오류: ${event.error}`
        setError(errorMessage)
        
        // no-speech 에러는 일반적인 상황이므로 무시할 수 있음
        if (event.error !== 'no-speech') {
          console.error('Speech recognition error:', event.error)
        }
      }

      recognition.onend = () => {
        clearTimers()
        isListeningRef.current = false
        setIsListening(false)
        
        // 최종 텍스트 콜백 호출
        const finalText = finalTranscriptRef.current + interimTranscript
        if (finalText && onListeningEnd) {
          onListeningEnd(finalText.trim())
        }
        
        setInterimTranscript('')
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '음성 인식 시작 중 오류가 발생했습니다'
      setError(errorMessage)
      console.error('Failed to start speech recognition:', err)
    }
  }, [
    isSupported,
    language,
    continuous,
    interimResults,
    maxDuration,
    resetTranscript,
    resetSilenceTimer,
    clearTimers,
    onTranscriptChange,
    onListeningEnd,
    interimTranscript,
  ])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      clearTimers()
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [clearTimers])

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    error,
    isSupported,
  }
}

export default useVoiceRecognition
