'use client'

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface ScoreBarProps {
  logicScore: number;
  formattedTime: string;
  onBack?: () => void;
}

export function ScoreBar({ logicScore, formattedTime, onBack }: ScoreBarProps) {
  return (
    <div className="bg-slate-950/80 backdrop-blur-xl border-b border-white/10 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="뒤로가기"
              >
                <ArrowLeft className="text-gray-300" size={18} />
              </button>
            )}
            <div className="text-cyan-400 font-bold">Team Yeoul 🌊</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Real-time Logic Score</div>
            <div className="text-2xl font-bold text-white">{formattedTime}</div>
          </div>
          <div className="text-red-400 font-bold">Team Challenger ⚔️</div>
        </div>

        <div className="relative h-8 bg-gradient-to-r from-cyan-900 to-red-900 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500"
            animate={{ width: `${logicScore}%` }}
            transition={{ duration: 0.5 }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-4 h-8 bg-white rounded-full shadow-2xl"
              animate={{ left: `calc(${logicScore}% - 8px)` }}
              transition={{ duration: 0.5 }}
              style={{ position: 'absolute' }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-between px-4 text-xs font-bold">
            <span className="text-cyan-200">{logicScore}%</span>
            <span className="text-red-200">{100 - logicScore}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
