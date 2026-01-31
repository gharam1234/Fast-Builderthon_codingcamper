'use client'

import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatSidebar } from './chat/ChatSidebar';
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessages } from './chat/ChatMessages';
import { ChatInput } from './chat/ChatInput';
import { DebateReportModal } from './debate/DebateReportModal';
import type { Lecture, SenderConfig } from '@/types';
import { useAuth } from '@/components/providers/AuthProvider';

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
  const { user } = useAuth();
  const {
    messages,
    inputText,
    setInputText,
    isRecording,
    isAISpeaking,
    handleSendMessage,
    toggleRecording,
    generateReport,
  } = useChat({ lecture, onEarnTokens, userId: user?.id || null });
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [report, setReport] = useState<{
    logic_score: number;
    persuasion_score: number;
    topic_score: number;
    summary: string;
    improvement_tips: string[];
    ocr_alignment_score?: number | null;
    ocr_feedback?: string | null;
  } | null>(null);

  const handleEndDebate = async () => {
    setIsReportOpen(true);
    setIsGeneratingReport(true);
    try {
      const result = await generateReport();
      setReport(result);
    } catch (error) {
      console.error('리포트 생성 실패:', error);
      setReport(null);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex">
      <ChatSidebar tokens={tokens} onBack={onBack} />

      <main className="flex-1 flex flex-col">
        <ChatHeader onEndDebate={handleEndDebate} isEnding={isGeneratingReport} />

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

      <DebateReportModal
        isOpen={isReportOpen}
        isLoading={isGeneratingReport}
        report={report}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}
