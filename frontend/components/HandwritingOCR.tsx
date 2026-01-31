'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, X, CheckCircle, Loader2, RefreshCw, Download } from 'lucide-react'
import Tesseract from 'tesseract.js'
import { useOCRHistory } from '@/hooks/useOCRHistory'

interface OCRResult {
  text: string
  confidence: number
  timestamp: Date
}

interface HandwritingOCRProps {
  onClose: () => void
  onSubmit?: (text: string) => void
}

export function HandwritingOCR({ onClose, onSubmit }: HandwritingOCRProps) {
  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { saveOCR } = useOCRHistory()

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 선택 가능합니다')
      return
    }

    setSelectedImage(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setStep('processing')
    
    // 파일 정보 확인
    console.log('Selected file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified),
    })
    
    await processOCR(file)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      handleFileSelect(file)
    }
  }

  const processOCR = async (imageFile: File) => {
    setIsProcessing(true)
    setProgress(0)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageSrc = e.target?.result as string

        const result = await Tesseract.recognize(
          imageSrc,
          'eng',
          {
            logger: (m: any) => {
              setProgress(Math.round(m.progress * 100))
            },
          }
        )

        const extractedText = result.data.text
        const confidence = result.data.confidence

        setOcrResult({
          text: extractedText,
          confidence,
          timestamp: new Date(),
        })

        setStep('result')
        setIsProcessing(false)
      }
      reader.readAsDataURL(imageFile)
    } catch (error) {
      console.error('OCR Error:', error)
      alert('OCR 처리 중 오류가 발생했습니다')
      setIsProcessing(false)
    }
  }

  const handleRetry = () => {
    setOcrResult(null)
    setSelectedImage(null)
    setPreviewUrl('')
    setStep('upload')
    setProgress(0)
  }

  const handleSubmit = () => {
    if (ocrResult && selectedImage) {
      // 히스토리에 저장
      saveOCR(
        ocrResult.text,
        previewUrl,
        ocrResult.confidence,
        selectedImage.name
      )
      
      if (onSubmit) {
        onSubmit(ocrResult.text)
      }
    }
    onClose()
  }

  const downloadAsText = () => {
    if (ocrResult) {
      const element = document.createElement('a')
      const file = new Blob([ocrResult.text], { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = `handwriting-${Date.now()}.txt`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  }

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Camera className="text-cyan-400" size={28} />
                손글씨 OCR 분석
              </h2>
              <p className="text-sm text-gray-400 mt-1">필기 노트를 촬영하면 AI가 자동으로 인식합니다</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {/* UPLOAD STEP */}
              {step === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* File Upload Area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-cyan-500/50 hover:border-cyan-400/80 rounded-2xl p-8 cursor-pointer transition-all group bg-cyan-950/20 hover:bg-cyan-950/40"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="text-center">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Upload className="text-cyan-400 mx-auto mb-3" size={48} />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        사진 선택하기
                      </h3>
                      <p className="text-sm text-gray-400">
                        클릭하여 파일을 선택하거나 드래그하여 업로드하세요
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gradient-to-r from-white/0 to-white/20" />
                    <span className="text-sm text-gray-400">또는</span>
                    <div className="flex-1 h-px bg-gradient-to-l from-white/0 to-white/20" />
                  </div>

                  {/* Camera Button */}
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Camera size={20} />
                    카메라로 촬영하기
                  </button>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCameraCapture}
                    className="hidden"
                  />

                  {/* Info */}
                  <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-sm text-blue-200">
                      💡 <strong>팁:</strong> 좋은 인식을 위해 밝은 환경에서 명확한 필기체가 포함된 사진을 업로드하세요
                    </p>
                  </div>
                </motion.div>
              )}

              {/* PROCESSING STEP */}
              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* File Info */}
                  {selectedImage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-950/30 border border-green-500/30 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                          <p className="text-green-200 font-semibold">파일 업로드 완료!</p>
                          <p className="text-xs text-green-300 mt-1">
                            파일: {selectedImage.name} ({(selectedImage.size / 1024).toFixed(2)} KB)
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Preview */}
                  {previewUrl && (
                    <div className="rounded-2xl overflow-hidden border border-white/10">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-auto max-h-64 object-cover"
                      />
                    </div>
                  )}

                  {/* Processing Animation */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 font-medium">OCR 처리 중</span>
                      <span className="text-cyan-400 font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        transition={{ ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Status Message */}
                  <div className="flex items-center gap-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-4">
                    <Loader2 className="text-cyan-400 animate-spin" size={20} />
                    <div>
                      <p className="font-semibold text-white">AI가 필기를 분석하고 있습니다</p>
                      <p className="text-sm text-gray-400">한국어와 영어를 동시에 인식합니다</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* RESULT STEP */}
              {step === 'result' && ocrResult && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Success Header */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 bg-green-950/30 border border-green-500/30 rounded-xl p-4"
                  >
                    <CheckCircle className="text-green-400 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-semibold text-white">OCR 분석 완료!</p>
                      <p className="text-sm text-green-200">
                        신뢰도: <span className="font-bold">{Math.round(ocrResult.confidence)}%</span>
                      </p>
                    </div>
                  </motion.div>

                  {/* OCR Result Text */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-300">인식된 텍스트</label>
                    <textarea
                      value={ocrResult.text}
                      onChange={(e) =>
                        setOcrResult({ ...ocrResult, text: e.target.value })
                      }
                      className="w-full h-48 bg-slate-950 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                      placeholder="인식된 텍스트가 여기에 표시됩니다"
                    />
                  </div>

                  {/* Image Preview */}
                  {previewUrl && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-300">
                        원본 이미지
                      </label>
                      <img
                        src={previewUrl}
                        alt="Original"
                        className="w-full h-auto max-h-48 object-cover rounded-xl border border-white/10"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={downloadAsText}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all"
                      title="텍스트 다운로드"
                    >
                      <Download size={18} />
                      <span className="hidden sm:inline">다운로드</span>
                    </button>
                    <button
                      onClick={handleRetry}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all"
                      title="다시 시도"
                    >
                      <RefreshCw size={18} />
                      <span className="hidden sm:inline">다시</span>
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-white font-medium transition-all"
                      title="제출"
                    >
                      <CheckCircle size={18} />
                      <span className="hidden sm:inline">제출</span>
                    </button>
                  </div>

                  {/* Info */}
                  <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-4">
                    <p className="text-sm text-amber-200">
                      📝 <strong>힌트:</strong> 텍스트를 수정한 후 제출할 수 있습니다. 부정확한 부분은 직접 수정하세요.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
