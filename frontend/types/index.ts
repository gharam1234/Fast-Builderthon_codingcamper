// ===== Lecture & Curriculum =====

export interface CurriculumItem {
  id: number;
  title: string;
  duration: string;
  completed?: boolean;
  current?: boolean;
}

export type LectureLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Lecture {
  id: number;
  title: string;
  instructor: string;
  category: string;
  level: LectureLevel;
  students: number;
  rating: number;
  duration: string;
  thumbnail: string;
  description: string;
  curriculum: CurriculumItem[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

// ===== Chat & Debate =====

export type MessageSender = 'user' | 'james' | 'linda';

export interface Message {
  id: number;
  sender: MessageSender;
  text: string;
  timestamp: Date;
}

export interface SenderConfig {
  name: string;
  color: string;
  textColor: string;
  icon: string;
}

// ===== Voice Recognition (STT) =====

export interface VoiceRecognitionState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
}

export interface VoiceRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxDuration?: number;
  silenceTimeout?: number;
  onTranscriptChange?: (transcript: string) => void;
  onListeningEnd?: (finalTranscript: string) => void;
}

export type VoiceRecognitionErrorCode =
  | 'not-allowed'
  | 'no-speech'
  | 'network'
  | 'aborted'
  | 'audio-capture'
  | 'service-not-allowed';

// ===== Battle Arena =====

export interface ChatMessage {
  id: number;
  user: string;
  text: string;
  emoji?: string;
}

export type TeamType = 'yeoul' | 'challenger';

// ===== Token & Reward =====

export interface TokenReward {
  amount: number;
  message: string;
}
