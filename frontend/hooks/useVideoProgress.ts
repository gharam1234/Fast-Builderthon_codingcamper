import { useState, useCallback } from 'react'

export interface VideoProgress {
  chapterId: number
  progress: number
  timestamp: number
  completed: boolean
}

const STORAGE_KEY = 'video_progress'

export function useVideoProgress() {
  const [progressMap, setProgressMap] = useState<Map<number, VideoProgress>>(
    new Map()
  )

  // 초기 로드
  const loadProgress = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: Record<string, VideoProgress> = JSON.parse(stored)
        const map = new Map(Object.entries(parsed).map(([key, value]) => [
          parseInt(key),
          value,
        ]))
        setProgressMap(map)
      }
    } catch (error) {
      console.error('Failed to load video progress:', error)
    }
  }, [])

  // 진행도 저장
  const saveProgress = useCallback(
    (chapterId: number, progress: number) => {
      const newProgress: VideoProgress = {
        chapterId,
        progress,
        timestamp: Date.now(),
        completed: progress >= 95,
      }

      const updated = new Map(progressMap)
      updated.set(chapterId, newProgress)
      setProgressMap(updated)

      try {
        const record: Record<string, VideoProgress> = {}
        updated.forEach((value, key) => {
          record[key.toString()] = value
        })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
      } catch (error) {
        console.error('Failed to save video progress:', error)
      }
    },
    [progressMap]
  )

  // 특정 챕터의 진행도 가져오기
  const getProgress = useCallback(
    (chapterId: number) => {
      return progressMap.get(chapterId) || null
    },
    [progressMap]
  )

  // 진행도 초기화
  const resetProgress = useCallback((chapterId?: number) => {
    if (chapterId) {
      const updated = new Map(progressMap)
      updated.delete(chapterId)
      setProgressMap(updated)

      try {
        const record: Record<string, VideoProgress> = {}
        updated.forEach((value, key) => {
          record[key.toString()] = value
        })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
      } catch (error) {
        console.error('Failed to reset video progress:', error)
      }
    } else {
      setProgressMap(new Map())
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (error) {
        console.error('Failed to reset all video progress:', error)
      }
    }
  }, [progressMap])

  return {
    progressMap,
    loadProgress,
    saveProgress,
    getProgress,
    resetProgress,
  }
}
