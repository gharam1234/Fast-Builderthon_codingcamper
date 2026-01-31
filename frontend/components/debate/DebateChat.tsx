import { motion } from 'framer-motion'
import type { DebateMessage } from '@store/useDebateStore'

interface DebateChatProps {
  messages: DebateMessage[]
  isLoading?: boolean
}

export default function DebateChat({ messages, isLoading }: DebateChatProps) {
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

  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`max-w-[80%] p-4 rounded-xl border ${getSpeakerStyles(message.speaker)}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-white/80">
              {getSpeakerName(message.speaker)}
            </span>
            <span className="text-xs text-white/40">
              {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p className="text-white/90 leading-relaxed">{message.content}</p>
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
    </div>
  )
}
