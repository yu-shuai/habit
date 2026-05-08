import { useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Habit, Post, Visibility } from '../types';
import { getTodayString } from '../utils/app';

interface UseHabitsDataParams {
  userId: string | undefined;
  setTasks: (tasks: Habit[]) => void;
  setCompletedTasks: (tasks: Habit[]) => void;
  setActivities: (activities: Post[]) => void;
  setFetchStatus?: (status: string) => void;
}

export const useHabitsData = ({
  userId,
  setTasks,
  setCompletedTasks,
  setActivities,
  setFetchStatus,
}: UseHabitsDataParams) => {
  const lastFetchRef = useRef<number>(0);

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
        captainDeleted: h.captain_deleted || false,
      }));

      setTasks(mapped.filter(t => !t.isArchived));
      setCompletedTasks(mapped.filter(t => t.isArchived));
    } else if (error) {
      console.error('fetchHabits:', error.message);
    }
  }, [userId, setTasks, setCompletedTasks]);

  const fetchActivities = useCallback(async (offset = 0, limit = 20) => {
    if (!userId) return;
    
    const now = Date.now();
    if (offset === 0 && now - lastFetchRef.current < 1000) return;
    if (offset === 0) lastFetchRef.current = now;

    try {
      setFetchStatus?.('fetching...');

      // 1. Get own activities (limit 50 for performance if offset > 0)
      const lightCols = 'id,habit_id,user_id,user,images,tag,liked_by,comments,visibility,content,created_at';
      
      const { data: rawData, error } = await supabase
        .from('activities')
        .select(lightCols)
        .or(`visibility.eq.public,user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('fetchActivities error:', error.message);
        setFetchStatus?.(`error: ${error.message}`);
        return;
      }

      const mapped: Post[] = (rawData || []).map(a => {
        const dateStr = a.created_at ? String(a.created_at).replace(' ', 'T') : null;
        const ts = dateStr ? new Date(dateStr).getTime() : Date.now();
        
        return {
          id: String(a.id),
          habitId: a.habit_id ? String(a.habit_id).trim() : '',
          user: a.user || { id: a.user_id, name: '未知用户', avatar: '' },
          images: a.images || [],
          tag: a.tag || '',
          likedBy: a.liked_by || [],
          comments: a.comments || [],
          visibility: String(a.visibility || 'public').trim().toLowerCase() as Visibility,
          content: a.content || '',
          createdAt: isNaN(ts) ? Date.now() : ts,
          type: undefined,
        };
      });

      if (offset === 0) {
        setActivities(mapped);
      } else {
        setActivities((prev: Post[]) => {
          const existingIds = new Set(prev.map(p => p.id));
          const newOnes = mapped.filter(m => !existingIds.has(m.id));
          return [...prev, ...newOnes].sort((a, b) => b.createdAt - a.createdAt);
        });
      }
      
      setFetchStatus?.(`ok: ${mapped.length}`);
    } catch (err: any) {
      console.error('fetchActivities unexpected error:', err);
      setFetchStatus?.(`crash: ${err?.message || 'unknown'}`);
    }
  }, [userId, setActivities]);

  return { fetchHabits, fetchActivities };

};
