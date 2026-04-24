import { Visibility } from '../types';

export const DEFAULT_USER_PROFILE = {
  name: '自律玩家',
  avatar: 'https://picsum.photos/seed/me/200/200',
  id: '',
};

export const MOOD_EMOJIS = [
  '🤪', '😆', '🥰', '😎', '🥳', '💪', '👍', '🧐',
  '😴', '🥱', '😫', '😭', '🤒', '😷', '💔', '😒',
  '🤯', '🤡', '💩', '👻', '🎸', '📖', '🏀', '⚽',
  '🌛', '🧡', '👀', '🦥', '😤', '😬', '🌹', '☕',
  '😊',
];

export const APPEARANCE_OPTIONS = [
  { id: 'system', label: '跟随系统' },
  { id: 'light', label: '浅色模式' },
  { id: 'dark', label: '深色模式' },
] as const;

export const VISIBILITY_OPTIONS: { id: Visibility; label: string }[] = [
  { id: 'public', label: '公开' },
  { id: 'friends', label: '仅朋友' },
  { id: 'private', label: '仅自己' },
];
