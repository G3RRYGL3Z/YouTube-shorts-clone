import type { Short, ResponseShort, User } from '../types';

// ——— Demo: two videos in public/videos/ (video1.mp4, mtv.mp4) ———
// - Short 1: first 60 sec of video1.mp4 (StoryBox Audio)
// - Short 2: first 60 sec of mtv.mp4 (MTV Video)
// - Short 3: last 60 sec of mtv.mp4
const DEMO_VIDEO_1 = '/videos/video1.mp4';
const DEMO_VIDEO_MTV = '/videos/mtv.mp4';

const baseCreator: User = {
  id: 'u1',
  handle: '@quicktakes',
  displayName: 'Quick Takes',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=qt',
  tier: 'creator',
  replyCreditsRemaining: -1,
};

const shorts: (Short | ResponseShort)[] = [
  {
    id: 's1',
    creator: {
      id: baseCreator.id,
      handle: baseCreator.handle,
      displayName: baseCreator.displayName,
      avatarUrl: baseCreator.avatarUrl,
    },
    title: 'MD2 Video StoryBox Audio',
    description: 'First 60 sec',
    videoUrl: DEMO_VIDEO_1,
    thumbnailUrl: '',
    durationSeconds: 60,
    likeCount: 12400,
    commentCount: 342,
    replyCount: 12,
    musicLabel: 'Upbeat — Original',
    createdAt: new Date().toISOString(),
    responseShortIds: ['s1r1', 's1r2'],
    clipStartSeconds: 0,
    clipEndSeconds: 60,
  },
  {
    id: 's1r1',
    parentShortId: 's1',
    isResponse: true,
    creator: {
      id: 'u2',
      handle: '@replyguy',
      displayName: 'Reply Guy',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=r1',
    },
    title: 'My version of that routine 😂',
    videoUrl: DEMO_VIDEO_MTV,
    thumbnailUrl: '',
    durationSeconds: 7,
    likeCount: 2100,
    commentCount: 89,
    replyCount: 0,
    musicLabel: 'Same sound',
    createdAt: new Date().toISOString(),
    responseShortIds: [],
  },
  {
    id: 's1r2',
    parentShortId: 's1',
    isResponse: true,
    creator: {
      id: 'u3',
      handle: '@fitness_short',
      displayName: 'Fitness Short',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=r2',
    },
    title: 'Tried this — game changer',
    videoUrl: DEMO_VIDEO_MTV,
    thumbnailUrl: '',
    durationSeconds: 7,
    likeCount: 890,
    commentCount: 23,
    replyCount: 0,
    musicLabel: 'Original',
    createdAt: new Date().toISOString(),
    responseShortIds: [],
  },
  {
    id: 's2',
    creator: {
      id: 'u4',
      handle: '@cooking_shorts',
      displayName: 'Cooking Shorts',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cook',
    },
    title: 'MD2 MTV Video',
    videoUrl: DEMO_VIDEO_MTV,
    thumbnailUrl: '',
    durationSeconds: 60,
    likeCount: 56000,
    commentCount: 1200,
    replyCount: 45,
    musicLabel: 'First 60 sec',
    createdAt: new Date().toISOString(),
    responseShortIds: ['s2r1'],
    clipStartSeconds: 0,
    clipEndSeconds: 60,
  },
  {
    id: 's2r1',
    parentShortId: 's2',
    isResponse: true,
    creator: {
      id: 'u5',
      handle: '@homechef',
      displayName: 'Home Chef',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chef',
    },
    title: 'I added garlic bread to this',
    videoUrl: DEMO_VIDEO_MTV,
    thumbnailUrl: '',
    durationSeconds: 7,
    likeCount: 3400,
    commentCount: 156,
    replyCount: 0,
    musicLabel: 'Same',
    createdAt: new Date().toISOString(),
    responseShortIds: [],
  },
  {
    id: 's3',
    creator: {
      id: 'u6',
      handle: '@tech_tips',
      displayName: 'Tech Tips',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech',
    },
    title: 'MD2 MTV Video (last 60 sec)',
    videoUrl: DEMO_VIDEO_MTV,
    thumbnailUrl: '',
    durationSeconds: 60,
    likeCount: 89000,
    commentCount: 2100,
    replyCount: 78,
    musicLabel: 'Final 60 sec',
    createdAt: new Date().toISOString(),
    responseShortIds: [],
    clipStartSeconds: -60,
    clipEndSeconds: 0,
  },
];

export const shortsMap = new Map<string, Short | ResponseShort>(
  shorts.map((s) => [s.id, s])
);

/** Feed: main Shorts first, then response Shorts can appear in context */
export function getFeedShortIds(): string[] {
  return shorts.filter((s) => !('isResponse' in s && s.isResponse)).map((s) => s.id);
}

export function getResponsesForShort(shortId: string): (Short | ResponseShort)[] {
  const short = shortsMap.get(shortId);
  if (!short || !short.responseShortIds.length) return [];
  return short.responseShortIds
    .map((id) => shortsMap.get(id))
    .filter((s): s is Short | ResponseShort => !!s);
}

export { shorts };
