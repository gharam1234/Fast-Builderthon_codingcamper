'use client'

import { useState, useEffect, useCallback } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { useLiveChat } from '@/hooks/useLiveChat';
import { ScoreBar } from './arena/ScoreBar';
import { BattleView } from './arena/BattleView';
import { LiveChatPanel } from './arena/LiveChatPanel';

interface BattleArenaProps {
  onComplete: () => void;
}

export function BattleArena({ onComplete }: BattleArenaProps) {
  const onTimerComplete = useCallback(() => {
    setTimeout(() => onComplete(), 2000);
  }, [onComplete]);

  const { formattedTime } = useTimer({ initialSeconds: 3000, onComplete: onTimerComplete });
  const { chatMessages, chatInput, setChatInput, handleSendChat } = useLiveChat();

  const [logicScore, setLogicScore] = useState(50);
  const [aiHints, setAiHints] = useState<string[]>([]);

  useEffect(() => {
    const scoreInterval = setInterval(() => {
      setLogicScore(prev => {
        const change = Math.random() > 0.5 ? 5 : -5;
        return Math.max(0, Math.min(100, prev + change));
      });
    }, 3000);

    const hintTimer = setTimeout(() => {
      setAiHints(['상대의 논리에 허점이 있어요!', '지금 구체적 예시를 제시하세요']);
    }, 5000);

    return () => {
      clearInterval(scoreInterval);
      clearTimeout(hintTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-900 flex flex-col">
      <ScoreBar logicScore={logicScore} formattedTime={formattedTime} />
      <BattleView aiHints={aiHints} />
      <LiveChatPanel
        chatMessages={chatMessages}
        chatInput={chatInput}
        onChatInputChange={setChatInput}
        onSendChat={handleSendChat}
      />
    </div>
  );
}
