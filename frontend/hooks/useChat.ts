import { useState, useRef, useEffect, useCallback } from 'react';
import type { Lecture, Message, MessageSender } from '@/types';

const initialMessages: Message[] = [];

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
const DEBATE_API_BASE = API_BASE_URL.endsWith('/api/v1')
  ? API_BASE_URL
  : `${API_BASE_URL}/api/v1`;

const buildDebateUrl = (path: string) => `${DEBATE_API_BASE}${path}`;

interface DebateStartResponse {
  session_id: string;
}

interface DebateMessageResponse {
  james_response: string;
  linda_response: string;
  tokens_earned: number;
}

interface UseChatOptions {
  lecture?: Lecture;
  onEarnTokens: (amount: number, message: string) => void;
}

export function useChat({ lecture, onEarnTokens }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string | null>(null);
  const nextIdRef = useRef(initialMessages.length + 1);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createMessage = useCallback((sender: MessageSender, text: string): Message => {
    const message: Message = {
      id: nextIdRef.current,
      sender,
      text,
      timestamp: new Date(),
    };
    nextIdRef.current += 1;
    return message;
  }, []);

  const requestJson = useCallback(async <T,>(url: string, options: RequestInit): Promise<T> => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const message = error?.detail || error?.error || error?.message || `API Error: ${response.status}`;
      throw new Error(message);
    }

    return response.json() as Promise<T>;
  }, []);

  const ensureSession = useCallback(async () => {
    if (sessionIdRef.current) {
      return sessionIdRef.current;
    }

    const topic = lecture?.title || '자유 토론';
    const response = await requestJson<DebateStartResponse>(
      buildDebateUrl('/debate/start'),
      {
        method: 'POST',
        body: JSON.stringify({
          topic,
          user_position: 'pro',
        }),
      }
    );

    sessionIdRef.current = response.session_id;
    return response.session_id;
  }, [lecture?.title, requestJson]);

  const handleSendMessage = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const userMessage = createMessage('user', trimmed);
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsAISpeaking(true);

    try {
      const sessionId = await ensureSession();
      const lectureContext = lecture ? `${lecture.title} - ${lecture.description}` : '';

      const response = await requestJson<DebateMessageResponse>(
        buildDebateUrl('/debate/message'),
        {
          method: 'POST',
          body: JSON.stringify({
            session_id: sessionId,
            user_message: trimmed,
            lecture_context: lectureContext,
          }),
        }
      );

      setMessages(prev => [
        ...prev,
        createMessage('james', response.james_response),
        createMessage('linda', response.linda_response),
      ]);

      onEarnTokens(response.tokens_earned, '토론 참여 보상!');
    } catch (error) {
      console.error('Debate message error:', error);
    } finally {
      setIsAISpeaking(false);
    }
  }, [createMessage, ensureSession, inputText, lecture, onEarnTokens, requestJson]);

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
