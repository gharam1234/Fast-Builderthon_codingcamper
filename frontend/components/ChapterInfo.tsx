'use client'

import { motion } from 'framer-motion'
import { Clock, BookMarked, Download, Share2, CheckCircle } from 'lucide-react'

interface ChapterInfoProps {
  chapterTitle: string
  description: string
  duration: string
  completed: boolean
  learningPoints: string[]
  downloadUrl?: string
}

export function ChapterInfo({
  chapterTitle,
  description,
  duration,
  completed,
  learningPoints,
  downloadUrl,
}: ChapterInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm mb-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <BookMarked className="text-purple-400" size={24} />
            <h2 className="text-2xl font-bold text-white">{chapterTitle}</h2>
            {completed && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-full px-3 py-1 flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-sm text-green-400 font-medium">완강</span>
              </div>
            )}
          </div>
          <p className="text-gray-400">{description}</p>
        </div>
        <div className="flex-shrink-0">
          <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl px-4 py-2 flex items-center gap-2">
            <Clock size={18} className="text-purple-400" />
            <span className="text-purple-300 font-medium">{duration}</span>
          </div>
        </div>
      </div>

      {/* Learning Points */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">학습 목표</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {learningPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <p className="text-gray-300 text-sm">{point}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {downloadUrl && (
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all"
          >
            <Download size={18} />
            강의 자료 다운로드
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all"
          >
            <Share2 size={18} />
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}
