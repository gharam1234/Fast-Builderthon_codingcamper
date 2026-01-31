import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ChatMessage } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';

interface UseLiveChatOptions {
  roomId?: string;
  simulateMessages?: boolean;
  simulateInterval?: number;
}

export function useLiveChat({
  roomId = 'battle-arena',
  simulateMessages = false,
  simulateInterval = 4000,
}: UseLiveChatOptions = {}) {
  const { user } = useAuth();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [sendError, setSendError] = useState('');
  const [presenceCount, setPresenceCount] = useState(0);
  const presenceKeyRef = useRef<string>('');

  const displayName = useMemo(() => {
    const metadata = user?.user_metadata as Record<string, unknown> | undefined;
    return (
      (metadata?.full_name as string | undefined) ||
      (metadata?.name as string | undefined) ||
      (metadata?.username as string | undefined) ||
      user?.email?.split('@')[0] ||
      '익명'
    );
  }, [user]);

  useEffect(() => {
    // Auto-scroll would happen in LiveChatPanel instead
  }, [chatMessages]);

  useEffect(() => {
    let isMounted = true;

    const fetchInitial = async () => {
      const { data, error } = await supabase
        .from('live_chat_messages')
        .select('id, username, text, emoji, created_at')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(200);

      if (error) {
        console.error('라이브 채팅 로드 실패:', error);
        return;
      }

      if (!isMounted) return;
      setChatMessages(
        ((data as { id: string; username: string | null; text: string; emoji: string | null }[]) || []).map((item) => ({
          id: item.id,
          user: item.username || '익명',
          text: item.text,
          emoji: item.emoji || undefined,
        }))
      );
    };

    fetchInitial();

    const channel = supabase
      .channel(`live-chat:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMsg = payload.new as {
            id: string;
            username: string | null;
            text: string;
            emoji: string | null;
          };

          setChatMessages((prev) => [
            ...prev,
            {
              id: newMsg.id,
              user: newMsg.username || '익명',
              text: newMsg.text,
              emoji: newMsg.emoji || undefined,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    if (!presenceKeyRef.current) {
      presenceKeyRef.current = user?.id || `anon-${crypto.randomUUID()}`;
    }

    const channel = supabase.channel('live-room-presence', {
      config: { presence: { key: presenceKeyRef.current } },
    });

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const entries = Object.values(state).flat();
      setPresenceCount(
        entries.filter((entry) => (entry as { room_id?: string }).room_id === roomId).length
      );
    });

    channel.subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return;
      await channel.track({ room_id: roomId, ts: Date.now() });
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, user]);

  useEffect(() => {
    if (!simulateMessages) return;

    const emojis = ['🔥', '❤️', '👍', '⚡'];
    const texts = ['좋은 포인트!', '설득력 있네요', '와!', '대박'];

    const chatTimer = setInterval(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          user: `관객${Math.floor(Math.random() * 100)}`,
          text: texts[Math.floor(Math.random() * texts.length)],
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
        },
      ]);
    }, simulateInterval);

    return () => clearInterval(chatTimer);
  }, [simulateMessages, simulateInterval]);

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    if (!user) {
      setSendError('로그인 후 채팅에 참여할 수 있어요.');
      return;
    }

    const now = Date.now();
    if (now < cooldownUntil) {
      setSendError('잠시 후 다시 보내주세요.');
      return;
    }

    const messageText = chatInput.trim();
    setChatInput('');
    setSendError('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('live_chat_messages') as any)
      .insert({
        room_id: roomId,
        user_id: user.id,
        username: displayName,
        text: messageText,
      })
      .then(({ error }: { error: { message?: string } | null }) => {
        if (error) {
          if (String(error.message || '').includes('rate_limit')) {
            setSendError('잠시 후 다시 보내주세요.');
          } else {
            setSendError('메시지 전송에 실패했습니다.');
          }
          console.error('라이브 채팅 전송 실패:', error);
          return;
        }
        setCooldownUntil(Date.now() + 2000);
      });
  }, [chatInput, cooldownUntil, displayName, roomId, user]);

  return {
    chatMessages,
    chatInput,
    setChatInput,
    handleSendChat,
    sendDisabled: Date.now() < cooldownUntil,
    cooldownSeconds: Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000)),
    sendError,
    presenceCount,
  };
}
