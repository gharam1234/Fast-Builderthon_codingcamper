'use client';

import { useState } from 'react';
import { HomePage } from '@/components/HomePage';
import { LectureListPage } from '@/components/LectureListPage';
import { CourseDashboard } from '@/components/CourseDashboard';
import { MainChatUI } from '@/components/MainChatUI';
import { StrategyRoom } from '@/components/StrategyRoom';
import { AudienceLobby } from '@/components/AudienceLobby';
import { BattleArena } from '@/components/BattleArena';
import { VictoryScreen } from '@/components/VictoryScreen';
import { TokenRewardPopup } from '@/components/TokenRewardPopup';
import { Lecture } from '@/data/mockData';

type View =
  | 'home'
  | 'lecture-list'
  | 'dashboard'
  | 'debate'
  | 'arena-strategy'
  | 'arena-audience'
  | 'arena-battle'
  | 'arena-victory';

export default function Page() {
  const [view, setView] = useState<View>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tokens, setTokens] = useState(120);
  const [showReward, setShowReward] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [rewardMessage, setRewardMessage] = useState('');

  const handleEarnTokens = (amount: number, message: string) => {
    setTokens((prev) => prev + amount);
    setRewardAmount(amount);
    setRewardMessage(message);
    setShowReward(true);

    setTimeout(() => {
      setShowReward(false);
    }, 3000);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
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
    setView('arena-strategy');
  };

  const handleStrategyComplete = () => {
    setView('arena-battle');
  };

  const handleBattleComplete = () => {
    setView('arena-victory');
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
          onLogin={handleLogin}
          onCategoryClick={handleCategoryClick}
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
        <StrategyRoom onComplete={handleStrategyComplete} />
      )}

      {view === 'arena-audience' && (
        <AudienceLobby onSelectTeam={() => setView('arena-battle')} />
      )}

      {view === 'arena-battle' && (
        <BattleArena onComplete={handleBattleComplete} />
      )}

      {view === 'arena-victory' && (
        <VictoryScreen onClose={handleVictoryClose} />
      )}

      <TokenRewardPopup
        show={showReward}
        amount={rewardAmount}
        message={rewardMessage}
      />
    </div>
  );
}
