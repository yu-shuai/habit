import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppNotification } from '../types';

interface NotificationState {
  notifications: AppNotification[];
  setNotifications: (updater: AppNotification[] | ((prev: AppNotification[]) => AppNotification[])) => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  lastViewedNotificationsAt: number;
  setLastViewedNotificationsAt: (ts: number) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      setNotifications: (updater) => set((state) => ({
        notifications: typeof updater === 'function' ? updater(state.notifications) : updater
      })),
      unreadCount: 0,
      setUnreadCount: (unreadCount) => set({ unreadCount }),
      lastViewedNotificationsAt: 0,
      setLastViewedNotificationsAt: (lastViewedNotificationsAt) => set({ lastViewedNotificationsAt }),
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({ lastViewedNotificationsAt: state.lastViewedNotificationsAt }),
    }
  )
);
