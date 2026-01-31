'use client'

import { Waves } from 'lucide-react';
import { motion } from 'framer-motion';

export function ChatHeader() {
  return (
    <header className="border-b border-white/10 bg-slate-950/50 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Waves className="text-cyan-400" size={40} />
            <motion.div
              className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-lg"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Yeoul AI 세미나</h1>
            <p className="text-sm text-cyan-400">실시간 3자 토론</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-gray-400">James 🔥</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-400">Linda 🍀</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
