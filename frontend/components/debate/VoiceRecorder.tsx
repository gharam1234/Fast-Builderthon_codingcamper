'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, MicOff, AlertCircle } from 'lucide-react'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import { SimpleWaveform, WAVEFORM_COLORS, WAVEFORM_GRADIENTS } from '@/components/ui/AudioWaveform'

type RecordingMode = 'audio' | 'stt'

interface VoiceRecorderProps {
  /** 오디오 녹음 완료 시 콜백 (audio 모드) */
  onRecordingComplete?: (audioBlob: Blob) => void
  /** STT 결과 텍스트 콜백 (stt 모드) */
  onTranscriptComplete?: (transcript: string) => void
  /** 실시간 중간 텍스트 콜백 */
  onInterimTranscript?: (interim: string) => void
  /** 버튼 비활성화 여부 */
  isDisabled?: boolean
  /** 녹음 모드: 'audio' (오디오 파일) 또는 'stt' (음성 인식) */
  mode?: RecordingMode
  /** Long press 모드 사용 여부 (누르고 있는 동안 녹음) */
  useLongPress?: boolean
  /** 컴팩트 모드 (작은 버튼) */
  compact?: boolean
}

export default function VoiceRecorder({
  onRecordingComplete,
  onTranscriptComplete,
  onInterimTranscript,
  isDisabled,
  mode = 'stt',
  useLongPress = true,
  compact = false,
}: VoiceRecorderProps) {
  // 오디오 녹음 관련 상태 (audio 모드)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPressing = useRef(false)

  // STT 음성 인식 Hook (stt 모드)
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    error: sttError,
    isSupported: isSttSupported,
  } = useVoiceRecognition({
    language: 'ko-KR',
    continuous: true,
    interimResults: true,
    maxDuration: 60,
    silenceTimeout: 3,
    onListeningEnd: (finalTranscript) => {
      if (finalTranscript && onTranscriptComplete) {
        onTranscriptComplete(finalTranscript)
      }
    },
  })

  // 중간 결과 콜백 전달
  useEffect(() => {
    if (onInterimTranscript && interimTranscript) {
      onInterimTranscript(interimTranscript)
    }
  }, [interimTranscript, onInterimTranscript])

  // 오디오 녹음 시작 (audio 모드)
  const startAudioRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        onRecordingComplete?.(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('마이크 접근 권한이 필요합니다:', error)
    }
  }, [onRecordingComplete])

  // 오디오 녹음 중지 (audio 모드)
  const stopAudioRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording])

  // 모드에 따른 시작/중지 핸들러
  const handleStart = useCallback(() => {
    if (isDisabled) return
    isLongPressing.current = true
    
    if (mode === 'audio') {
      startAudioRecording()
    } else {
      resetTranscript()
      startListening()
    }
  }, [mode, isDisabled, startAudioRecording, startListening, resetTranscript])

  const handleStop = useCallback(() => {
    if (!isLongPressing.current) return
    isLongPressing.current = false
    
    if (mode === 'audio') {
      stopAudioRecording()
    } else {
      stopListening()
    }
  }, [mode, stopAudioRecording, stopListening])

  // 클릭 토글 핸들러 (long press 미사용 시)
  const handleClick = useCallback(() => {
    if (isDisabled) return
    
    const isActive = mode === 'audio' ? isRecording : isListening
    
    if (isActive) {
      handleStop()
    } else {
      handleStart()
    }
  }, [mode, isRecording, isListening, isDisabled, handleStart, handleStop])

  // Long press 이벤트 핸들러
  const longPressHandlers = useLongPress
    ? {
        onMouseDown: handleStart,
        onMouseUp: handleStop,
        onMouseLeave: handleStop,
        onTouchStart: handleStart,
        onTouchEnd: handleStop,
      }
    : { onClick: handleClick }

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 현재 활성 상태
  const isActive = mode === 'audio' ? isRecording : isListening
  const error = mode === 'stt' ? sttError : null
  const currentTranscript = transcript || interimTranscript

  // 버튼 크기 클래스
  const buttonSizeClass = compact ? 'w-10 h-10' : 'w-14 h-14'
  const iconSizeClass = compact ? 'w-4 h-4' : 'w-6 h-6'
  const smallIconSizeClass = compact ? 'w-3 h-3' : 'w-5 h-5'

  // STT 미지원 경고
  if (mode === 'stt' && !isSttSupported) {
    return (
      <div className="flex items-center gap-2 text-white/60">
        <MicOff className="w-5 h-5" />
        <span className="text-sm">브라우저가 음성 인식을 지원하지 않습니다</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          {...longPressHandlers}
          disabled={isDisabled}
          className={`
            relative ${buttonSizeClass} rounded-full flex items-center justify-center
            transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
            select-none touch-none
            ${
              isActive
                ? 'bg-james-red text-white glow-red'
                : 'bg-yeoul-cyan text-yeoul-navy hover:bg-yeoul-cyan/90'
            }
          `}
          aria-label={isActive ? '녹음 중지' : '녹음 시작'}
        >
          {isActive ? (
            <Square className={smallIconSizeClass} />
          ) : (
            <Mic className={iconSizeClass} />
          )}

          {/* Recording pulse effect */}
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full bg-james-red"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          )}
        </motion.button>

        {/* 녹음 시간 표시 (audio 모드) */}
        {mode === 'audio' && isRecording && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-james-red rounded-full animate-pulse" />
            <span className="text-white/80 font-mono">{formatTime(recordingTime)}</span>
            {/* 녹음 중 파형 비주얼라이저 */}
            <SimpleWaveform 
              isActive={true} 
              gradient={WAVEFORM_GRADIENTS.user}
              barCount={12}
              className="ml-2"
            />
          </motion.div>
        )}

        {/* 녹음 중 표시 (stt 모드) */}
        {mode === 'stt' && isListening && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-james-red rounded-full animate-pulse" />
            <span className="text-white/80 text-sm">듣고 있습니다...</span>
            {/* STT 중 파형 비주얼라이저 */}
            <SimpleWaveform 
              isActive={true} 
              gradient={WAVEFORM_GRADIENTS.user}
              barCount={12}
              className="ml-2"
            />
          </motion.div>
        )}

        {/* 안내 텍스트 */}
        {!isActive && !compact && (
          <span className="text-sm text-white/40">
            {useLongPress ? '버튼을 누르고 있는 동안 음성으로 참여하세요' : '버튼을 눌러 음성으로 참여하세요'}
          </span>
        )}
      </div>

      {/* 실시간 텍스트 미리보기 (stt 모드) */}
      <AnimatePresence>
        {mode === 'stt' && isListening && currentTranscript && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="bg-white/5 border border-white/10 rounded-lg p-3 text-white/80 text-sm"
          >
            <span className="text-yeoul-cyan mr-1">📝</span>
            {transcript}
            {interimTranscript && (
              <span className="text-white/50 italic">{interimTranscript}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 에러 메시지 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-james-red text-sm bg-james-red/10 border border-james-red/20 rounded-lg px-3 py-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
