'use client'

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Flame, Heart, ThumbsUp, Zap, MessageCircle, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ChatMessage } from '@/types';

interface LiveChatPanelProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  onChatInputChange: (text: string) => void;
  onSendChat: () => void;
  sendDisabled?: boolean;
  cooldownSeconds?: number;
  sendError?: string;
  presenceCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function LiveChatPanel({
  chatMessages,
  chatInput,
  onChatInputChange,
  onSendChat,
  sendDisabled = false,
  cooldownSeconds = 0,
  sendError = '',
  presenceCount = 0,
  isCollapsed = false,
  onToggleCollapse,
}: LiveChatPanelProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  return (
    <div
      className={`fixed right-0 top-0 bottom-0 bg-slate-950/90 backdrop-blur-xl border-l border-white/10 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-14' : 'w-72'
      }`}
    >
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <MessageCircle className="text-purple-400" size={18} />
          {!isCollapsed && (
            <>
              <h3 className="font-bold text-white">Live Chat</h3>
              <span className="ml-auto text-xs text-gray-400">{presenceCount}명 참여 중</span>
            </>
          )}
          <button
            onClick={onToggleCollapse}
            className="ml-auto p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            aria-label={isCollapsed ? '채팅 열기' : '채팅 접기'}
          >
            {isCollapsed ? (
              <ChevronLeft className="text-gray-300" size={18} />
            ) : (
              <ChevronRight className="text-gray-300" size={18} />
            )}
          </button>
        </div>
        {!isCollapsed && (
          <div className="flex gap-2 mt-3">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Flame className="text-red-400" size={18} />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Heart className="text-pink-400" size={18} />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ThumbsUp className="text-blue-400" size={18} />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Zap className="text-yellow-400" size={18} />
            </button>
          </div>
        )}
      </div>

      <div
        className={`flex-1 overflow-y-auto p-4 space-y-3 transition-opacity duration-200 ${
          isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
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

      <div
        className={`p-4 border-t border-white/10 transition-opacity duration-200 ${
          isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => onChatInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' || e.nativeEvent.isComposing) {
                return;
              }
              e.preventDefault();
              onSendChat();
            }}
            placeholder="채팅 입력..."
            disabled={sendDisabled}
            className="flex-1 bg-white/5 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/10 disabled:opacity-60"
          />
          <button
            onClick={onSendChat}
            disabled={sendDisabled}
            className="bg-purple-600 hover:bg-purple-500 p-2 rounded-lg transition-colors disabled:opacity-60"
          >
            <Send className="text-white" size={20} />
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-400 min-h-[16px]">
          {sendError ? sendError : sendDisabled && cooldownSeconds > 0 ? `재전송까지 ${cooldownSeconds}초` : ''}
        </div>
      </div>
    </div>
  );
}
