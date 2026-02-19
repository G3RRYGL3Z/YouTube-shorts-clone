// Content & user types for Shorts + 7s Replies

export type Tier = 'free' | 'plus' | 'creator';

export interface User {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  tier: Tier;
  replyCreditsRemaining: number; // free: 3/month, plus: 30, creator: unlimited (-1)
}

export interface Short {
  id: string;
  creator: Pick<User, 'id' | 'handle' | 'displayName' | 'avatarUrl'>;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  likeCount: number;
  commentCount: number;
  replyCount: number;
  musicLabel?: string;
  createdAt: string;
  /** 7-second response Shorts linked to this one */
  responseShortIds: string[];
  /** Optional: play only this segment (seconds). Negative = seconds from end (e.g. -60 = last 60 sec). */
  clipStartSeconds?: number;
  clipEndSeconds?: number;
}

export interface ResponseShort extends Short {
  parentShortId: string;
  isResponse: true;
  durationSeconds: 7;
}

export function isResponseShort(s: Short): s is ResponseShort {
  return 'parentShortId' in s && (s as ResponseShort).isResponse === true;
}

export const TIER_LIMITS: Record<Tier, { replyCreditsPerMonth: number; label: string }> = {
  free: { replyCreditsPerMonth: 3, label: 'Free' },
  plus: { replyCreditsPerMonth: 30, label: 'Plus' },
  creator: { replyCreditsPerMonth: -1, label: 'Creator' }, // unlimited
};
