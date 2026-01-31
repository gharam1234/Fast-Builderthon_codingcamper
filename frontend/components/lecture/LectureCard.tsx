import { motion } from 'framer-motion'

interface LectureCardProps {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  category: string
  duration: number
  instructor: string
  onClick?: () => void
}

export default function LectureCard({
  title,
  description,
  thumbnailUrl,
  category,
  duration,
  instructor,
  onClick,
}: LectureCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-card rounded-xl overflow-hidden cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-yeoul-light to-yeoul-navy overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-50">📚</span>
          </div>
        )}
        
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white/90">
          {formatDuration(duration)}
        </div>
        
        {/* Category badge */}
        <div className="absolute top-2 left-2 bg-yeoul-cyan/90 text-yeoul-navy px-2 py-1 rounded text-xs font-medium">
          {category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-white group-hover:text-yeoul-cyan transition-colors line-clamp-2 mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-white/60 line-clamp-2 mb-3">
          {description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>{instructor}</span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 flex items-center justify-center">💬</span>
            토론 가능
          </span>
        </div>
      </div>
    </motion.div>
  )
}
