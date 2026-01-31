'use client'

import { Play, Pause, Volume2, Settings, Maximize, Waves, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Lecture } from '@/types';

interface LectureViewProps {
  lecture: Lecture;
  onStartDebate: () => void;
  onBack: () => void;
}

export function LectureView({ lecture, onStartDebate, onBack }: LectureViewProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(45);

  return (
    <div className="h-screen bg-gray-950 flex flex-col max-w-md mx-auto">
      {/* Video Player */}
      <div className="relative bg-gray-900">
        <div className="relative w-full aspect-video bg-gray-800">
          <img 
            src={lecture.thumbnail}
            alt="Lecture content"
            className="w-full h-full object-cover"
          />
          
          {/* Video Controls Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {/* Progress Bar */}
              <div 
                className="w-full h-1 bg-gray-700 rounded-full mb-3 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const newProgress = (x / rect.width) * 100;
                  setProgress(newProgress);
                }}
              >
                <div 
                  className="h-full bg-cyan-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="hover:scale-110 transition-transform"
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  <span className="text-sm">10:05 / 22:15</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Volume2 size={20} className="cursor-pointer hover:text-cyan-400" />
                  <Settings size={20} className="cursor-pointer hover:text-cyan-400" />
                  <Maximize size={20} className="cursor-pointer hover:text-cyan-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lecture Info */}
        <div className="p-4 border-b border-gray-800">
          <h1 className="font-semibold text-white mb-1">{lecture.title}</h1>
          <p className="text-sm text-gray-400">Chapter 3: {lecture.curriculum[2]?.title || 'Custom Hooks Best Practices'}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-gray-500">👁️ {lecture.students.toLocaleString()}명 시청 중</span>
            <span className="text-xs text-gray-500">⏱️ 2024.01.31 업로드</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-800 bg-gray-900">
        <button className="flex-1 px-4 py-3 text-sm font-medium text-cyan-400 border-b-2 border-cyan-400">
          커리큘럼
        </button>
        <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-400 hover:text-gray-300">
          강의 노트
        </button>
        <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-400 hover:text-gray-300">
          Q&A
        </button>
      </div>

      {/* Curriculum List */}
      <div className="flex-1 overflow-y-auto bg-gray-950">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-400">전체 강의</h2>
            <span className="text-xs text-gray-500">{lecture.curriculum.length}개 중 2개 완료</span>
          </div>
          
          <div className="space-y-2">
            {lecture.curriculum.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg transition-colors cursor-pointer ${
                  item.current
                    ? 'bg-cyan-950/30 border border-cyan-800/50'
                    : item.completed
                    ? 'bg-gray-800/30 hover:bg-gray-800/50'
                    : 'bg-gray-800/30 hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {item.completed && (
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                        <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {item.current && (
                      <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                        <Play size={12} className="text-white ml-0.5" />
                      </div>
                    )}
                    {!item.completed && !item.current && (
                      <div className="w-6 h-6 rounded-full bg-gray-700/50 border border-gray-600 flex items-center justify-center">
                        <span className="text-xs text-gray-500">{item.id}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm ${
                      item.current ? 'text-cyan-400 font-medium' : 
                      item.completed ? 'text-gray-400' : 'text-gray-300'
                    }`}>
                      {item.title}
                    </h3>
                  </div>
                  
                  {/* Duration */}
                  <span className="text-xs text-gray-500 flex-shrink-0">{item.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) - AI 세미나 참여 */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStartDebate}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full shadow-2xl shadow-cyan-500/50 flex items-center gap-3 px-6 py-4 hover:shadow-cyan-500/70 transition-all z-50"
        style={{ maxWidth: 'calc(100vw - 3rem)' }}
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Waves size={24} />
        </motion.div>
        <div className="flex flex-col items-start">
          <span className="text-xs opacity-80">🌊 Yeoul</span>
          <span className="font-semibold text-sm">AI 세미나 참여</span>
        </div>
      </motion.button>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="fixed top-6 left-6 bg-gray-800 text-white rounded-full shadow-2xl shadow-gray-800/50 flex items-center gap-3 px-4 py-4 hover:shadow-gray-800/70 transition-all z-50"
      >
        <ArrowLeft size={24} />
      </button>
    </div>
  );
}