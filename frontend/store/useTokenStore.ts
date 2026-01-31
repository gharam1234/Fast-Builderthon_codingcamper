// store/useTokenStore.ts

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface PendingReward {
  id: string;
  amount: number;
  message: string;
}

interface TokenState {
  totalTokens: number;
  sessionTokens: number;
  messageCount: number;
  pendingRewards: PendingReward[];
}

interface TokenActions {
  setTotalTokens: (tokens: number) => void;
  addTokensLocal: (amount: number) => void;
  resetSessionTokens: () => void;
  incrementMessageCount: () => void;
  resetMessageCount: () => void;
  addPendingReward: (reward: Omit<PendingReward, 'id'>) => void;
  clearPendingRewards: () => void;
  removePendingReward: (id: string) => void;
  reset: () => void;
}

const initialState: TokenState = {
  totalTokens: 0,
  sessionTokens: 0,
  messageCount: 0,
  pendingRewards: [],
};

export const useTokenStore = create<TokenState & TokenActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        
        setTotalTokens: (tokens) => set({ totalTokens: tokens }),
        
        addTokensLocal: (amount) => set((state) => ({
          totalTokens: state.totalTokens + amount,
          sessionTokens: state.sessionTokens + amount,
        })),
        
        resetSessionTokens: () => set({ sessionTokens: 0, messageCount: 0 }),
        
        incrementMessageCount: () => set((state) => ({
          messageCount: state.messageCount + 1,
        })),
        
        resetMessageCount: () => set({ messageCount: 0 }),
        
        addPendingReward: (reward) => set((state) => ({
          pendingRewards: [
            ...state.pendingRewards,
            { ...reward, id: `reward-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
          ],
        })),
        
        clearPendingRewards: () => set({ pendingRewards: [] }),
        
        removePendingReward: (id) => set((state) => ({
          pendingRewards: state.pendingRewards.filter((r) => r.id !== id),
        })),
        
        reset: () => set(initialState),
      }),
      {
        name: 'yeoul-token-storage',
        partialize: () => ({ 
          // totalTokens는 persist하지 않음 - DB에서 가져옴
          // sessionTokens와 messageCount도 persist하지 않음 (세션 기반)
        }),
      }
    ),
    { name: 'TokenStore' }
  )
);

// 선택자 함수들
export const selectTotalTokens = (state: TokenState & TokenActions) => state.totalTokens;
export const selectSessionTokens = (state: TokenState & TokenActions) => state.sessionTokens;
export const selectMessageCount = (state: TokenState & TokenActions) => state.messageCount;
export const selectPendingRewards = (state: TokenState & TokenActions) => state.pendingRewards;
