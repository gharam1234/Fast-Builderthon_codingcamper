'use client'

import { ArrowLeft, Clock, Star, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { lectures, categories } from '@/data/mockData';
import type { Lecture } from '@/types';

interface LectureListPageProps {
  category: string;
  onLectureClick: (lecture: Lecture) => void;
  onBack: () => void;
}

export function LectureListPage({ category, onLectureClick, onBack }: LectureListPageProps) {
  const categoryInfo = categories.find(c => c.id === category);
  const filteredLectures = category === 'all' 
    ? lectures 
    : lectures.filter(l => l.category === category);

  const getLevelBadge = (level: string) => {
    const styles = {
      beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
      intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    const labels = {
      beginner: '초급',
      intermediate: '중급',
      advanced: '고급',
    };
    return { style: styles[level as keyof typeof styles], label: labels[level as keyof typeof labels] };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="text-gray-300" size={24} />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-5xl">{categoryInfo?.icon}</span>
              <div>
                <h1 className="text-3xl font-bold text-white">{categoryInfo?.name}</h1>
                <p className="text-gray-400">{filteredLectures.length}개의 강의</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Lecture Grid */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-3 gap-8">
          {filteredLectures.map((lecture, index) => {
            const levelBadge = getLevelBadge(lecture.level);
            return (
              <motion.div
                key={lecture.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onLectureClick(lecture)}
                className="group bg-white/5 border border-white/10 hover:border-cyan-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-105 backdrop-blur-sm"
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={lecture.thumbnail}
                    alt={lecture.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Level Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full border backdrop-blur-sm font-medium ${levelBadge.style}`}>
                      {levelBadge.label}
                    </span>
                  </div>

                  {/* Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center shadow-2xl">
                      <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {lecture.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                    {lecture.description}
                  </p>

                  {/* Instructor */}
                  <p className="text-sm text-gray-500 mb-4">
                    {lecture.instructor} 강사
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{lecture.rating}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={16} />
                      <span>{lecture.students.toLocaleString()}명</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={16} />
                      <span>{lecture.duration}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}