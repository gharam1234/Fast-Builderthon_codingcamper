'use client'

import { motion } from 'framer-motion'
import { Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface OCRResultsDisplayProps {
  text: string
  confidence: number
  onCopy?: () => void
}

export function OCRResultsDisplay({
  text,
  confidence,
  onCopy,
}: OCRResultsDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy?.()
  }

  // 신뢰도에 따른 색상 결정
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'text-green-400'
    if (conf >= 60) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const getConfidenceBarColor = (conf: number) => {
    if (conf >= 80) return 'from-green-500 to-emerald-500'
    if (conf >= 60) return 'from-yellow-500 to-amber-500'
    return 'from-orange-500 to-red-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Confidence Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-300">인식 정확도</span>
          <span className={`text-lg font-bold ${getConfidenceColor(confidence)}`}>
            {Math.round(confidence)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            className={`h-full bg-gradient-to-r ${getConfidenceBarColor(confidence)}`}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Text Content */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-300">
            인식된 텍스트 ({text.split('\n').length} 줄)
          </label>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              copied
                ? 'bg-green-500/20 text-green-400'
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle size={16} />
                복사됨
              </>
            ) : (
              <>
                <Copy size={16} />
                복사
              </>
            )}
          </button>
        </div>
        <div className="bg-slate-950 border border-white/10 rounded-xl p-4 max-h-96 overflow-y-auto">
          <pre className="text-sm text-gray-100 whitespace-pre-wrap break-words font-mono leading-relaxed">
            {text}
          </pre>
        </div>
      </div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3"
      >
        <p className="text-xs text-blue-200">
          💡 <strong>팁:</strong> 신뢰도가 낮으면 사진의 선명도를 높이거나 다시 촬영해보세요.
        </p>
      </motion.div>
    </motion.div>
  )
}
