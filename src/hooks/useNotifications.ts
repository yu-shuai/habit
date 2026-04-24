import { useEffect } from 'react';
import { Habit } from '../types';

/**
 * 每日提醒逻辑：
 * - 20:00 若有未打卡任务 → 个人提醒
 * - 21:00 若团队有人未打卡 → 团队警报
 */
export const useNotifications = (tasks: Habit[], reminderTimes: string[]) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.warn);
    }

    // 请求通知权限
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!tasks.length) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    const scheduleAt = (hhmm: string, fn: () => void) => {
      const [h, m] = hhmm.split(':').map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(h, m, 0, 0);
      if (now >= target) target.setDate(target.getDate() + 1);
      const ms = target.getTime() - now.getTime();
      timers.push(setTimeout(fn, ms));
    };

    reminderTimes.forEach(t => {
      scheduleAt(t, () => {
        const undone = tasks.filter(h => !h.isCompletedToday && !h.isArchived && !h.isFailed);
        if (undone.length > 0) {
          new Notification('🔔 打卡提醒', {
            body: `今日还有 ${undone.length} 个任务未打卡，加油！`,
            icon: '/favicon.ico',
          });
        }
      });
    });

    scheduleAt('20:00', () => {
      const undone = tasks.filter(h => !h.isCompletedToday && !h.isArchived && !h.isFailed && h.type === 'single');
      if (undone.length > 0) {
        new Notification('⚠️ 别忘记打卡！', {
          body: `${undone.map(h => h.name).join('、')} 还未完成，断签将触发惩罚！`,
          icon: '/favicon.ico',
        });
      }
    });

    scheduleAt('21:00', () => {
      const teamTasks = tasks.filter(h => h.type === 'team' && h.isStarted && !h.isArchived && !h.isFailed);
      if (teamTasks.length > 0) {
        new Notification('⚠️ 团队打卡提醒', {
          body: `你有 ${teamTasks.length} 个团队任务，快确认打卡状态！`,
          icon: '/favicon.ico',
        });
      }
    });

    return () => timers.forEach(clearTimeout);
  }, [tasks, reminderTimes]);
};
