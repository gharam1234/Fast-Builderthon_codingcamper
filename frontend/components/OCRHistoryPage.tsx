'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  Trash2,
  Eye,
  Copy,
  Download,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from 'lucide-react'
import { useOCRHistory, type OCRHistory } from '@/hooks/useOCRHistory'

export function OCRHistoryPage({ onBack }: { onBack?: () => void }) {
  const { history, deleteOCR, clearHistory } = useOCRHistory()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDownload = (item: OCRHistory) => {
    const element = document.createElement('a')
    const file = new Blob([item.text], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${item.filename.replace(/\.[^/.]+$/, '')}_ocr.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400'
    if (confidence >= 60) return 'text-yellow-400'
    return 'text-orange-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4"
        >
          {onBack && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="text-cyan-400" size={24} />
            </motion.button>
          )}
          <div>
            <h1 className="text-4xl font-bold text-white">OCR 히스토리</h1>
            <p className="text-gray-400">
              손글씨 인식 기록 ({history.length}개)
            </p>
          </div>
        </motion.div>

        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center"
          >
            <AlertCircle
              size={48}
              className="text-gray-500 mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-white mb-2">
              아직 OCR 기록이 없습니다
            </h2>
            <p className="text-gray-400">
              강좌의 &quot;손글씨 OCR 분석&quot; 버튼을 클릭하여 시작하세요.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Clear Button */}
            {history.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        '정말 모든 OCR 기록을 삭제하시겠습니까?'
                      )
                    ) {
                      clearHistory()
                    }
                  }}
                  className="px-4 py-2 text-sm bg-red-950/30 hover:bg-red-950/50 border border-red-500/30 text-red-400 rounded-lg transition-all"
                >
                  <Trash2 size={16} className="inline mr-2" />
                  전체 삭제
                </button>
              </div>
            )}

            {/* History Items */}
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
              >
                {/* Summary */}
                <button
                  onClick={() =>
                    setExpandedId(
                      expandedId === item.id ? null : item.id
                    )
                  }
                  className="w-full p-4 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Eye size={18} className="text-cyan-400 flex-shrink-0" />
                        <h3 className="text-lg font-semibold text-white truncate">
                          {item.filename}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatDate(item.timestamp)}
                        </div>
                        <div>
                          {item.text.split('\n').length} 줄
                        </div>
                        <div
                          className={`font-semibold ${getConfidenceColor(
                            item.confidence
                          )}`}
                        >
                          신뢰도: {Math.round(item.confidence)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {expandedId === item.id ? (
                        <ChevronUp className="text-gray-400" />
                      ) : (
                        <ChevronDown className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Details */}
                {expandedId === item.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-white/10 p-4 space-y-4"
                  >
                    {/* Image Preview */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-300">
                        원본 이미지
                      </h4>
                      <img
                        src={item.imageUrl}
                        alt={item.filename}
                        className="w-full h-auto max-h-64 object-cover rounded-lg border border-white/10"
                      />
                    </div>

                    {/* Text Content */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-300">
                        인식된 텍스트
                      </h4>
                      <div className="bg-slate-950 border border-white/10 rounded-lg p-4 max-h-48 overflow-y-auto">
                        <pre className="text-sm text-gray-100 whitespace-pre-wrap break-words font-mono">
                          {item.text}
                        </pre>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          handleCopy(item.text, item.id)
                        }
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          copied === item.id
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-white/10 hover:bg-white/20 text-gray-300 border border-white/20'
                        }`}
                      >
                        <Copy size={16} />
                        {copied === item.id ? '복사됨' : '복사'}
                      </button>
                      <button
                        onClick={() => handleDownload(item)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium bg-white/10 hover:bg-white/20 text-gray-300 border border-white/20 transition-all"
                      >
                        <Download size={16} />
                        다운로드
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              '이 항목을 삭제하시겠습니까?'
                            )
                          ) {
                            deleteOCR(item.id)
                          }
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-950/30 hover:bg-red-950/50 text-red-400 border border-red-500/30 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
