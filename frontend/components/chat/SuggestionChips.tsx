'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import type { Suggestion } from '@/lib/api'

interface SuggestionChipsProps {
  suggestions: Suggestion[]
  isLoading: boolean
  currentType: 'topic' | 'question' | 'argument' | null
  onSelect: (suggestion: Suggestion) => void
  onRefresh: () => void
  onTypeChange?: (type: 'topic' | 'question' | 'argument') => void
}

export function SuggestionChips({
  suggestions,
  isLoading,
  currentType,
  onSelect,
  onRefresh,
  onTypeChange,
}: SuggestionChipsProps) {
  // 추천 유형별 스타일
  const getChipStyle = (type: string, target?: string) => {
    if (type === 'topic') {
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30'
    }
    if (target === 'james') {
      return 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30'
    }
    if (target === 'linda') {
      return 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30'
    }
    return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30'
  }

  // 이모지 가져오기
  const getEmoji = (type: string, target?: string) => {
    if (type === 'topic') return '🎯'
    if (type === 'question') return '❓'
    if (target === 'james') return '👔'
    if (target === 'linda') return '🌸'
    return '💬'
  }

  // 타입 버튼 스타일
  const getTypeButtonStyle = (type: string, isActive: boolean) => {
    const baseStyle = 'px-3 py-1.5 rounded-full text-xs font-medium transition-all border'
    if (isActive) {
      if (type === 'topic') return `${baseStyle} bg-purple-500/30 text-purple-200 border-purple-500/50`
      if (type === 'question') return `${baseStyle} bg-cyan-500/30 text-cyan-200 border-cyan-500/50`
      return `${baseStyle} bg-amber-500/30 text-amber-200 border-amber-500/50`
    }
    return `${baseStyle} bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/70`
  }

  return (
    <div className="border-t border-white/10 bg-slate-900/50 backdrop-blur-sm">
      {/* 타입 선택 버튼 */}
      {onTypeChange && (
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          <span className="text-xs text-white/40 mr-1">추천:</span>
          {(['topic', 'question', 'argument'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={getTypeButtonStyle(type, currentType === type)}
            >
              {type === 'topic' && '🎯 주제'}
              {type === 'question' && '❓ 질문'}
              {type === 'argument' && '💬 발언'}
            </button>
          ))}
        </div>
      )}

      {/* 추천 칩 영역 */}
      <div className="relative px-4 py-3">
        {/* 새로고침 버튼 */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full 
                     bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50
                     text-white/60 hover:text-white/90 z-10"
          title="새로운 추천 가져오기"
        >
          <motion.div
            animate={isLoading ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          >
            <RefreshCw className="w-4 h-4" />
          </motion.div>
        </button>

        {/* 추천 칩 스크롤 영역 */}
        <div className="flex gap-2 overflow-x-auto pb-1 pr-12 scrollbar-hide">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              // 로딩 스켈레톤
              [...Array(4)].map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-9 w-36 bg-white/5 rounded-full animate-pulse shrink-0"
                />
              ))
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <motion.button
                  key={suggestion.id}
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(suggestion)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full
                    border text-sm font-medium whitespace-nowrap shrink-0
                    transition-all cursor-pointer
                    ${getChipStyle(suggestion.type, suggestion.target)}
                  `}
                >
                  <span>{getEmoji(suggestion.type, suggestion.target)}</span>
                  <span className="max-w-[180px] truncate">{suggestion.text}</span>
                </motion.button>
              ))
            ) : (
              // 빈 상태
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/40 text-sm py-2"
              >
                {currentType 
                  ? '추천을 불러오려면 새로고침을 눌러주세요'
                  : '위에서 추천 유형을 선택해주세요'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
