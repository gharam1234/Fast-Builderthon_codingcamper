'use client'

import { useEffect, useMemo, useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  PlayCircle,
  ArrowLeft,
  Settings,
  Bell,
  Shield,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { lectures } from '@/data/mockData';
import type { DebateSession, Profile, TokenTransaction } from '@/lib/supabase';
import { getCurrentProfile, getTokenTransactions, getUserDebateSessions, getUserStats } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';

interface Course {
  id: string;
  title: string;
  instructor: string;
  institution: string;
  thumbnail: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'active' | 'completed' | 'upcoming';
}

interface MyPageProps {
  onBack: () => void;
}

export function MyPage({ onBack }: MyPageProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('active');
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<{
    total_tokens: number;
    total_debates: number;
    completed_debates: number;
    total_messages: number;
    global_rank: number;
  } | null>(null);
  const [sessions, setSessions] = useState<DebateSession[]>([]);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(/\. /g, '-').replace('.', '');
  };

  const formatRelativeTime = (dateString: string) => {
    const now = Date.now();
    const target = new Date(dateString).getTime();
    const diffMinutes = Math.floor((now - target) / 60000);

    if (Number.isNaN(diffMinutes) || diffMinutes < 0) return '방금 전';
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}일 전`;
  };

  const getEstimatedProgress = (startMs: number, nowMs: number) => {
    if (!Number.isFinite(startMs)) return 10;
    const durationMs = 30 * 24 * 60 * 60 * 1000;
    const progress = Math.floor(((nowMs - startMs) / durationMs) * 100);
    return Math.max(5, Math.min(95, progress));
  };

  const AwardIcon = () => <Award size={16} />;

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [profileData, statsData, sessionData, txData] = await Promise.all([
          getCurrentProfile(),
          getUserStats(),
          getUserDebateSessions(),
          getTokenTransactions(),
        ]);

        if (!isMounted) return;
        setProfile(profileData);
        setStats(statsData);
        setSessions(sessionData);
        setTransactions(txData);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const userData = useMemo(() => {
    const metadata = user?.user_metadata as Record<string, unknown> | undefined;
    const displayName =
      profile?.username ||
      (metadata?.full_name as string | undefined) ||
      (metadata?.name as string | undefined) ||
      (metadata?.username as string | undefined) ||
      user?.email?.split('@')[0] ||
      '사용자';

    const avatarUrl =
      profile?.avatar_url ||
      (metadata?.avatar_url as string | undefined) ||
      (metadata?.picture as string | undefined) ||
      '';

    const lastSignIn = user?.last_sign_in_at ? formatDateTime(user.last_sign_in_at) : '기록 없음';

    const activeCount = sessions.filter((session) => session.status === 'active').length;
    const completedCount = sessions.filter((session) => session.status === 'completed').length;
    const abandonedCount = sessions.filter((session) => session.status === 'abandoned').length;

    return {
      name: `${displayName}님`,
      email: user?.email ?? '이메일 없음',
      lastLogin: lastSignIn,
      avatarUrl,
      initials: displayName.slice(0, 1).toUpperCase(),
      stats: {
        activeCourses: activeCount,
        auditingCourses: abandonedCount,
        completedCourses: completedCount,
        earnedCredits: stats?.total_tokens ?? 0,
        favoriteCourses: 0,
      },
    };
  }, [profile, sessions, stats, user]);

  const courses: Course[] = useMemo(() => {
    const lectureMap = new Map(lectures.map((lecture) => [String(lecture.id), lecture]));
    const now = Date.now();

    return sessions.map((session) => {
      const lecture = lectureMap.get(session.lecture_id);
      const startDate = session.started_at;
      const endDate = session.ended_at ?? null;
      const status: Course['status'] = session.status === 'active' ? 'active' : 'completed';
      const progress = status === 'completed'
        ? 100
        : getEstimatedProgress(new Date(startDate).getTime(), now);

      return {
        id: session.id,
        title: session.lecture_title || lecture?.title || '강좌 정보 없음',
        instructor: lecture?.instructor || '알 수 없음',
        institution: 'Yeoul Academy',
        thumbnail: lecture?.thumbnail || '',
        startDate,
        endDate: endDate || startDate,
        progress,
        status,
      };
    });
  }, [sessions]);

  const recentActivities = useMemo(() => {
    const reasonLabel: Record<TokenTransaction['reason'], string> = {
      debate_participation: '토론 참여 보상',
      good_argument: '우수 논리 보상',
      streak_bonus: '연속 참여 보너스',
      daily_bonus: '일일 보너스',
      achievement: '업적 달성',
      other: '기타 보상',
    };

    const txItems = transactions.slice(0, 3).map((item) => ({
      id: item.id,
      label: `${reasonLabel[item.reason]} · +${item.amount} 토큰`,
      time: formatRelativeTime(item.created_at),
      icon: <AwardIcon />,
    }));

    if (txItems.length > 0) return txItems;

    return sessions.slice(0, 3).map((session) => ({
      id: session.id,
      label: `토론 세션 ${session.status === 'completed' ? '완료' : '시작'} · ${session.lecture_title || '강좌'}`,
      time: formatRelativeTime(session.started_at),
      icon: <CheckCircle2 size={16} />,
    }));
  }, [sessions, transactions]);

  const filteredCourses = courses.filter(course => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return course.status === 'active';
    if (activeTab === 'completed') return course.status === 'completed';
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\. /g, '-').replace('.', '');
  };

  const isTwoFactorEnabled = false;
  const isEmailVerified = Boolean(user?.email_confirmed_at);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="text-cyan-400" size={24} />
              </button>
              <h1 className="text-2xl font-bold text-white">마이페이지</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Bell className="text-gray-400" size={20} />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Settings className="text-gray-400" size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-6">
              {/* Profile Image */}
              <div className="relative">
                {userData.avatarUrl ? (
                  <img
                    src={userData.avatarUrl}
                    alt={`${userData.name} 프로필`}
                    className="w-24 h-24 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    {userData.initials ? (
                      <span className="text-3xl font-bold text-white">{userData.initials}</span>
                    ) : (
                      <User className="text-white" size={48} />
                    )}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">ON</span>
                </div>
              </div>

              {/* Profile Info */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {userData.name} <span className="text-cyan-400">안녕하세요.</span>
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>{userData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>최근 접속일: {userData.lastLogin}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors">
                SNS 연결설정
              </button>
              <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white transition-colors">
                개인정보관리
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-center"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-green-100 text-sm mb-2">수강중인<br />강좌 수</p>
              <p className="text-5xl font-bold text-white">{userData.stats.activeCourses}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 text-center"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-300 text-sm mb-2">청강중인<br />강좌 수</p>
              <p className="text-5xl font-bold text-white">{userData.stats.auditingCourses}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 text-center"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-300 text-sm mb-2">종료한<br />강좌 수</p>
              <p className="text-5xl font-bold text-white">{userData.stats.completedCourses}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 text-center"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-300 text-sm mb-2">취득<br />결과 수</p>
              <p className="text-5xl font-bold text-white">{userData.stats.earnedCredits}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 text-center"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-300 text-sm mb-2">관심<br />강좌 수</p>
              <p className="text-5xl font-bold text-white">{userData.stats.favoriteCourses}</p>
            </div>
          </motion.div>
        </div>

        {/* Account & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">최근 활동</h3>
              <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                전체보기
              </button>
            </div>
            <div className="space-y-3">
              {recentActivities.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3"
                >
                  <div className="flex items-center gap-3 text-white">
                    <span className="text-cyan-400">{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </div>
              ))}
              {!loading && recentActivities.length === 0 && (
                <div className="text-center text-sm text-gray-400 py-4">
                  최근 활동이 없습니다.
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">계정 상태</h3>
              <Shield className="text-emerald-400" size={20} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">2단계 인증</span>
                <span className={`font-medium ${isTwoFactorEnabled ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {isTwoFactorEnabled ? '활성화' : '미사용'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">이메일 인증</span>
                <span className={`font-medium ${isEmailVerified ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {isEmailVerified ? '완료' : '대기'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">보안 점수</span>
                <span className="text-cyan-300 font-semibold">
                  {stats ? Math.min(100, 60 + Math.floor(stats.total_tokens / 10)) : 0}점
                </span>
              </div>
              <button className="w-full mt-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors text-sm">
                보안 설정 관리
              </button>
            </div>
          </motion.div>
        </div>

        {/* Course List Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">수강중인 강좌</h3>
            
            <div className="flex items-center gap-4">
              {/* Tab Filters */}
              <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'active'
                      ? 'bg-cyan-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  수강중
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'completed'
                      ? 'bg-cyan-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  완료
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'all'
                      ? 'bg-cyan-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  전체
                </button>
              </div>

              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Settings className="text-gray-400" size={20} />
              </button>
            </div>
          </div>

          {/* Course Cards */}
          <div className="space-y-4">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-6">
                  {/* Course Thumbnail */}
                  <div className="relative w-40 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-cyan-600 to-blue-700 flex-shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="text-white/50" size={48} />
                    </div>
                    {course.status === 'completed' && (
                      <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                        <CheckCircle2 size={16} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                          {course.title}
                        </h4>
                        <p className="text-gray-400 text-sm">
                          {course.instructor} · {course.institution}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {course.status === 'active' ? (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
                            수강중
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30">
                            완료
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Course Period */}
                    <div className="flex items-center gap-6 mb-3">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar size={16} />
                        <span>
                          기간: {formatDate(course.startDate)} ~ {course.status === 'active' ? '진행중' : formatDate(course.endDate)}
                        </span>
                      </div>
                      {course.status === 'active' && (
                        <div className="flex items-center gap-2 text-cyan-400 text-sm">
                          <PlayCircle size={16} />
                          <span>진도율: {course.progress}%</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {course.status === 'active' && (
                      <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors whitespace-nowrap">
                    {course.status === 'active' ? '학습하기' : '전체보기'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto text-gray-600 mb-4" size={48} />
              <p className="text-gray-400">
                {loading ? '강좌 정보를 불러오는 중입니다.' : '수강중인 강좌가 없습니다.'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
