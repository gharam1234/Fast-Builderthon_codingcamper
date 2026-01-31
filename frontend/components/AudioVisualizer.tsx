'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { AudioWaveform, WAVEFORM_COLORS, WAVEFORM_GRADIENTS } from './ui/AudioWaveform';

interface AudioVisualizerProps {
  isActive: boolean;
  speaker: 'james' | 'linda' | 'user' | null;
  /** 재생 중인 오디오 엘리먼트 (실제 Web Audio API 파형 분석용) */
  audioElement?: HTMLAudioElement | null;
  /** 간단한 애니메이션 모드 사용 (Web Audio API 미사용) */
  useSimpleMode?: boolean;
}

export function AudioVisualizer({ 
  isActive, 
  speaker, 
  audioElement,
  useSimpleMode = true 
}: AudioVisualizerProps) {
  const getSpeakerInfo = () => {
    if (speaker === 'james') {
      return {
        name: 'James',
        waveColor: WAVEFORM_COLORS.james,
        waveGradient: WAVEFORM_GRADIENTS.james,
        icon: '🔥',
      };
    } else if (speaker === 'linda') {
      return {
        name: 'Linda',
        waveColor: WAVEFORM_COLORS.linda,
        waveGradient: WAVEFORM_GRADIENTS.linda,
        icon: '🍀',
      };
    } else if (speaker === 'user') {
      return {
        name: '사용자',
        waveColor: WAVEFORM_COLORS.user,
        waveGradient: WAVEFORM_GRADIENTS.user,
        icon: '🎤',
      };
    }
    return null;
  };

  const info = getSpeakerInfo();

  return (
    <AnimatePresence>
      {isActive && info && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="px-6 py-4 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-lg border-y border-cyan-900/30"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.span
              className="text-2xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 0.5,
              }}
            >
              {info.icon}
            </motion.span>
            <div>
              <p className="text-sm font-semibold text-white">{info.name}님이 말하는 중...</p>
              <p className="text-xs text-gray-400">AI 에이전트 응답 생성 중</p>
            </div>
          </div>

          {/* Waveform Visualizer - Web Audio API 기반 또는 간단 애니메이션 */}
          {useSimpleMode ? (
            <div className="flex gap-1 items-end h-16 justify-center">
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full"
                  style={{ background: info.waveGradient }}
                  animate={{
                    height: [
                      `${20 + Math.random() * 30}%`,
                      `${40 + Math.random() * 50}%`,
                      `${20 + Math.random() * 30}%`,
                    ],
                  }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.02,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex justify-center py-4">
              <AudioWaveform
                type="playback"
                isActive={isActive}
                gradient={info.waveGradient}
                color={info.waveColor}
                audioElement={audioElement}
                barCount={40}
                className="h-16"
              />
            </div>
          )}

          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{ background: info.waveColor }}
                initial={{
                  x: `${Math.random() * 100}%`,
                  y: '100%',
                  opacity: 0,
                }}
                animate={{
                  y: '-10%',
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
