// components/token/Leaderboard.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, User, Loader2 } from 'lucide-react';
import { getLeaderboard, LeaderboardEntry, getCurrentUser } from '@/lib/supabase';

type Period = 'weekly' | 'monthly' | 'all';

interface LeaderboardProps {
  initialPeriod?: Period;
  limit?: number;
  showPeriodSelector?: boolean;
  className?: string;
}

export function Leaderboard({ 
  initialPeriod = 'weekly',
  limit = 10,
  showPeriodSelector = true,
  className = '',
}: LeaderboardProps) {
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [{ leaderboard }, user] = await Promise.all([
          getLeaderboard(limit, 0, period),
          getCurrentUser(),
        ]);
        setEntries(leaderboard);
        setCurrentUserId(user?.id ?? null);
      } catch (error) {
        console.error('리더보드 조회 오류:', error);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period, limit]);
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-300" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 text-center font-bold text-white/60">{rank}</span>;
    }
  };
  
  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3: return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/30';
      default: return 'bg-white/5 border-white/10';
    }
  };
  
  const getPeriodLabel = (p: Period) => {
    switch (p) {
      case 'weekly': return '주간';
      case 'monthly': return '월간';
      case 'all': return '전체';
    }
  };
  
  return (
    <div className={`w-full ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">리더보드</h2>
        </div>
        
        {/* 기간 선택 */}
        {showPeriodSelector && (
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {(['weekly', 'monthly', 'all'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                  ${period === p 
                    ? 'bg-cyan-500 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
              >
                {getPeriodLabel(p)}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 리스트 */}
      <div className="space-y-2">
        {loading ? (
          // 로딩 상태
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-white/40 animate-spin mb-3" />
            <p className="text-white/40 text-sm">랭킹을 불러오는 중...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/60">아직 랭킹 데이터가 없습니다</p>
            <p className="text-white/40 text-sm mt-1">토론에 참여해서 첫 번째가 되어보세요!</p>
          </div>
        ) : (
          entries.map((entry, index) => {
            const isCurrentUser = entry.user_id === currentUserId;
            
            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-all
                  duration-200 hover:scale-[1.02] ${getRankBg(entry.rank)}
                  ${isCurrentUser ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-900' : ''}`}
              >
                {/* 순위 */}
                <div className="flex-shrink-0 w-8 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                
                {/* 아바타 */}
                <div className="flex-shrink-0">
                  {entry.avatar_url ? (
                    <img
                      src={entry.avatar_url}
                      alt={entry.username || '유저'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/10"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/10">
                      <User className="w-5 h-5 text-white/60" />
                    </div>
                  )}
                </div>
                
                {/* 유저 정보 */}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${isCurrentUser ? 'text-cyan-400' : 'text-white'}`}>
                    {entry.username || '익명'}
                    {isCurrentUser && <span className="ml-2 text-xs text-cyan-400/70">(나)</span>}
                  </p>
                  <p className="text-sm text-white/50">
                    토론 {entry.debate_count}회
                  </p>
                </div>
                
                {/* 토큰 */}
                <div className="flex-shrink-0 text-right">
                  <p className="font-bold text-yellow-400">
                    {entry.total_tokens.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/40">토큰</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

// 컴팩트 버전 (사이드바용)
export function LeaderboardCompact({ limit = 5 }: { limit?: number }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { leaderboard } = await getLeaderboard(limit, 0, 'weekly');
        setEntries(leaderboard);
      } catch (error) {
        console.error('리더보드 조회 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [limit]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
      </div>
    );
  }
  
  if (entries.length === 0) {
    return (
      <p className="text-center text-white/40 text-sm py-4">
        랭킹 데이터 없음
      </p>
    );
  }
  
  return (
    <div className="space-y-2">
      {entries.slice(0, limit).map((entry, index) => (
        <div
          key={entry.user_id}
          className="flex items-center gap-2 text-sm"
        >
          <span className={`w-5 text-center font-bold ${
            index === 0 ? 'text-yellow-400' :
            index === 1 ? 'text-gray-300' :
            index === 2 ? 'text-amber-600' :
            'text-white/40'
          }`}>
            {index + 1}
          </span>
          <span className="flex-1 truncate text-white/80">
            {entry.username || '익명'}
          </span>
          <span className="text-yellow-400 font-medium">
            {entry.total_tokens.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
