import { useState, useCallback } from 'react';
import type { Message, MessageSender } from '@/types';

const initialMessages: Message[] = [
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
];

const aiResponses = [
  '그 관점은 흥미롭네요. 하지만 실제 프로덕션 환경에서는 어떨까요?',
  '좋은 질문입니다! 제 경험상 Custom Hooks는 팀 협업에도 큰 도움이 됩니다.',
];

interface UseChatOptions {
  onEarnTokens: (amount: number, message: string) => void;
}

export function useChat({ onEarnTokens }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  const handleSendMessage = useCallback(() => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      text: inputText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate AI responses
    setTimeout(() => {
      setIsAISpeaking(true);
      const sender: MessageSender = Math.random() > 0.5 ? 'james' : 'linda';
      const text = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      const aiResponse: Message = {
        id: messages.length + 2,
        sender,
        text,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);

      setTimeout(() => {
        setIsAISpeaking(false);
        onEarnTokens(5, '훌륭한 토론 참여!');
      }, 2000);
    }, 1500);
  }, [inputText, messages.length, onEarnTokens]);

  const toggleRecording = useCallback(() => {
    setIsRecording(prev => !prev);
  }, []);

  return {
    messages,
    inputText,
    setInputText,
    isRecording,
    isAISpeaking,
    handleSendMessage,
    toggleRecording,
  };
}
