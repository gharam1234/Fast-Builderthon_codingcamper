'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HomePage } from '@/components/HomePage';
import { TokenRewardPopup } from '@/components/TokenRewardPopup';
import { OCRHistoryPage } from '@/components/OCRHistoryPage';
import { useAuth } from '@/components/providers/AuthProvider';
import { getCurrentProfile } from '@/lib/supabase';

export default function Page() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [tokens, setTokens] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [rewardMessage, setRewardMessage] = useState('');
  const [showOCRHistory, setShowOCRHistory] = useState(false);

  // DB에서 토큰 동기화
  useEffect(() => {
    const syncTokens = async () => {
      const profile = await getCurrentProfile();
      if (profile) {
        setTokens(profile.total_tokens);
      }
    };
    if (isLoggedIn) {
      syncTokens();
    }
  }, [isLoggedIn]);

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/lectures?category=${categoryId}`);
  };

  const handleViewOCRHistory = () => {
    setShowOCRHistory(true);
  };

  if (showOCRHistory) {
    return (
      <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <OCRHistoryPage onBack={() => setShowOCRHistory(false)} />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <HomePage
        isLoggedIn={isLoggedIn}
        onCategoryClick={handleCategoryClick}
        onViewOCRHistory={handleViewOCRHistory}
      />

      <TokenRewardPopup
        show={showReward}
        amount={rewardAmount}
        message={rewardMessage}
      />
    </div>
  );
}
