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
  captainDeleted?: boolean;
}

export interface Comment {
  id: string;
  user: string;
  userId?: string;
  text: string;
  createdAt: number;
  scope: InteractionScope;
  replyToUserId?: string;
  replyToUserName?: string;
  replyToCommentId?: string;
}

export interface Post {
  id: string;
  habitId: string;
  user: UserProfile;
  images: string[];
  tag: string;
  likedBy: { name: string; userId: string; scope: InteractionScope }[];
  comments: Comment[];
  isLive?: boolean;
  visibility: Visibility;
  content?: string;
  createdAt: number;
  type?: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: number;
}

export type NotificationType = 'like' | 'comment' | 'reply' | 'friend_request' | 'friend_accept' | 'follow' | 'mention' | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  actorId: string;
  actorName: string;
  actorAvatar: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
  content: string;
  postContentPreview?: string;
  postType?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  like: { inApp: boolean; sound: boolean; vibration: boolean };
  comment: { inApp: boolean; sound: boolean; vibration: boolean };
  reply: { inApp: boolean; sound: boolean; vibration: boolean };
  friend_request: { inApp: boolean; sound: boolean; vibration: boolean };
  friend_accept: { inApp: boolean; sound: boolean; vibration: boolean };
  follow: { inApp: boolean; sound: boolean; vibration: boolean };
  mention: { inApp: boolean; sound: boolean; vibration: boolean };
  system: { inApp: boolean; sound: boolean; vibration: boolean };
  soundType: 'default' | 'gentle' | 'crystal' | 'bubble';
}
