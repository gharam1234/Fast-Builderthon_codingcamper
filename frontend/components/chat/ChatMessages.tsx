'use client'

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Message, SenderConfig } from '@/types';

interface ChatMessagesProps {
  messages: Message[];
  senderConfig: Record<string, SenderConfig>;
  isAISpeaking: boolean;
}

export function ChatMessages({ messages, senderConfig, isAISpeaking }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {messages.map((message) => {
          const config = senderConfig[message.sender];
          const isUser = message.sender === 'user';

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3`}
            >
              {!isUser && (
                <div className={`w-10 h-10 flex-shrink-0 ${config.color} rounded-full flex items-center justify-center text-xl`}>
                  {config.icon}
                </div>
              )}

              <div className={`max-w-[75%]`}>
                <div className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : ''}`}>
                  <span className={`text-sm font-medium ${config.textColor}`}>
                    {config.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`rounded-2xl px-4 py-3 ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 border border-white/20 text-white backdrop-blur-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>

              {isUser && (
                <div className={`w-10 h-10 flex-shrink-0 ${config.color} rounded-full flex items-center justify-center text-xl`}>
                  {config.icon}
                </div>
              )}
            </motion.div>
          );
        })}

        {isAISpeaking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 backdrop-blur-sm">
              <div className="flex gap-1">
                <motion.div
                  className="w-2 h-2 bg-cyan-400 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-cyan-400 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-cyan-400 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
              <span className="text-sm text-gray-400">AI가 생각중입니다...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
