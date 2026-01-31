import { motion } from 'framer-motion'
import { Clock, User, Tag, BookOpen } from 'lucide-react'

interface LectureInfoProps {
  title: string
  description: string
  instructor: string
  category: string
  duration: number
  topics?: string[]
  onStartDebate?: () => void
}

export default function LectureInfo({
  title,
  description,
  instructor,
  category,
  duration,
  topics = [],
  onStartDebate,
}: LectureInfoProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="inline-block bg-yeoul-cyan/20 text-yeoul-cyan text-sm px-3 py-1 rounded-full mb-2">
            {category}
          </span>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>
        
        {onStartDebate && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartDebate}
            className="bg-gradient-to-r from-james-red to-linda-green text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            🎤 AI 토론 시작
          </motion.button>
        )}
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-6 mb-4 text-sm text-white/60">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>{instructor}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{formatDuration(duration)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4" />
          <span>{category}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-white/80 leading-relaxed mb-6">{description}</p>

      {/* Topics */}
      {topics.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-yeoul-cyan" />
            <span className="text-sm font-medium text-white/80">토론 가능한 주제</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, index) => (
              <span
                key={index}
                className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-sm text-white/70 hover:border-yeoul-cyan/50 hover:text-yeoul-cyan cursor-pointer transition-colors"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
