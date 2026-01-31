'use client'

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Headphones, Users, TrendingUp, Sparkles, Zap } from 'lucide-react';
import { createLiveBattleRoom, getLiveBattleRooms, getLiveRoomParticipants, supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import type { LiveBattleRoom } from '@/lib/supabase';

interface AudienceLobbyProps {
  onSelectRoom: (roomId: string) => void;
}

export function AudienceLobby({ onSelectRoom }: AudienceLobbyProps) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<LiveBattleRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});
  const [presenceCounts, setPresenceCounts] = useState<Record<string, number>>({});
  const [tick, setTick] = useState(0);

  const visibleRooms = useMemo(() => {
    const now = Date.now();
    return rooms.filter((room) => {
      if (room.status === 'ended') return false;
      if (!room.ends_at) return true;
      return new Date(room.ends_at).getTime() > now;
    });
  }, [rooms, tick]);

  const roomIds = useMemo(() => visibleRooms.map((room) => room.id), [visibleRooms]);
  const roomIdSet = useMemo(() => new Set(roomIds), [roomIds]);

  useEffect(() => {
    let isMounted = true;
    const fetchRooms = async () => {
      const data = await getLiveBattleRooms();
      if (!isMounted) return;
      setRooms(data);
      setLoading(false);
    };

    fetchRooms();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const refreshCounts = async () => {
      if (roomIds.length === 0) return;
      const counts = await getLiveRoomParticipants(roomIds, 10);
      if (!isMounted) return;
      setParticipantCounts(counts);
    };

    refreshCounts();
    intervalId = setInterval(refreshCounts, 30000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [roomIds]);

  useEffect(() => {
    if (roomIds.length === 0) return;

    const channel = supabase.channel('live-room-presence', { config: { presence: { key: 'audience-lobby' } } });

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const counts: Record<string, number> = {};

      Object.values(state).forEach((entries) => {
        entries.forEach((entry) => {
          const roomId = (entry as { room_id?: string }).room_id;
          if (!roomId || !roomIdSet.has(roomId)) return;
          counts[roomId] = (counts[roomId] || 0) + 1;
        });
      });

      setPresenceCounts(counts);
    });

    channel.subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return;
      await channel.track({
        room_id: 'lobby',
        ts: Date.now(),
      });
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomIdSet, roomIds]);

  const handleCreateRoom = async () => {
    if (!user || creating) return;
    setCreating(true);
    setError('');

    const room = await createLiveBattleRoom('라이브 토론 배틀');
    setCreating(false);

    if (!room) {
      setError('방 생성에 실패했습니다.');
      return;
    }

    onSelectRoom(room.id);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRemainingTime = (endsAt: string) => {
    const remaining = Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 1000));
    return formatDuration(remaining);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-900 flex items-center justify-center p-8">
      {/* Background Arena */}
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.unsplash.com/photo-1614738499301-d2eed34f7b11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3BvcnRzJTIwYXJlbmElMjBnYW1pbmclMjBiYXR0bGV8ZW58MXx8fHwxNzY5ODQwOTI0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Arena"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-full mb-4"
          >
            <span className="text-white font-bold flex items-center gap-2">
              <Users size={20} />
              관전자 모드
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold text-white mb-4"
          >
            Live Battle Rooms
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-400"
          >
            지금 진행 중인 라이브 배틀에 참여하세요 🎧
          </motion.p>
        </div>

        {/* Live Rooms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {loading && (
            <div className="col-span-full text-center text-gray-400">라이브 배틀을 불러오는 중...</div>
          )}
          {!loading && visibleRooms.length === 0 && (
            <div className="col-span-full text-center text-gray-400">
              현재 진행 중인 배틀이 없습니다.
            </div>
          )}

          {visibleRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-slate-900/70 to-slate-950/70 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-2xl shadow-xl">
                      ⚔️
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{room.title}</h3>
                      <p className="text-sm text-gray-400">라이브 진행 중</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-cyan-400">
                    <TrendingUp size={16} />
                    HOT
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span>방 ID: {room.id.slice(0, 8)}</span>
                  <span>
                    시작: {new Date(room.created_at).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span>참여자</span>
                  <span className="text-cyan-300 font-semibold">
                    {presenceCounts[room.id] ?? participantCounts[room.id] ?? 0}명
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span>남은 시간</span>
                  <span className="text-emerald-300 font-semibold">
                    {room.ends_at
                      ? formatRemainingTime(room.ends_at)
                      : formatDuration(room.duration_seconds ?? 3000)}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectRoom(room.id)}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-3 shadow-xl"
                >
                  <Headphones size={20} />
                  라이브 참여
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {error && (
          <div className="text-center text-sm text-red-400 mb-6">{error}</div>
        )}

        {user && (
          <div className="flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateRoom}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl"
              disabled={creating}
            >
              <Sparkles size={20} />
              {creating ? '방 생성 중...' : '새 배틀 시작'}
            </motion.button>
          </div>
        )}

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm inline-block">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-cyan-400" size={20} />
                <span className="text-gray-300">실시간 채팅 참여 가능</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <Zap className="text-yellow-400" size={20} />
                <span className="text-gray-300">관전 참여 시 +5 토큰</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
