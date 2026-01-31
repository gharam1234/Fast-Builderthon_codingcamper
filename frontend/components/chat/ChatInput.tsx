'use client'

import { Mic, MicOff, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { AudioVisualizer } from '../AudioVisualizer';

interface ChatInputProps {
  inputText: string;
  isRecording: boolean;
  onInputChange: (text: string) => void;
  onSendMessage: () => void;
  onToggleRecording: () => void;
}

export function ChatInput({
  inputText,
  isRecording,
  onInputChange,
  onSendMessage,
  onToggleRecording,
}: ChatInputProps) {
  return (
    <div className="border-t border-white/10 bg-slate-950/80 backdrop-blur-xl p-6">
      <div className="max-w-5xl mx-auto">
        {isRecording && (
          <div className="mb-4">
            <AudioVisualizer isActive={isRecording} />
          </div>
        )}

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleRecording}
            className={`p-4 rounded-xl transition-all ${
              isRecording
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-cyan-600 hover:bg-cyan-500'
            }`}
          >
            {isRecording ? (
              <MicOff className="text-white" size={24} />
            ) : (
              <Mic className="text-white" size={24} />
            )}
          </motion.button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="메시지를 입력하거나 음성으로 말해보세요..."
            className="flex-1 bg-white/5 text-white placeholder-gray-400 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-white/10"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSendMessage}
            className="p-4 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all"
          >
            <Send className="text-white" size={24} />
          </motion.button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-500">
            Tip: 음성 버튼을 눌러 실시간 음성 토론을 시작하세요
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>참여자: 3명</span>
            <span>•</span>
            <span>진행 시간: 12:34</span>
          </div>
        </div>
      </div>
    </div>
  );
}
