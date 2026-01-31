import { useState, useEffect, useCallback } from 'react';
import type { ChatMessage } from '@/types';

const initialChatMessages: ChatMessage[] = [
  { id: 1, user: '관객1', text: '시작했다!', emoji: '🔥' },
  { id: 2, user: '관객2', text: '팀 여울 파이팅!', emoji: '💙' },
];

interface UseLiveChatOptions {
  simulateMessages?: boolean;
  simulateInterval?: number;
}

export function useLiveChat({
  simulateMessages = true,
  simulateInterval = 4000,
}: UseLiveChatOptions = {}) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    // Auto-scroll would happen in LiveChatPanel instead
  }, [chatMessages]);

  useEffect(() => {
    if (!simulateMessages) return;

    const emojis = ['🔥', '❤️', '👍', '⚡'];
    const texts = ['좋은 포인트!', '설득력 있네요', '와!', '대박'];

    const chatTimer = setInterval(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          user: `관객${Math.floor(Math.random() * 100)}`,
          text: texts[Math.floor(Math.random() * texts.length)],
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
        },
      ]);
    }, simulateInterval);

    return () => clearInterval(chatTimer);
  }, [simulateMessages, simulateInterval]);

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      { id: Date.now(), user: 'You', text: chatInput },
    ]);
    setChatInput('');
  }, [chatInput]);

  return {
    chatMessages,
    chatInput,
    setChatInput,
    handleSendChat,
  };
}
