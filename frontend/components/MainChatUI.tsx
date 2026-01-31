'use client'

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Waves, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { AudioVisualizer } from './AudioVisualizer';
import { Lecture } from '@/data/mockData';

interface Message {
  id: number;
  sender: 'user' | 'james' | 'linda';
  text: string;
  timestamp: Date;
}

interface MainChatUIProps {
  lecture: Lecture;
  tokens: number;
  onEarnTokens: (amount: number, message: string) => void;
  onBack: () => void;
}

const senderConfig = {
  user: { name: 'You', color: 'bg-blue-600', textColor: 'text-blue-400', icon: '💬' },
  james: { name: 'James', color: 'bg-red-600', textColor: 'text-red-400', icon: '🔥' },
  linda: { name: 'Linda', color: 'bg-green-600', textColor: 'text-green-400', icon: '🍀' },
};

export function MainChatUI({ lecture, tokens, onEarnTokens, onBack }: MainChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'james',
      text: 'Custom Hooks가 정말 필요할까요? 코드만 복잡해지는 것 아닌가요?',
      timestamp: new Date(),
    },
    {
      id: 2,
      sender: 'linda',
      text: '아니요! Custom Hooks는 로직 재사용성을 높여줍니다. 컴포넌트를 깔끔하게 유지할 수 있어요.',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: 'user',
        text: inputText,
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputText('');

      // Simulate AI responses
      setTimeout(() => {
        setIsAISpeaking(true);
        const aiResponse: Message = {
          id: messages.length + 2,
          sender: Math.random() > 0.5 ? 'james' : 'linda',
          text: Math.random() > 0.5 
            ? '그 관점은 흥미롭네요. 하지만 실제 프로덕션 환경에서는 어떨까요?'
            : '좋은 질문입니다! 제 경험상 Custom Hooks는 팀 협업에도 큰 도움이 됩니다.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
        
        setTimeout(() => {
          setIsAISpeaking(false);
          onEarnTokens(5, '훌륭한 토론 참여!');
        }, 2000);
      }, 1500);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex">
      {/* Left Sidebar - Minimized Curriculum */}
      <aside className="w-64 border-r border-white/10 bg-slate-950/50 backdrop-blur-xl p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>대시보드로</span>
        </button>
        
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">현재 챕터</h3>
          <div className="bg-white/5 border border-cyan-500/50 rounded-xl p-3">
            <p className="text-sm text-white font-medium">Chapter 3</p>
            <p className="text-xs text-gray-400">Custom Hooks Best Practices</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-950/30 to-orange-950/30 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">토큰</span>
            <span className="text-2xl font-bold text-yellow-400">{tokens}</span>
          </div>
          <div className="text-xs text-gray-400">
            토론 중 +5 토큰 획득 가능
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
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

        {/* Messages Area */}
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
                  {/* Avatar (for AI agents on left) */}
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

                  {/* Avatar (for user on right) */}
                  {isUser && (
                    <div className={`w-10 h-10 flex-shrink-0 ${config.color} rounded-full flex items-center justify-center text-xl`}>
                      {config.icon}
                    </div>
                  )}
                </motion.div>
              );
            })}
            
            {/* AI Speaking Indicator */}
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

        {/* Input Area */}
        <div className="border-t border-white/10 bg-slate-950/80 backdrop-blur-xl p-6">
          <div className="max-w-5xl mx-auto">
            {/* Audio Visualizer */}
            {isRecording && (
              <div className="mb-4">
                <AudioVisualizer isActive={isRecording} />
              </div>
            )}

            {/* Input Controls */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleRecording}
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
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="메시지를 입력하거나 음성으로 말해보세요..."
                className="flex-1 bg-white/5 text-white placeholder-gray-400 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-white/10"
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
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
      </main>
    </div>
  );
}
