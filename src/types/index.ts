export type Tab = 'home' | 'friends' | 'tasks' | 'me';
export type HomeSubTab = 'discovery' | 'team' | 'following';
export type FriendSubTab = 'feed' | 'requests';
export type Visibility = 'public' | 'friends' | 'private';
export type InteractionScope = 'public' | 'friends' | 'team';

export interface UserProfile {
  id: string;
  customId?: string;
  name: string;
  avatar: string;
}

export interface VoteEntry {
  userId: string;
  choice: 'continue' | 'cashout';
  newDays?: number;
  votedAt: number;
}

export interface Habit {
  id: string;
  name: string;
  totalDays: number;
  currentProgress: number;
  type: 'single' | 'team';
  status: 'normal' | 'punished';
  isCompletedToday: boolean;
  isArchived?: boolean;
  archivedAt?: string;
  isFailed?: boolean;
  // Streak / penalty
  penaltyMode?: boolean;
  penaltyDays?: number;
  lastCheckDate?: string; // YYYY-MM-DD
  // Team
  creatorId?: string;
  inviteCode?: string;
  members?: { id: string; name: string; avatar: string; customId?: string; lastCheckDate?: string }[];
  isStarted?: boolean;
  voteStatus?: VoteEntry[];
}

export interface Comment {
  id: string;
  user: string;
  userId?: string;
  text: string;
  createdAt: number;
  scope: InteractionScope;
}

export interface Post {
  id: string;
  habitId: string;
  user: UserProfile & { id?: string };
  images: string[];
  tag: string;
  likedBy: { name: string; userId: string; scope: InteractionScope }[];
  comments: Comment[];
  isLive?: boolean;
  visibility: Visibility;
  content?: string;
  createdAt: number;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: number;
}
