'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from './utils'

interface AudioWaveformProps {
  /** 비주얼라이저 타입: 'recording' (녹음 중) | 'playback' (재생 중) */
  type: 'recording' | 'playback'
  /** 활성 상태 여부 */
  isActive: boolean
  /** 막대 색상 */
  color?: string
  /** 그라디언트 색상 (color보다 우선) */
  gradient?: string
  /** 막대 개수 (기본값: 20) */
  barCount?: number
  /** 재생 중인 오디오 엘리먼트 (playback 모드) */
  audioElement?: HTMLAudioElement | null
  /** 녹음 중인 미디어 스트림 (recording 모드) */
  mediaStream?: MediaStream | null
  /** 추가 CSS 클래스 */
  className?: string
}

// 스피커별 색상 매핑
export const WAVEFORM_COLORS = {
  user: '#00d4ff',      // 사용자 녹음 (cyan)
  james: '#ff4757',     // James 음성 (red)
  linda: '#2ed573',     // Linda 음성 (green)
} as const

// 그라디언트 색상 매핑
export const WAVEFORM_GRADIENTS = {
  user: 'linear-gradient(to top, #00d4ff, #0099cc)',
  james: 'linear-gradient(to top, #ff4757, #ff6b81)',
  linda: 'linear-gradient(to top, #2ed573, #7bed9f)',
} as const

export function AudioWaveform({
  type,
  isActive,
  color = WAVEFORM_COLORS.user,
  gradient,
  barCount = 20,
  audioElement,
  mediaStream,
  className,
}: AudioWaveformProps) {
  const [barHeights, setBarHeights] = useState<number[]>(
    Array(barCount).fill(4)
  )
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const connectedElementRef = useRef<HTMLAudioElement | null>(null)

  // 주파수 데이터를 막대 높이로 변환
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !isActive) {
      // 비활성 시 부드럽게 높이 감소
      setBarHeights(prev => 
        prev.map(h => Math.max(4, h * 0.9))
      )
      return
    }

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)

    // 주파수 데이터를 barCount개의 막대로 매핑
    const newHeights: number[] = []
    const step = Math.floor(bufferLength / barCount)
    
    for (let i = 0; i < barCount; i++) {
      // 각 막대에 대한 평균 주파수 값 계산
      let sum = 0
      for (let j = 0; j < step; j++) {
        sum += dataArray[i * step + j]
      }
      const average = sum / step
      
      // 높이를 4px ~ 24px 범위로 매핑
      const height = Math.max(4, Math.min(24, (average / 255) * 24))
      newHeights.push(height)
    }

    setBarHeights(newHeights)
  }, [isActive, barCount])

  // 애니메이션 루프
  const animate = useCallback(() => {
    analyzeAudio()
    animationRef.current = requestAnimationFrame(animate)
  }, [analyzeAudio])

  // 오디오 컨텍스트 및 분석기 설정
  useEffect(() => {
    if (!isActive) {
      // 비활성 시 높이를 0으로 수렴
      const fadeOut = () => {
        setBarHeights(prev => {
          const newHeights = prev.map(h => Math.max(4, h * 0.85))
          const allMin = newHeights.every(h => h <= 4)
          if (!allMin) {
            animationRef.current = requestAnimationFrame(fadeOut)
          }
          return newHeights
        })
      }
      fadeOut()
      return
    }

    const setupAudio = async () => {
      try {
        // 기존 컨텍스트 정리
        if (audioContextRef.current?.state !== 'closed') {
          await audioContextRef.current?.close()
        }

        const audioContext = new AudioContext()
        audioContextRef.current = audioContext

        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 64 // 작은 FFT 크기로 빠른 응답
        analyser.smoothingTimeConstant = 0.8
        analyserRef.current = analyser

        if (type === 'recording' && mediaStream) {
          // 녹음 모드: MediaStream 연결
          const source = audioContext.createMediaStreamSource(mediaStream)
          source.connect(analyser)
          sourceRef.current = source
        } else if (type === 'playback' && audioElement) {
          // 재생 모드: Audio 엘리먼트 연결
          // 이미 연결된 요소인지 확인 (중복 연결 방지)
          if (connectedElementRef.current !== audioElement) {
            const source = audioContext.createMediaElementSource(audioElement)
            source.connect(analyser)
            analyser.connect(audioContext.destination)
            sourceRef.current = source
            connectedElementRef.current = audioElement
          }
        }

        // 애니메이션 시작
        animate()

      } catch (error) {
        console.error('오디오 비주얼라이저 초기화 오류:', error)
      }
    }

    setupAudio()

    return () => {
      // 애니메이션 정리
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [isActive, type, mediaStream, audioElement, animate])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close()
      }
    }
  }, [])

  return (
    <div 
      className={cn(
        'audio-waveform flex items-center justify-center gap-[2px] h-8',
        !isActive && 'inactive',
        className
      )}
      role="img"
      aria-label={isActive ? '오디오 활성화됨' : '오디오 비활성화됨'}
    >
      {barHeights.map((height, index) => (
        <span
          key={index}
          className="waveform-bar rounded-sm transition-all duration-100 ease-out"
          style={{
            width: '3px',
            height: `${height}px`,
            background: gradient || color,
            opacity: isActive ? 1 : 0.3,
            transform: `scaleY(${isActive ? 1 : 0.5})`,
          }}
        />
      ))}
    </div>
  )
}

// 간단한 CSS 애니메이션 기반 비주얼라이저 (Web Audio API 불필요)
interface SimpleWaveformProps {
  isActive: boolean
  color?: string
  gradient?: string
  barCount?: number
  className?: string
}

export function SimpleWaveform({
  isActive,
  color = WAVEFORM_COLORS.user,
  gradient,
  barCount = 20,
  className,
}: SimpleWaveformProps) {
  return (
    <div 
      className={cn(
        'flex items-center justify-center gap-[2px] h-8',
        className
      )}
    >
      {Array.from({ length: barCount }).map((_, index) => (
        <span
          key={index}
          className={cn(
            'rounded-sm transition-all duration-100 ease-out',
            isActive && 'animate-waveform'
          )}
          style={{
            width: '3px',
            height: isActive ? undefined : '4px',
            background: gradient || color,
            opacity: isActive ? 1 : 0.3,
            animationDelay: `${index * 0.05}s`,
            // CSS 변수를 통한 동적 높이 설정
            ['--bar-height' as string]: `${8 + (index % 5) * 4}px`,
          }}
        />
      ))}
    </div>
  )
}

export default AudioWaveform
