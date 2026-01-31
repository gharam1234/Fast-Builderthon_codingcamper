'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, BarChart3 } from 'lucide-react'

interface DebateReport {
  logic_score: number;
  persuasion_score: number;
  topic_score: number;
  summary: string;
  improvement_tips: string[];
  ocr_alignment_score?: number | null;
  ocr_feedback?: string | null;
}

interface DebateReportModalProps {
  isOpen: boolean;
  isLoading: boolean;
  report: DebateReport | null;
  onClose: () => void;
}

export function DebateReportModal({ isOpen, isLoading, report, onClose }: DebateReportModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            className="fixed left-1/2 top-1/2 z-[70] w-[760px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-white">
                <BarChart3 size={20} className="text-cyan-400" />
                <h3 className="font-bold">성장 리포트</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="리포트 닫기"
              >
                <X size={18} className="text-gray-300" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {isLoading && (
                <div className="text-center text-gray-300 py-12">
                  AI가 리포트를 생성 중입니다...
                </div>
              )}

              {!isLoading && !report && (
                <div className="text-center text-gray-300 py-12">
                  리포트를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
                </div>
              )}

              {!isLoading && report && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: '논리력', value: report.logic_score, color: 'from-cyan-500 to-blue-500' },
                      { label: '설득력', value: report.persuasion_score, color: 'from-emerald-500 to-green-500' },
                      { label: '주제 이해도', value: report.topic_score, color: 'from-purple-500 to-pink-500' },
                    ].map((item) => (
                      <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <div className="text-sm text-gray-400 mb-2">{item.label}</div>
                        <div className="text-3xl font-bold text-white mb-3">{item.value}</div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${item.color}`}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-sm text-gray-400 mb-2">요약</div>
                    <p className="text-white leading-relaxed">{report.summary}</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-sm text-gray-400 mb-2">개선 팁</div>
                    <ul className="space-y-2 text-white text-sm">
                      {report.improvement_tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-cyan-400">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {report.ocr_feedback && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="text-sm text-gray-400 mb-2">OCR 반영도</div>
                      <div className="text-white">
                        <div className="text-lg font-semibold mb-2">
                          {report.ocr_alignment_score ?? 0}점
                        </div>
                        <p className="text-sm text-gray-200">{report.ocr_feedback}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
