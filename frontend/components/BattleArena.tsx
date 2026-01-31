'use client'

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Heart, ThumbsUp, Zap, MessageCircle, Send } from 'lucide-react';

interface BattleArenaProps {
  onComplete: () => void;
}

interface ChatMessage {
  id: number;
  user: string;
  text: string;
  emoji?: string;
}

export function BattleArena({ onComplete }: BattleArenaProps) {
  const [logicScore, setLogicScore] = useState(50); // 50 = balanced
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, user: '관객1', text: '시작했다!', emoji: '🔥' },
    { id: 2, user: '관객2', text: '팀 여울 파이팅!', emoji: '💙' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiHints, setAiHints] = useState<string[]>([]);
  const [battleTime, setBattleTime] = useState(3000); // 50 minutes = 3000 seconds
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Battle timer
    const timer = setInterval(() => {
      setBattleTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Simulate logic score changes
    const scoreInterval = setInterval(() => {
      setLogicScore(prev => {
        const change = Math.random() > 0.5 ? 5 : -5;
        return Math.max(0, Math.min(100, prev + change));
      });
    }, 3000);

    // Simulate AI hints
    const hintTimer = setTimeout(() => {
      setAiHints(['상대의 논리에 허점이 있어요!', '지금 구체적 예시를 제시하세요']);
    }, 5000);

    // Simulate chat messages
    const chatTimer = setInterval(() => {
      const emojis = ['🔥', '❤️', '👍', '⚡'];
      const texts = ['좋은 포인트!', '설득력 있네요', '와!', '대박'];
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        user: `관객${Math.floor(Math.random() * 100)}`,
        text: texts[Math.floor(Math.random() * texts.length)],
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      }]);
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(scoreInterval);
      clearInterval(chatTimer);
      clearTimeout(hintTimer);
    };
  }, [onComplete]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendChat = () => {
    if (chatInput.trim()) {
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        user: 'You',
        text: chatInput,
      }]);
      setChatInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-900 flex flex-col">
      {/* Top Bar - Logic Score */}
      <div className="bg-slate-950/80 backdrop-blur-xl border-b border-white/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="text-cyan-400 font-bold">Team Yeoul 🌊</div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Real-time Logic Score</div>
              <div className="text-2xl font-bold text-white">{formatTime(battleTime)}</div>
            </div>
            <div className="text-red-400 font-bold">Team Challenger ⚔️</div>
          </div>

          {/* Tug-of-war Gauge */}
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

      {/* Main Battle Area */}
      <div className="flex-1 flex">
        {/* Left - User Side */}
        <div className="flex-1 border-r-4 border-cyan-500/50 bg-gradient-to-br from-cyan-950/20 to-transparent p-8">
          <div className="h-full flex flex-col">
            {/* User Video */}
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

            {/* AI Hints (Private) */}
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
            {/* Opponent Video */}
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

      {/* Right Sidebar - Live Chat */}
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

        {/* Chat Messages */}
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

        {/* Chat Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="채팅 입력..."
              className="flex-1 bg-white/5 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/10"
            />
            <button
              onClick={handleSendChat}
              className="bg-purple-600 hover:bg-purple-500 p-2 rounded-lg transition-colors"
            >
              <Send className="text-white" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
