import { useEffect, useState } from 'react'

export interface OCRHistory {
  id: string
  text: string
  imageUrl: string
  confidence: number
  timestamp: Date
  filename: string
}

const STORAGE_KEY = 'ocr_history'

export function useOCRHistory() {
  const [history, setHistory] = useState<OCRHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 초기 로드
  useEffect(() => {
    const loadHistory = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          // Date 문자열을 Date 객체로 변환
          const withDates = parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }))
          setHistory(withDates)
        }
      } catch (error) {
        console.error('Failed to load OCR history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [])

  // 히스토리 저장
  const saveOCR = (
    text: string,
    imageUrl: string,
    confidence: number,
    filename: string
  ) => {
    const newEntry: OCRHistory = {
      id: `ocr_${Date.now()}`,
      text,
      imageUrl,
      confidence,
      timestamp: new Date(),
      filename,
    }

    const updated = [newEntry, ...history]
    setHistory(updated)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to save OCR history:', error)
    }

    return newEntry
  }

  // 특정 항목 삭제
  const deleteOCR = (id: string) => {
    const updated = history.filter((item) => item.id !== id)
    setHistory(updated)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to delete OCR history:', error)
    }
  }

  // 전체 히스토리 삭제
  const clearHistory = () => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear OCR history:', error)
    }
  }

  return {
    history,
    isLoading,
    saveOCR,
    deleteOCR,
    clearHistory,
  }
}
