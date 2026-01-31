'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { DebateMessage } from '@/store/useDebateStore'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'

interface DebateChatProps {
  messages: DebateMessage[]
  isLoading?: boolean
  /** 자동으로 새 메시지 음성 재생 여부 */
  autoPlayVoice?: boolean
}

export default function DebateChat({ messages, isLoading, autoPlayVoice = true }: DebateChatProps) {
  const { speak, isPlaying, stop, currentSpeaker, isLoading: isTTSLoading } = useTextToSpeech()
  const lastPlayedIndexRef = useRef(-1)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const getSpeakerStyles = (speaker: DebateMessage['speaker']) => {
    switch (speaker) {
      case 'james':
        return 'bg-james-red/20 border-james-red/50 ml-0 mr-auto'
      case 'linda':
        return 'bg-linda-green/20 border-linda-green/50 ml-auto mr-0'
      case 'user':
        return 'bg-yeoul-cyan/20 border-yeoul-cyan/50 mx-auto'
      case 'system':
        return 'bg-white/5 border-white/10 mx-auto text-center'
      default:
        return 'bg-white/5 border-white/10'
    }
  }

  const getSpeakerName = (speaker: DebateMessage['speaker']) => {
    switch (speaker) {
      case 'james':
        return 'James'
      case 'linda':
        return 'Linda'
      case 'user':
        return '나'
      case 'system':
        return '시스템'
      default:
        return ''
    }
  }

  // 새 AI 메시지가 추가되면 자동으로 음성 재생
  // isPlaying이 false가 될 때도 다음 메시지를 재생하기 위해 의존성에 포함
  useEffect(() => {
    if (!autoPlayVoice || isLoading) return
    
    // 이미 재생 중이면 건너뜀
    if (isPlaying) return

    const aiMessages = messages.filter(m => m.speaker === 'james' || m.speaker === 'linda')
    const nextIndex = lastPlayedIndexRef.current + 1
    
    if (nextIndex < aiMessages.length) {
      const nextMessage = aiMessages[nextIndex]
      if (nextMessage && (nextMessage.speaker === 'james' || nextMessage.speaker === 'linda')) {
        lastPlayedIndexRef.current = nextIndex
        speak(nextMessage.content, nextMessage.speaker).catch(console.error)
      }
    }
  }, [messages, isLoading, isPlaying, autoPlayVoice, speak])

  // 새 메시지 추가 시 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleMessageClick = (message: DebateMessage) => {
    // AI 메시지 클릭 시 해당 메시지 음성 재생
    if (message.speaker === 'james' || message.speaker === 'linda') {
      if (isPlaying) {
        stop()
      } else {
        speak(message.content, message.speaker).catch(console.error)
      }
    }
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`max-w-[80%] p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${getSpeakerStyles(message.speaker)} ${
            isPlaying && currentSpeaker === message.speaker ? 'ring-2 ring-yeoul-cyan animate-pulse' : ''
          }`}
          onClick={() => handleMessageClick(message)}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-white/80">
              {getSpeakerName(message.speaker)}
            </span>
            {/* 재생 중 표시 */}
            {isPlaying && currentSpeaker === message.speaker && (
              <span className="flex items-center gap-1 text-xs text-yeoul-cyan">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yeoul-cyan opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yeoul-cyan"></span>
                </span>
                재생 중
              </span>
            )}
            {/* 음성 로딩 중 표시 */}
            {isTTSLoading && currentSpeaker === message.speaker && (
              <span className="text-xs text-white/40">음성 생성 중...</span>
            )}
            <span className="text-xs text-white/40 ml-auto">
              {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p className="text-white/90 leading-relaxed">{message.content}</p>
          
          {/* AI 메시지에 음성 재생 버튼 표시 */}
          {(message.speaker === 'james' || message.speaker === 'linda') && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleMessageClick(message)
              }}
              className="mt-2 text-xs text-white/50 hover:text-white/80 flex items-center gap-1 transition-colors"
            >
              {isPlaying && currentSpeaker === message.speaker ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  중지
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  음성 재생
                </>
              )}
            </button>
          )}
        </motion.div>
      ))}
      
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-white/40"
        >
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-yeoul-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-yeoul-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-yeoul-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>AI가 응답을 생성하고 있습니다...</span>
        </motion.div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  )
}
