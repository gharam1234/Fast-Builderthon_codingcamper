'use client'

import { Mic, MicOff, Send, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioVisualizer } from '../AudioVisualizer';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useEffect, useCallback } from 'react';

interface ChatInputProps {
  inputText: string;
  isRecording: boolean;
  onInputChange: (text: string) => void;
  onSendMessage: () => void;
  onToggleRecording: () => void;
}

export function ChatInput({
  inputText,
  isRecording,
  onInputChange,
  onSendMessage,
  onToggleRecording,
}: ChatInputProps) {
  // 음성 인식 Hook
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    error: sttError,
    isSupported: isSttSupported,
  } = useVoiceRecognition({
    language: 'ko-KR',
    continuous: true,
    interimResults: true,
    maxDuration: 60,
    silenceTimeout: 3,
  });

  // 최종 transcript가 변경되면 inputText에 반영
  useEffect(() => {
    if (transcript) {
      onInputChange(transcript);
    }
  }, [transcript, onInputChange]);

  // 녹음 토글 핸들러
  const handleToggleRecording = useCallback(() => {
    if (!isSttSupported) {
      // STT 미지원 시 기존 토글 동작
      onToggleRecording();
      return;
    }

    if (isListening) {
      stopListening();
      // 음성 인식 종료 후 텍스트가 있으면 자동 전송
      if (transcript || interimTranscript) {
        const finalText = transcript || interimTranscript;
        onInputChange(finalText);
        setTimeout(() => {
          onSendMessage();
          resetTranscript();
        }, 100);
      }
    } else {
      resetTranscript();
      onInputChange('');
      startListening();
    }
  }, [
    isSttSupported,
    isListening,
    transcript,
    interimTranscript,
    stopListening,
    startListening,
    resetTranscript,
    onInputChange,
    onSendMessage,
    onToggleRecording,
  ]);

  // Long press 핸들러
  const handleMouseDown = useCallback(() => {
    if (!isSttSupported) return;
    resetTranscript();
    onInputChange('');
    startListening();
  }, [isSttSupported, resetTranscript, onInputChange, startListening]);

  const handleMouseUp = useCallback(() => {
    if (!isSttSupported || !isListening) return;
    stopListening();
    // 텍스트가 있으면 자동 전송
    const finalText = transcript || interimTranscript;
    if (finalText) {
      onInputChange(finalText);
      setTimeout(() => {
        onSendMessage();
        resetTranscript();
      }, 100);
    }
  }, [
    isSttSupported,
    isListening,
    transcript,
    interimTranscript,
    stopListening,
    onInputChange,
    onSendMessage,
    resetTranscript,
  ]);

  // 현재 표시할 텍스트
  const displayText = isListening
    ? (transcript + (interimTranscript ? ` ${interimTranscript}` : '')).trim()
    : inputText;

  const isActiveRecording = isListening || isRecording;

  return (
    <div className="border-t border-white/10 bg-slate-950/80 backdrop-blur-xl p-6">
      <div className="max-w-5xl mx-auto">
        {/* 오디오 시각화 */}
        {isActiveRecording && (
          <div className="mb-4">
            <AudioVisualizer isActive={isActiveRecording} speaker={null} />
          </div>
        )}

        {/* 실시간 음성 인식 미리보기 */}
        <AnimatePresence>
          {isListening && (transcript || interimTranscript) && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="mb-4 bg-cyan-600/10 border border-cyan-500/20 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-xs text-cyan-400 font-medium">실시간 음성 인식</span>
              </div>
              <p className="text-white/90">
                {transcript}
                {interimTranscript && (
                  <span className="text-white/50 italic">{` ${interimTranscript}`}</span>
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 에러 메시지 */}
        <AnimatePresence>
          {sttError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{sttError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4">
          {/* 마이크 버튼 - Long Press 지원 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleRecording}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            className={`p-4 rounded-xl transition-all select-none touch-none ${
              isActiveRecording
                ? 'bg-red-600 hover:bg-red-500 glow-red'
                : 'bg-cyan-600 hover:bg-cyan-500'
            }`}
            aria-label={isActiveRecording ? '녹음 중지' : '음성 녹음'}
          >
            {isActiveRecording ? (
              <MicOff className="text-white" size={24} />
            ) : (
              <Mic className="text-white" size={24} />
            )}
          </motion.button>

          <input
            type="text"
            value={displayText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' || e.isComposing || e.nativeEvent.isComposing) {
                return;
              }
              e.preventDefault();
              onSendMessage();
            }}
            placeholder={
              isListening
                ? '듣고 있습니다... 말씀해주세요'
                : '메시지를 입력하거나 음성으로 말해보세요...'
            }
            className={`flex-1 bg-white/5 text-white placeholder-gray-400 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 border transition-all ${
              isListening
                ? 'focus:ring-cyan-500/50 border-cyan-500/30 bg-cyan-500/5'
                : 'focus:ring-cyan-500/50 border-white/10'
            }`}
            disabled={isListening}
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSendMessage}
            className="p-4 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all"
            aria-label="메시지 전송"
          >
            <Send className="text-white" size={24} />
          </motion.button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-500">
            {isListening
              ? '버튼에서 손을 떼면 자동으로 전송됩니다'
              : isSttSupported
              ? 'Tip: 마이크 버튼을 누르고 있으면 음성으로 입력할 수 있습니다'
              : 'Tip: 음성 인식이 지원되지 않는 브라우저입니다'}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>참여자: 3명</span>
            <span>•</span>
            <span>진행 시간: 12:34</span>
          </div>
        </div>
      </div>
    </div>
  );
}
