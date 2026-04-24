import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SessionBootstrapOptions {
  session: any;
  fetchActivities: () => void;
  fetchFriendRequests: () => void;
  fetchFriends: () => void;
  fetchHabits: () => void;
  fetchProfile: () => void;
}

interface AppearanceOptions {
  appearance: 'system' | 'light' | 'dark';
  appBackground: string | null;
}

interface ReminderOptions {
  dailyReminder: boolean;
  reminderTimes: string[];
  showToast: (message: string) => void;
}

export const useSupabaseSession = (
  setSession: (session: any) => void,
  setIsPasswordModalOpen: (isOpen: boolean) => void,
) => {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordModalOpen(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [setIsPasswordModalOpen, setSession]);
};

export const useSessionBootstrap = ({
  session,
  fetchActivities,
  fetchFriendRequests,
  fetchFriends,
  fetchHabits,
  fetchProfile,
}: SessionBootstrapOptions) => {
  useEffect(() => {
    if (!session?.user?.id) return;

    fetchProfile();
    fetchHabits();
    fetchActivities();
    fetchFriendRequests();
    fetchFriends();
  }, [fetchActivities, fetchFriendRequests, fetchFriends, fetchHabits, fetchProfile, session]);
};

export const useAppearanceEffects = ({ appearance, appBackground }: AppearanceOptions) => {
  useEffect(() => {
    const root = window.document.documentElement;

    if (appearance === 'dark') {
      root.classList.add('dark');
      if (!appBackground) document.body.style.backgroundColor = '#1a1a1a';
      return;
    }

    if (appearance === 'light') {
      root.classList.remove('dark');
      if (!appBackground) document.body.style.backgroundColor = '#f8f9fa';
      return;
    }

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (isDark) {
      root.classList.add('dark');
      if (!appBackground) document.body.style.backgroundColor = '#1a1a1a';
      return;
    }

    root.classList.remove('dark');
    if (!appBackground) document.body.style.backgroundColor = '#f8f9fa';
  }, [appearance, appBackground]);

  useEffect(() => {
    if (appBackground) {
      document.body.style.backgroundColor = appBackground;
    }
  }, [appBackground]);
};

export const useReminderEffect = ({
  dailyReminder,
  reminderTimes,
  showToast,
}: ReminderOptions) => {
  useEffect(() => {
    if (!dailyReminder) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkReminder = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (!reminderTimes.includes(currentTime)) return;

      if (Notification.permission === 'granted') {
        new Notification('HABIT 提醒', {
          body: '该打卡啦！自律的一天从现在开始任务。',
          icon: '/favicon.ico',
        });
        return;
      }

      showToast('打卡时间到了！');
    };

    const interval = setInterval(checkReminder, 60000);
    checkReminder();

    return () => clearInterval(interval);
  }, [dailyReminder, reminderTimes, showToast]);
};
