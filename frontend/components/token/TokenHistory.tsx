// components/token/TokenHistory.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Coins, 
  History, 
  MessageSquare, 
  Star, 
  Flame, 
  Calendar,
  Trophy,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { getTokenTransactions, TokenTransaction } from '@/lib/supabase';
import { getReasonLabel } from '@/lib/tokenService';

interface TokenHistoryProps {
  limit?: number;
  showLoadMore?: boolean;
  className?: string;
}

export function TokenHistory({ 
  limit = 20, 
  showLoadMore = true,
  className = '',
}: TokenHistoryProps) {
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(limit);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTokenTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('토큰 내역 조회 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);
  
  const getReasonIcon = (reason: TokenTransaction['reason']) => {
    switch (reason) {
      case 'debate_participation':
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case 'good_argument':
        return <Star className="w-4 h-4 text-yellow-400" />;
      case 'streak_bonus':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'daily_bonus':
        return <Calendar className="w-4 h-4 text-green-400" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-purple-400" />;
      default:
        return <Coins className="w-4 h-4 text-white/60" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const groupTransactionsByDate = (txs: TokenTransaction[]) => {
    const groups: { [key: string]: TokenTransaction[] } = {};
    
    txs.forEach(tx => {
      const date = new Date(tx.created_at).toLocaleDateString('ko-KR');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(tx);
    });
    
    return groups;
  };
  
  const displayedTransactions = transactions.slice(0, displayCount);
  const hasMore = transactions.length > displayCount;
  const groupedTransactions = groupTransactionsByDate(displayedTransactions);
  
  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <Loader2 className="w-8 h-8 text-white/40 animate-spin mb-3" />
        <p className="text-white/40 text-sm">토큰 내역을 불러오는 중...</p>
      </div>
    );
  }
  
  if (transactions.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <History className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <p className="text-white/60">아직 토큰 내역이 없습니다</p>
        <p className="text-white/40 text-sm mt-1">토론에 참여해서 토큰을 획득해보세요!</p>
      </div>
    );
  }
  
  return (
    <div className={className}>
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-white/60" />
        <h3 className="text-lg font-semibold text-white">토큰 내역</h3>
        <span className="ml-auto text-sm text-white/40">
          총 {transactions.length}건
        </span>
      </div>
      
      {/* 내역 리스트 */}
      <div className="space-y-4">
        {Object.entries(groupedTransactions).map(([date, txs]) => (
          <div key={date}>
            {/* 날짜 구분 */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-white/40 px-2">{date}</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            
            {/* 해당 날짜의 트랜잭션들 */}
            <div className="space-y-2">
              {txs.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg 
                            hover:bg-white/10 transition-colors"
                >
                  {/* 아이콘 */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 
                                flex items-center justify-center">
                    {getReasonIcon(tx.reason)}
                  </div>
                  
                  {/* 설명 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {getReasonLabel(tx.reason)}
                    </p>
                    <p className="text-xs text-white/40">
                      {formatDate(tx.created_at)}
                    </p>
                  </div>
                  
                  {/* 토큰 양 */}
                  <div className="flex-shrink-0">
                    <span className={`font-bold ${
                      tx.amount >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* 더 보기 버튼 */}
      {showLoadMore && hasMore && (
        <button
          onClick={() => setDisplayCount(prev => prev + limit)}
          className="w-full mt-4 py-3 flex items-center justify-center gap-2
                    text-white/60 hover:text-white hover:bg-white/5 
                    rounded-lg transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
          더 보기 ({transactions.length - displayCount}건 남음)
        </button>
      )}
    </div>
  );
}

// 컴팩트 버전 (요약용)
export function TokenHistoryCompact({ limit = 5 }: { limit?: number }) {
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTokenTransactions();
        setTransactions(data.slice(0, limit));
      } catch (error) {
        console.error('토큰 내역 조회 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [limit]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
      </div>
    );
  }
  
  if (transactions.length === 0) {
    return (
      <p className="text-center text-white/40 text-sm py-4">
        토큰 내역 없음
      </p>
    );
  }
  
  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between text-sm"
        >
          <span className="text-white/60 truncate flex-1">
            {getReasonLabel(tx.reason)}
          </span>
          <span className={`font-medium ml-2 ${
            tx.amount >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {tx.amount >= 0 ? '+' : ''}{tx.amount}
          </span>
        </div>
      ))}
    </div>
  );
}
