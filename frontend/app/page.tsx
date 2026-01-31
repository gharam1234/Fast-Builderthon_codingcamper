'use client';

import { useState, useEffect } from 'react';
import { HomePage } from '@/components/HomePage';
import { LectureListPage } from '@/components/LectureListPage';
import { CourseDashboard } from '@/components/CourseDashboard';
import { MainChatUI } from '@/components/MainChatUI';
import { StrategyRoom } from '@/components/StrategyRoom';
import { AudienceLobby } from '@/components/AudienceLobby';
import { BattleArena } from '@/components/BattleArena';
import { VictoryScreen } from '@/components/VictoryScreen';
import { TokenRewardPopup } from '@/components/TokenRewardPopup';
import { OCRHistoryPage } from '@/components/OCRHistoryPage';
import { useAuth } from '@/components/providers/AuthProvider';
import { Lecture } from '@/data/mockData';
import { createLiveBattleRoom } from '@/lib/supabase';

type View =
  | 'home'
  | 'lecture-list'
  | 'dashboard'
  | 'debate'
  | 'arena-strategy'
  | 'arena-audience'
  | 'arena-battle'
  | 'arena-victory'
  | 'ocr-history';

export default function Page() {
  const { isLoggedIn } = useAuth();
  const [view, setView] = useState<View>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [tokens, setTokens] = useState(120);
  const [showReward, setShowReward] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [rewardMessage, setRewardMessage] = useState('');
  const [arenaRoomId, setArenaRoomId] = useState<string>('');

  const persistArenaRoomId = (roomId: string) => {
    setArenaRoomId(roomId);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('arena-room-id', roomId);
    }
  };

  const ensureArenaRoomId = () => {
    if (arenaRoomId) return arenaRoomId;
    const newRoomId = `arena-${crypto.randomUUID()}`;
    persistArenaRoomId(newRoomId);
    return newRoomId;
  };

  const handleEarnTokens = (amount: number, message: string) => {
    setTokens((prev) => prev + amount);
    setRewardAmount(amount);
    setRewardMessage(message);
    setShowReward(true);

    setTimeout(() => {
      setShowReward(false);
    }, 3000);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setView('lecture-list');
  };

  const handleLectureClick = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    setView('dashboard');
  };

  const handleStartDebate = () => {
    setView('debate');
  };

  const handleStartArena = () => {
    ensureArenaRoomId();
    setView('arena-strategy');
  };

  const handleStrategyComplete = async () => {
    const room = await createLiveBattleRoom('라이브 토론 배틀');
    const roomId = room?.id || ensureArenaRoomId();
    persistArenaRoomId(roomId);
    setView('arena-battle');
  };

  const handleBattleComplete = () => {
    setView('arena-audience');
    handleEarnTokens(50, '라이브 배틀 승리!');
  };

  const handleVictoryClose = () => {
    setView('dashboard');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
  };

  const handleBackToList = () => {
    setView('lecture-list');
  };

  const handleBackToHome = () => {
    setView('home');
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {view === 'home' && (
        <HomePage
          isLoggedIn={isLoggedIn}
          onLogin={handleBackToHome}
          onCategoryClick={handleCategoryClick}
          onViewOCRHistory={() => setView('ocr-history')}
        />
      )}

      {view === 'lecture-list' && (
        <LectureListPage
          category={selectedCategory}
          onLectureClick={handleLectureClick}
          onBack={handleBackToHome}
        />
      )}

      {view === 'dashboard' && selectedLecture && (
        <CourseDashboard
          lecture={selectedLecture}
          tokens={tokens}
          onStartDebate={handleStartDebate}
          onStartArena={handleStartArena}
          onBack={handleBackToList}
        />
      )}

      {view === 'debate' && selectedLecture && (
        <MainChatUI
          lecture={selectedLecture}
          tokens={tokens}
          onEarnTokens={handleEarnTokens}
          onBack={handleBackToDashboard}
        />
      )}

      {view === 'arena-strategy' && (
        <StrategyRoom onComplete={handleStrategyComplete} onBack={() => setView('dashboard')} />
      )}

      {view === 'arena-audience' && (
        <AudienceLobby onSelectRoom={(roomId) => {
          persistArenaRoomId(roomId);
          setView('arena-battle');
        }} />
      )}

      {view === 'arena-battle' && (
        <BattleArena
          onComplete={handleBattleComplete}
          roomId={arenaRoomId || 'battle-arena'}
          onBack={() => setView('arena-strategy')}
        />
      )}

      {view === 'arena-victory' && (
        <VictoryScreen onClose={handleVictoryClose} />
      )}

      {view === 'ocr-history' && (
        <OCRHistoryPage onBack={() => setView('home')} />
      )}

      <TokenRewardPopup
        show={showReward}
        amount={rewardAmount}
        message={rewardMessage}
      />
    </div>
  );
}
