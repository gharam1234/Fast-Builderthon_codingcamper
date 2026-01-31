'use client'

import { useChat } from '@/hooks/useChat';
import { ChatSidebar } from './chat/ChatSidebar';
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessages } from './chat/ChatMessages';
import { ChatInput } from './chat/ChatInput';
import type { Lecture, SenderConfig } from '@/types';

interface MainChatUIProps {
  lecture: Lecture;
  tokens: number;
  onEarnTokens: (amount: number, message: string) => void;
  onBack: () => void;
}

const senderConfig: Record<string, SenderConfig> = {
  user: { name: 'You', color: 'bg-blue-600', textColor: 'text-blue-400', icon: '💬' },
  james: { name: 'James', color: 'bg-red-600', textColor: 'text-red-400', icon: '🔥' },
  linda: { name: 'Linda', color: 'bg-green-600', textColor: 'text-green-400', icon: '🍀' },
};

export function MainChatUI({ lecture, tokens, onEarnTokens, onBack }: MainChatUIProps) {
  const {
    messages,
    inputText,
    setInputText,
    isRecording,
    isAISpeaking,
    handleSendMessage,
    toggleRecording,
  } = useChat({ onEarnTokens });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex">
      <ChatSidebar tokens={tokens} onBack={onBack} />

      <main className="flex-1 flex flex-col">
        <ChatHeader />

        <ChatMessages
          messages={messages}
          senderConfig={senderConfig}
          isAISpeaking={isAISpeaking}
        />

        <ChatInput
          inputText={inputText}
          isRecording={isRecording}
          onInputChange={setInputText}
          onSendMessage={handleSendMessage}
          onToggleRecording={toggleRecording}
        />
      </main>
    </div>
  );
}
