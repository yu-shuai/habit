import { useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { AppNotification, NotificationType, NotificationPreferences } from '../types';
import { useNotificationStore } from '../store/useNotificationStore';
import { playNotificationTone } from '../utils/notificationSound';

const PAGE_SIZE = 20;

const DEFAULT_PREFERENCES: NotificationPreferences = {
  like: { inApp: true, sound: true, vibration: true },
  comment: { inApp: true, sound: true, vibration: true },
  reply: { inApp: true, sound: true, vibration: true },
  friend_request: { inApp: true, sound: true, vibration: true },
  friend_accept: { inApp: true, sound: true, vibration: true },
  follow: { inApp: true, sound: true, vibration: true },
  mention: { inApp: true, sound: true, vibration: true },
  system: { inApp: true, sound: true, vibration: true },
  soundType: 'default',
};

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 1000,
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

export const useNotificationActions = (session: any, userProfile: any) => {
  const { setNotifications, setUnreadCount } = useNotificationStore();
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);

  const playNotificationSound = useCallback((soundType: string = 'default') => {
    playNotificationTone(soundType as 'default' | 'gentle' | 'crystal' | 'bubble');
  }, []);

  const triggerVibration = useCallback(() => {
    try {
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch {}
  }, []);

  const getPreferences = useCallback((): NotificationPreferences => {
    try {
      const stored = localStorage.getItem('notification_preferences');
      if (stored) return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_PREFERENCES;
  }, []);

  const savePreferences = useCallback((prefs: NotificationPreferences) => {
    localStorage.setItem('notification_preferences', JSON.stringify(prefs));
  }, []);

  const mapNotification = (n: any): AppNotification => ({
    id: n.id,
    userId: n.user_id,
    actorId: n.actor_id,
    actorName: n.actor_name,
    actorAvatar: n.actor_avatar || '',
    type: n.type as NotificationType,
    postId: n.post_id,
    commentId: n.comment_id,
    content: n.content || '',
    postContentPreview: n.post_content_preview || '',
    postType: n.post_type || '',
    isRead: n.is_read,
    createdAt: n.created_at,
  });

  const fetchNotifications = useCallback(async (page: number = 0) => {
    if (!session?.user?.id || loadingRef.current) return;
    loadingRef.current = true;

    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('fetchNotifications failed:', error.message);
        return;
      }

      const mapped: AppNotification[] = (data || []).map(mapNotification);
      hasMoreRef.current = mapped.length === PAGE_SIZE;
      pageRef.current = page;

      if (page === 0) {
        setNotifications(mapped);
      } else {
        setNotifications(prev => [...prev, ...mapped]);
      }

      if (page === 0 && mapped.length > 0 && mapped[0].isRead === false) {
        // Trigger sound/vibration if the latest one is unread (received via realtime)
        const prefs = getPreferences();
        const typePrefs = prefs[mapped[0].type as keyof NotificationPreferences];
        if (typePrefs && typeof typePrefs === 'object') {
          if ('sound' in typePrefs && typePrefs.sound) playNotificationSound(prefs.soundType);
          if ('vibration' in typePrefs && typePrefs.vibration) triggerVibration();
        }
      }

      if (page === 0) {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('is_read', false);
        setUnreadCount(count || 0);
      }
    } finally {
      loadingRef.current = false;
    }
  }, [session?.user?.id, setNotifications, setUnreadCount]);

  const loadMore = useCallback(async () => {
    if (!hasMoreRef.current || loadingRef.current) return;
    await fetchNotifications(pageRef.current + 1);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (!error) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      const currentCount = useNotificationStore.getState().unreadCount;
      setUnreadCount(Math.max(0, currentCount - 1));
    }
  }, [setNotifications, setUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    if (!session?.user?.id) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  }, [session?.user?.id, setNotifications, setUnreadCount]);

  const createNotification = useCallback(async (
    targetUserId: string,
    type: NotificationType,
    postId?: string,
    commentId?: string,
    content?: string,
    postContentPreview?: string,
    postType?: string,
  ) => {
    if (!session?.user?.id || !userProfile?.id) return;
    if (targetUserId === session.user.id) return;

    const prefs = getPreferences();
    const typePrefs = prefs[type as keyof NotificationPreferences];
    if (typePrefs && typeof typePrefs === 'object' && 'inApp' in typePrefs && !typePrefs.inApp) return;

    await retryWithBackoff(async () => {
      const { error } = await supabase.from('notifications').insert({
        user_id: targetUserId,
        actor_id: session.user.id,
        actor_name: userProfile.name,
        actor_avatar: userProfile.avatar || '',
        type,
        post_id: postId || null,
        comment_id: commentId || null,
        content: content || '',
        post_content_preview: postContentPreview || '',
        post_type: postType || '',
      });
      if (error) throw error;
    });
  }, [session?.user?.id, userProfile]);

  const updateBadge = useCallback(async () => {
    const count = useNotificationStore.getState().unreadCount;
    try {
      const win = window as any;
      if (win.Capacitor && count > 0) {
        const badgeModule = '@capacitor-community/badge';
        const mod = await import(/* webpackIgnore: true */ /* @vite-ignore */ badgeModule);
        const Badge = mod?.Badge || mod?.default;
        if (Badge?.set) await Badge.set({ count: Math.min(count, 99) });
      }
    } catch {}
  }, []);

  return {
    fetchNotifications,
    loadMore,
    hasMore: hasMoreRef.current,
    markAsRead,
    markAllAsRead,
    createNotification,
    getPreferences,
    savePreferences,
    playNotificationSound,
    triggerVibration,
    updateBadge,
  };
};
