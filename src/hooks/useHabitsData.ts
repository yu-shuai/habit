import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Habit, Post } from '../types';
import { getTodayString } from '../utils/app';

interface UseHabitsDataParams {
  userId: string | undefined;
  setTasks: (tasks: Habit[]) => void;
  setCompletedTasks: (tasks: Habit[]) => void;
  setActivities: (activities: Post[]) => void;
}

export const useHabitsData = ({
  userId,
  setTasks,
  setCompletedTasks,
  setActivities,
}: UseHabitsDataParams) => {
  const fetchHabits = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .or(`user_id.eq.${userId},creator_id.eq.${userId},members.cs.[{"id":"${userId}"}]`);

    if (data) {
      const mapped = data.map(h => ({
        id: h.id,
        name: h.name,
        totalDays: h.total_days || 30,
        currentProgress: h.current_progress || 0,
        type: h.type || 'single',
        status: h.status || 'normal',
        isCompletedToday: h.type === 'team'
          ? (h.members || []).find((m: any) => m.id === userId)?.lastCheckDate === getTodayString()
          : h.last_check_date === getTodayString(),
        isArchived: h.is_archived || false,
        isFailed: h.is_failed || false,
        archivedAt: h.archived_at || undefined,
        penaltyMode: h.penalty_mode || false,
        penaltyDays: h.penalty_days || 0,
        lastCheckDate: h.last_check_date || undefined,
        voteStatus: h.vote_status || [],
        creatorId: h.creator_id,
        inviteCode: h.invite_code,
        members: h.members || [],
        isStarted: h.is_started ?? true,
      }));

      setTasks(mapped.filter(t => !t.isArchived));
      setCompletedTasks(mapped.filter(t => t.isArchived));
    } else if (error) {
      console.error('fetchHabits:', error.message);
    }
  }, [userId, setTasks, setCompletedTasks]);

  const fetchActivities = useCallback(async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setActivities(
        data.map(a => ({
          ...a,
          likedBy: a.liked_by || [],
          habitId: a.habit_id,
          createdAt: new Date(a.created_at).getTime(),
        }))
      );
    } else if (error) {
      console.error('fetchActivities:', error.message);
    }
  }, [setActivities]);

  return { fetchHabits, fetchActivities };
};
