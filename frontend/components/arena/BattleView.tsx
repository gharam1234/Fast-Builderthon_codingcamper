'use client'

import { motion, AnimatePresence } from 'framer-motion';

interface BattleViewProps {
  aiHints: string[];
}

export function BattleView({ aiHints }: BattleViewProps) {
  return (
    <div className="flex-1 flex">
      {/* Left - User Side */}
      <div className="flex-1 border-r-4 border-cyan-500/50 bg-gradient-to-br from-cyan-950/20 to-transparent p-8">
        <div className="h-full flex flex-col">
          <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl mb-4 relative border-4 border-cyan-500/50 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              💬
            </div>
            <div className="absolute top-4 left-4 bg-cyan-600 px-4 py-2 rounded-full text-white font-bold">
              You
            </div>
            <motion.div
              className="absolute inset-0 border-4 border-cyan-400"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          <AnimatePresence>
            {aiHints.map((hint, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                className="bg-gradient-to-r from-red-950/80 to-green-950/80 border border-red-500/30 rounded-xl p-3 mb-2 backdrop-blur-sm"
              >
                <div className="flex items-start gap-2">
                  <div className="flex gap-1">
                    <span className="text-sm">🔥</span>
                    <span className="text-sm">🍀</span>
                  </div>
                  <p className="text-sm text-white flex-1">{hint}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Right - Opponent Side */}
      <div className="flex-1 bg-gradient-to-br from-red-950/20 to-transparent p-8">
        <div className="h-full">
          <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl relative border-4 border-red-500/50 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              ⚔️
            </div>
            <div className="absolute top-4 left-4 bg-red-600 px-4 py-2 rounded-full text-white font-bold">
              Challenger
            </div>
            <motion.div
              className="absolute inset-0 border-4 border-red-400"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
