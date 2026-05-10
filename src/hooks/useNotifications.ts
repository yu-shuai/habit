import { useEffect } from 'react';
import { Habit } from '../types';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const hasNotificationAPI = typeof window !== 'undefined' && 'Notification' in window;

export const useNotifications = (tasks: Habit[], reminderTimes: string[]) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setupNotifications = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          let permStatus = await LocalNotifications.checkPermissions();
          if (permStatus.display !== 'granted') {
            await LocalNotifications.requestPermissions();
          }
        } catch (e) {
          console.warn('Capacitor LocalNotifications error:', e);
        }
      } else {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js').catch(console.warn);
        }
        if (hasNotificationAPI && Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }
    };
    
    setupNotifications();
  }, []);

  useEffect(() => {
    if (!tasks.length) return;

    const scheduleWeb = (hhmm: string, title: string, body: string) => {
      if (!hasNotificationAPI || Notification.permission !== 'granted') return;
      const [h, m] = hhmm.split(':').map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(h, m, 0, 0);
      if (now >= target) target.setDate(target.getDate() + 1);
      const ms = target.getTime() - now.getTime();
      return setTimeout(() => {
        new Notification(title, { body, icon: '/favicon.ico' });
      }, ms);
    };

    const scheduleNative = async (id: number, hhmm: string, title: string, body: string) => {
      try {
        const [h, m] = hhmm.split(':').map(Number);
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id,
              schedule: { on: { hour: h, minute: m }, repeats: true },
            }
          ]
        });
      } catch (e) {
        console.warn('Failed to schedule native notification:', e);
      }
    };

    const timers: ReturnType<typeof setTimeout>[] = [];

    const schedule = (id: number, hhmm: string, condition: () => boolean, title: string, getBody: () => string) => {
      if (Capacitor.isNativePlatform()) {
        // Native notifications run in background, we can't evaluate dynamic conditions at trigger time.
        // So we schedule it anyway, but normally apps handle dynamic conditions in background tasks.
        // For simplicity, we just schedule a static reminder if they have undone tasks NOW.
        if (condition()) {
          scheduleNative(id, hhmm, title, getBody());
        }
      } else {
        const timerId = scheduleWeb(hhmm, title, getBody());
        if (timerId) timers.push(timerId);
      }
    };

    // Clear existing native notifications before re-scheduling
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }, { id: 3 }] }).catch(() => {});
    }

    reminderTimes.forEach((t, i) => {
      schedule(i + 10, t, () => {
        const undone = tasks.filter(h => !h.isCompletedToday && !h.isArchived && !h.isFailed);
        return undone.length > 0;
      }, '🔔 打卡提醒', () => {
        const undone = tasks.filter(h => !h.isCompletedToday && !h.isArchived && !h.isFailed);
        return `今日还有 ${undone.length} 个任务未打卡，加油！`;
      });
    });

    schedule(1, '20:00', () => {
      const undone = tasks.filter(h => !h.isCompletedToday && !h.isArchived && !h.isFailed && h.type === 'single');
      return undone.length > 0;
    }, '⚠️ 别忘记打卡！', () => {
      const undone = tasks.filter(h => !h.isCompletedToday && !h.isArchived && !h.isFailed && h.type === 'single');
      return `${undone.map(h => h.name).join('、')} 还未完成，断签将触发惩罚！`;
    });

    schedule(2, '21:00', () => {
      const teamTasks = tasks.filter(h => h.type === 'team' && h.isStarted && !h.isArchived && !h.isFailed);
      return teamTasks.length > 0;
    }, '⚠️ 团队打卡提醒', () => {
      const teamTasks = tasks.filter(h => h.type === 'team' && h.isStarted && !h.isArchived && !h.isFailed);
      return `你有 ${teamTasks.length} 个团队任务，快确认打卡状态！`;
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [tasks, reminderTimes]);
};
