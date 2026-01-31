import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Mic, Square } from 'lucide-react'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  isDisabled?: boolean
}

export default function VoiceRecorder({ onRecordingComplete, isDisabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = useCallback(async () => {
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
        onRecordingComplete(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('마이크 접근 권한이 필요합니다:', error)
    }
  }, [onRecordingComplete])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isDisabled}
        className={`
          relative w-14 h-14 rounded-full flex items-center justify-center
          transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
          ${isRecording 
            ? 'bg-james-red text-white glow-red' 
            : 'bg-yeoul-cyan text-yeoul-navy hover:bg-yeoul-cyan/90'
          }
        `}
      >
        {isRecording ? (
          <Square className="w-5 h-5" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
        
        {/* Recording pulse effect */}
        {isRecording && (
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

      {isRecording && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-james-red rounded-full animate-pulse" />
          <span className="text-white/80 font-mono">{formatTime(recordingTime)}</span>
        </motion.div>
      )}

      {!isRecording && (
        <span className="text-sm text-white/40">
          버튼을 눌러 음성으로 참여하세요
        </span>
      )}
    </div>
  )
}
