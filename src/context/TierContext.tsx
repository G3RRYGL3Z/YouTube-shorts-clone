import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { User, Tier } from '../types';
import { TIER_LIMITS } from '../types';

const initialUser: User = {
  id: 'me',
  handle: '@viewer',
  displayName: 'You',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viewer',
  tier: 'free',
  replyCreditsRemaining: TIER_LIMITS.free.replyCreditsPerMonth,
};

type TierAction =
  | { type: 'USE_REPLY_CREDIT' }
  | { type: 'SET_TIER'; tier: Tier }
  | { type: 'RESET_CREDITS' };

function tierReducer(state: User, action: TierAction): User {
  switch (action.type) {
    case 'USE_REPLY_CREDIT':
      if (state.replyCreditsRemaining === -1) return state; // unlimited
      if (state.replyCreditsRemaining <= 0) return state;
      return { ...state, replyCreditsRemaining: state.replyCreditsRemaining - 1 };
    case 'SET_TIER':
      return {
        ...state,
        tier: action.tier,
        replyCreditsRemaining:
          TIER_LIMITS[action.tier].replyCreditsPerMonth === -1
            ? -1
            : TIER_LIMITS[action.tier].replyCreditsPerMonth,
      };
    case 'RESET_CREDITS':
      const limit = TIER_LIMITS[state.tier].replyCreditsPerMonth;
      return {
        ...state,
        replyCreditsRemaining: limit === -1 ? -1 : limit,
      };
    default:
      return state;
  }
}

interface TierContextValue {
  user: User;
  useReplyCredit: () => boolean;
  setTier: (tier: Tier) => void;
  canReply: boolean;
  resetCredits: () => void;
}

const TierContext = createContext<TierContextValue | null>(null);

export function TierProvider({ children }: { children: React.ReactNode }) {
  const [user, dispatch] = useReducer(tierReducer, initialUser);

  const useReplyCredit = useCallback((): boolean => {
    if (user.replyCreditsRemaining === -1) {
      dispatch({ type: 'USE_REPLY_CREDIT' });
      return true;
    }
    if (user.replyCreditsRemaining <= 0) return false;
    dispatch({ type: 'USE_REPLY_CREDIT' });
    return true;
  }, [user.replyCreditsRemaining]);

  const setTier = useCallback((tier: Tier) => {
    dispatch({ type: 'SET_TIER', tier });
  }, []);

  const resetCredits = useCallback(() => {
    dispatch({ type: 'RESET_CREDITS' });
  }, []);

  const canReply =
    user.replyCreditsRemaining === -1 || user.replyCreditsRemaining > 0;

  const value: TierContextValue = {
    user,
    useReplyCredit,
    setTier,
    canReply,
    resetCredits,
  };

  return <TierContext.Provider value={value}>{children}</TierContext.Provider>;
}

export function useTier() {
  const ctx = useContext(TierContext);
  if (!ctx) throw new Error('useTier must be used within TierProvider');
  return ctx;
}
