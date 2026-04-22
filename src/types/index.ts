export type Tab = 'home' | 'friends' | 'tasks' | 'me';
export type Visibility = 'public' | 'friends' | 'private';
export type InteractionScope = 'public' | 'friends' | 'team';

export interface Habit {
  id: string;
  name: string;
  totalDays: number;
  currentProgress: number;
  type: 'single' | 'team';
  status: 'normal' | 'punished';
  isCompletedToday: boolean;
  isArchived?: boolean;
  // Team specific
  creatorId?: string;
  inviteCode?: string;
  members?: { id: string; name: string; avatar: string }[];
  isStarted?: boolean;
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
  habitId: string; // Link to habit
  user: {
    id?: string;
    name: string;
    avatar: string;
  };
  images: string[];
  tag: string;
  likedBy: { name: string; userId: string; scope: InteractionScope }[];
  comments: Comment[];
  isLive?: boolean;
  visibility: Visibility;
  content?: string;
  createdAt: number;
}
