'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Maximize2, Settings } from 'lucide-react'

interface VideoPlayerProps {
  title: string
  instructor: string
  duration: string
  videoUrl?: string
  thumbnail?: string
  onPlaybackChange?: (timestamp: number) => void
}

export function VideoPlayer({
  title,
  instructor,
  duration,
  // videoUrl is defined in props but not used yet
  thumbnail,
  onPlaybackChange,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value)
    setProgress(newProgress)
    onPlaybackChange?.(newProgress)
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm mb-8"
    >
      {/* Video Container */}
      <div
        className="relative bg-black aspect-video w-full group cursor-pointer"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => !isPlaying && setShowControls(false)}
      >
        {/* Video Placeholder with Thumbnail */}
        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
          {thumbnail && (
            <img
              src={thumbnail}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Play Button */}
          {!isPlaying && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlayPause}
              className="relative z-10 w-20 h-20 rounded-full bg-cyan-500 hover:bg-cyan-400 transition-colors flex items-center justify-center shadow-2xl"
            >
              <Play size={36} className="text-white ml-1" fill="white" />
            </motion.button>
          )}

          {/* Video Info Overlay */}
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          )}

          {/* Controls Overlay */}
          {(showControls || !isPlaying) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col justify-between p-4 z-20 pointer-events-none"
            >
              {/* Top Controls */}
              <div className="flex justify-between items-start pointer-events-auto">
                <div className="bg-black/40 backdrop-blur px-3 py-2 rounded-lg">
                  <p className="text-white text-sm font-medium">{duration}</p>
                </div>
                <button className="p-2 bg-black/40 hover:bg-black/60 rounded-lg transition-colors">
                  <Settings size={18} className="text-white" />
                </button>
              </div>

              {/* Bottom Controls */}
              <div className="space-y-3 pointer-events-auto">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleProgressChange}
                    className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>{formatTime(progress)}</span>
                    <span>{duration}</span>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="flex items-center justify-between bg-black/60 backdrop-blur rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePlayPause}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {isPlaying ? (
                        <Pause size={20} className="text-white" />
                      ) : (
                        <Play size={20} className="text-white ml-1" fill="white" />
                      )}
                    </button>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX size={20} className="text-white" />
                      ) : (
                        <Volume2 size={20} className="text-white" />
                      )}
                    </button>

                    {/* Playback Speed */}
                    <div className="flex gap-1 ml-2 border-l border-white/20 pl-2">
                      {[0.5, 1, 1.5, 2].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                            playbackSpeed === speed
                              ? 'bg-cyan-500 text-white'
                              : 'bg-white/10 text-gray-400 hover:bg-white/20'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Maximize2 size={20} className="text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Video Info */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">강사: {instructor}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">재생 시간</p>
            <p className="text-lg font-bold text-white">{duration}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">재생 속도</p>
            <p className="text-lg font-bold text-cyan-400">{playbackSpeed}x</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">진행률</p>
            <p className="text-lg font-bold text-white">{Math.round(progress)}%</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
