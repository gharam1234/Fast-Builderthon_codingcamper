'use client'

import { useEffect, useCallback } from 'react';
import { useChat } from '@/hooks/useChat';
import { useSuggestions } from '@/hooks/useSuggestions';
import { ChatSidebar } from './chat/ChatSidebar';
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessages } from './chat/ChatMessages';
import { ChatInput } from './chat/ChatInput';
import { SuggestionChips } from './chat/SuggestionChips';
import { AudioVisualizer } from './AudioVisualizer';
import type { Lecture, SenderConfig } from '@/types';
import type { Suggestion } from '@/lib/api';

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
    isTtsPlaying,
    isTtsLoading,
    currentSpeaker,
    messagesEndRef,
    handleSendMessage,
    sendMessageWithText,
    getSessionId,
    toggleRecording,
  } = useChat({ lecture, onEarnTokens });

  // 추천 시스템 Hook
  const {
    suggestions,
    isLoading: isSuggestionsLoading,
    fetchSuggestions,
    removeSuggestion,
    updateContext,
    currentType,
  } = useSuggestions({
    sessionId: getSessionId() || 'temp-session',
    topic: lecture?.title,
    userPosition: 'pro',
    lectureContext: lecture ? `${lecture.title} - ${lecture.description}` : '',
    autoRefreshInterval: 30000, // 30초 무응답 시 자동 갱신
  });

  // 초기 추천 로드 (토론 시작 시 질문 추천)
  useEffect(() => {
    if (getSessionId()) {
      fetchSuggestions('question');
    }
  }, [getSessionId, fetchSuggestions]);

  // 추천 버튼 클릭 핸들러
  const handleSuggestionSelect = useCallback(async (suggestion: Suggestion) => {
    // 선택한 추천 제거 (페이드아웃)
    removeSuggestion(suggestion.id);
    
    // 바로 메시지 전송
    const response = await sendMessageWithText(suggestion.text);
    
    // AI 응답으로 컨텍스트 업데이트 후 새 추천 로드
    if (response) {
      updateContext(response.jamesResponse, response.lindaResponse);
      // 약간의 딜레이 후 새 추천 로드
      setTimeout(() => {
        fetchSuggestions(currentType === 'topic' ? 'question' : currentType || 'question');
      }, 500);
    }
  }, [removeSuggestion, sendMessageWithText, updateContext, fetchSuggestions, currentType]);

  // 추천 유형 변경 핸들러
  const handleTypeChange = useCallback((type: 'topic' | 'question' | 'argument') => {
    fetchSuggestions(type);
  }, [fetchSuggestions]);

  // 추천 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    fetchSuggestions(currentType || 'question');
  }, [fetchSuggestions, currentType]);

  // 일반 메시지 전송 후 추천 갱신
  const handleSendMessageWithSuggestions = useCallback(async () => {
    const response = await handleSendMessage();
    if (response) {
      updateContext(response.jamesResponse, response.lindaResponse);
      setTimeout(() => {
        fetchSuggestions(currentType || 'question');
      }, 500);
    }
  }, [handleSendMessage, updateContext, fetchSuggestions, currentType]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex">
      <ChatSidebar tokens={tokens} onBack={onBack} />

      <main className="flex-1 flex flex-col">
        <ChatHeader />

        <AudioVisualizer
          isActive={isTtsPlaying || isTtsLoading}
          speaker={currentSpeaker}
        />

        <ChatMessages
          messages={messages}
          senderConfig={senderConfig}
          isAISpeaking={isAISpeaking}
        />

        {/* 추천 버튼 영역 */}
        <SuggestionChips
          suggestions={suggestions}
          isLoading={isSuggestionsLoading}
          currentType={currentType}
          onSelect={handleSuggestionSelect}
          onRefresh={handleRefresh}
          onTypeChange={handleTypeChange}
        />

        <ChatInput
          inputText={inputText}
          isRecording={isRecording}
          onInputChange={setInputText}
          onSendMessage={handleSendMessageWithSuggestions}
          onToggleRecording={toggleRecording}
        />
      </main>
    </div>
  );
}
