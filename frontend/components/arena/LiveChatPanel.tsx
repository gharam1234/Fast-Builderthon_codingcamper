'use client'

import { RefObject } from 'react';
import { motion } from 'framer-motion';
import { Flame, Heart, ThumbsUp, Zap, MessageCircle, Send } from 'lucide-react';
import type { ChatMessage } from '@/types';

interface LiveChatPanelProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  chatEndRef: RefObject<HTMLDivElement | null>;
  onChatInputChange: (text: string) => void;
  onSendChat: () => void;
}

export function LiveChatPanel({
  chatMessages,
  chatInput,
  chatEndRef,
  onChatInputChange,
  onSendChat,
}: LiveChatPanelProps) {
  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-950/90 backdrop-blur-xl border-l border-white/10 flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="text-purple-400" size={20} />
          <h3 className="font-bold text-white">Live Chat</h3>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Flame className="text-red-400" size={20} />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Heart className="text-pink-400" size={20} />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ThumbsUp className="text-blue-400" size={20} />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Zap className="text-yellow-400" size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2"
          >
            {msg.emoji && <span className="text-lg">{msg.emoji}</span>}
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1">{msg.user}</div>
              <div className="bg-white/5 rounded-lg px-3 py-2 text-sm text-white">
                {msg.text}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => onChatInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSendChat()}
            placeholder="채팅 입력..."
            className="flex-1 bg-white/5 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/10"
          />
          <button
            onClick={onSendChat}
            className="bg-purple-600 hover:bg-purple-500 p-2 rounded-lg transition-colors"
          >
            <Send className="text-white" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
