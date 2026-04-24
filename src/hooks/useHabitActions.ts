import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Habit, Post, UserProfile, VoteEntry } from '../types';
import { getMedalForDays, getTodayString } from '../utils/app';

const today = getTodayString;
const daysBetween = (a: string, b: string) =>
  Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

interface UseHabitActionsParams {
  session: any;
  userProfile: UserProfile;
  tasks: Habit[];
  completedTasks: Habit[];
  taskName: string;
  taskDays: number;
  taskType: 'single' | 'team';
  joinCode: string;
  activities: Post[];
  setTasks: (updater: (prev: Habit[]) => Habit[]) => void;
  setCompletedTasks: (updater: (prev: Habit[]) => Habit[]) => void;
  setActivities: (updater: (prev: Post[]) => Post[]) => void;
  setConfirmDeleteId: (id: string | null) => void;
  confirmDeleteId: string | null;
  setDecisionHabit: (habit: Habit | null) => void;
  setSelectedMedal: (medal: { days: number; taskName: string } | null) => void;
  setIsModalOpen: (open: boolean) => void;
  setTaskName: (name: string) => void;
  setJoinCode: (code: string) => void;
  setUserCheckInDays: (updater: (prev: number) => number) => void;
  setShowFireworks: (show: boolean) => void;
  showToast: (message: string) => void;
}



export const useHabitActions = ({
  session,
  userProfile,
  tasks,
  completedTasks,
  taskName,
  taskDays,
  taskType,
  joinCode,
  activities,
  setTasks,
  setCompletedTasks,
  setActivities,
  setConfirmDeleteId,
  confirmDeleteId,
  setDecisionHabit,
  setSelectedMedal,
  setIsModalOpen,
  setTaskName,
  setJoinCode,
  setUserCheckInDays,
  setShowFireworks,
  showToast,
}: UseHabitActionsParams) => {

  /** ─── 检查每个任务是否断签，更新惩罚/失败状态 ─── */
  const checkAndUpdateStreaks = useCallback(async (currentTasks: Habit[]) => {
    const todayStr = today();
    for (const habit of currentTasks) {
      if (habit.isArchived || habit.isFailed || !habit.lastCheckDate) continue;
      if (habit.lastCheckDate === todayStr) continue;

      const diff = daysBetween(habit.lastCheckDate, todayStr);
      if (diff <= 0) continue;

      if (habit.penaltyMode) {
        // 惩罚期内断签 → 直接失败
        if (diff > 1) {
          await supabase.from('habits').update({
            is_failed: true, is_archived: true, archived_at: new Date().toISOString()
          }).eq('id', habit.id);
          setTasks(prev => prev.filter(t => t.id !== habit.id));
          setCompletedTasks(prev => [{ ...habit, isFailed: true, isArchived: true }, ...prev]);
          showToast(`「${habit.name}」惩罚期断签，任务失败`);
        }
      } else {
        if (diff === 1) {
          // 断签1天 → 进入惩罚期
          await supabase.from('habits').update({ penalty_mode: true, penalty_days: 0 }).eq('id', habit.id);
          setTasks(prev => prev.map(t => t.id === habit.id ? { ...t, penaltyMode: true, penaltyDays: 0 } : t));
          showToast(`「${habit.name}」已进入惩罚期，需连续打卡 3 天`);
        } else if (diff >= 2) {
          // 断签2天+ → 失败
          await supabase.from('habits').update({
            is_failed: true, is_archived: true, archived_at: new Date().toISOString()
          }).eq('id', habit.id);
          setTasks(prev => prev.filter(t => t.id !== habit.id));
          setCompletedTasks(prev => [{ ...habit, isFailed: true, isArchived: true }, ...prev]);
          showToast(`「${habit.name}」连续断签，任务失败`);
        }
      }
    }
  }, [setTasks, setCompletedTasks, showToast]);

  /** ─── 打卡 ─── */
  const handleCheck = useCallback(async (id: string, skipAutoPost = false) => {
    const habit = tasks.find(t => t.id === id);
    if (!habit || habit.isFailed || habit.isCompletedToday) return;

    if (habit.currentProgress >= habit.totalDays) {
      if (habit.type === 'team' && habit.creatorId !== session?.user?.id) {
        showToast('等待队长进行结算决策');
        return;
      }
      setDecisionHabit(habit);
      return;
    }

    if (habit.isCompletedToday) return;
    if (habit.type === 'team' && !habit.isStarted) return;

    const todayStr = today();

    // 防重复（DB 层）
    const { data: existingLog } = await supabase
      .from('habit_logs')
      .select('id')
      .eq('habit_id', id)
      .eq('user_id', session?.user?.id)
      .eq('completed_date', todayStr)
      .maybeSingle();

    if (existingLog) { showToast('今日已打卡'); return; }

    await supabase.from('habit_logs').insert({
      habit_id: id,
      user_id: session?.user?.id,
      completed_date: todayStr,
    });
    setUserCheckInDays(prev => prev + 1);

    // 标记当前用户今日已打卡
    const updatedMembers = habit.members?.map(m => 
      m.id === session?.user?.id ? { ...m, lastCheckDate: todayStr } : m
    );

    setTasks(prev => prev.map(t => t.id === id ? { 
      ...t, 
      isCompletedToday: true,
      members: updatedMembers 
    } : t));
    
    await supabase.from('habits').update({ 
      is_completed_today: true,
      members: updatedMembers
    }).eq('id', id);

    if (habit.type === 'team') {
      // 团队：根据成员列表中的 lastCheckDate 判断是否全员打卡
      const allChecked = (updatedMembers || []).every(m => m.lastCheckDate === todayStr);

      if (allChecked) {
        const newProgress = Math.min(habit.currentProgress + 1, habit.totalDays);
        setTasks(prev => prev.map(t =>
          t.id === id ? { ...t, currentProgress: newProgress, lastCheckDate: todayStr } : t
        ));
        await supabase.from('habits').update({
          current_progress: newProgress,
          last_check_date: todayStr,
        }).eq('id', id);

        if (newProgress >= habit.totalDays) {
          // 团队任务完成，不再自动弹窗，提示队长点击
          if (habit.creatorId === session?.user?.id) {
            showToast('🎉 团队任务完成！请点击卡片领取奖励');
          } else {
            showToast('🎉 团队任务已完成，等待队长决策');
          }
        }
        showToast('🎉 全员打卡！进度 +1');
      } else {
        const remaining = (updatedMembers || []).filter(m => m.lastCheckDate !== todayStr).length;
        showToast(`已打卡！还差 ${remaining} 人`);
      }
    } else {
      // 个人任务：处理惩罚期逻辑
      let newProgress = habit.currentProgress;
      let newPenaltyMode = habit.penaltyMode ?? false;
      let newPenaltyDays = (habit.penaltyDays ?? 0) + (newPenaltyMode ? 1 : 0);

      if (newPenaltyMode) {
        if (newPenaltyDays >= 3) {
          // 惩罚期解除，补 +1
          newProgress = Math.min(habit.currentProgress + 1, habit.totalDays);
          newPenaltyMode = false;
          newPenaltyDays = 0;
          showToast('🎊 惩罚期解除！进度 +1');
        } else {
          showToast(`惩罚期打卡 ${newPenaltyDays}/3`);
        }
      } else {
        newProgress = Math.min(habit.currentProgress + 1, habit.totalDays);
      }

      setTasks(prev => prev.map(t =>
        t.id === id ? {
          ...t,
          currentProgress: newProgress,
          penaltyMode: newPenaltyMode,
          penaltyDays: newPenaltyDays,
          lastCheckDate: todayStr,
        } : t
      ));

      await supabase.from('habits').update({
        current_progress: newProgress,
        penalty_mode: newPenaltyMode,
        penalty_days: newPenaltyDays,
        last_check_date: todayStr,
      }).eq('id', id);

      if (!newPenaltyMode && newProgress >= habit.totalDays) {
        showToast('🎉 任务完成！请点击卡片领取奖励');
      }
    }

    // 自动发帖
    if (!skipAutoPost) {
      const visibility = habit.type === 'team' ? 'friends' : 'private';
      const autoPost: Post = {
        id: `auto-${id}-${todayStr}`, // Deterministic ID to avoid duplicates on the same day
        habitId: id,
        user: { id: userProfile.id, name: userProfile.name, avatar: userProfile.avatar },
        images: [],
        tag: habit.name,
        likedBy: [],
        comments: [],
        visibility: visibility as Visibility,
        content: `✅ 已完成今日「${habit.name}」挑战！`,
        createdAt: Date.now(),
      };
      
      // Update local state, ensuring no duplicates by ID
      setActivities(prev => {
        if (prev.some(a => a.id === autoPost.id)) return prev;
        return [autoPost, ...prev];
      });

      // Also persist to DB
      await supabase.from('posts').insert({
        id: autoPost.id,
        user_id: userProfile.id,
        habit_id: id,
        content: autoPost.content,
        tag: autoPost.tag,
        visibility: autoPost.visibility,
        images: [],
        created_at: new Date().toISOString()
      });
    }
  }, [session, userProfile, tasks, setTasks, setActivities, setDecisionHabit, setUserCheckInDays, showToast]);

  /** ─── 任务完成决策 ─── */
  const handleDecision = useCallback(async (
    habit: Habit,
    choice: 'cashout' | 'continue',
    customDays?: number
  ) => {
    if (choice === 'cashout') {
      const archivedAt = new Date().toISOString();
      const completedHabit = { ...habit, isArchived: true, archivedAt };
      setCompletedTasks(prev => [completedHabit, ...prev]);
      setTasks(prev => prev.filter(t => t.id !== habit.id));

      const medal = getMedalForDays(habit.totalDays);
      if (medal) setSelectedMedal({ days: medal, taskName: habit.name });

      setShowFireworks(true);
      setTimeout(() => setShowFireworks(false), 3500);

      await supabase.from('habits').update({
        is_archived: true,
        current_progress: habit.totalDays,
        archived_at: archivedAt,
      }).eq('id', habit.id);
    } else {
      const nextGoal = customDays ?? habit.totalDays + 30;
      if (nextGoal <= habit.totalDays) { showToast('新目标天数必须大于当前天数'); return; }

      // 继续挑战：失去保底勋章（前端不弹勋章），重置 isCompletedToday
      setTasks(prev => prev.map(t =>
        t.id === habit.id ? { ...t, totalDays: nextGoal, isCompletedToday: false } : t
      ));
      await supabase.from('habits').update({
        total_days: nextGoal,
        is_completed_today: false,
      }).eq('id', habit.id);
      showToast(`继续挑战！新目标：${nextGoal} 天`);
    }
    setDecisionHabit(null);
  }, [setTasks, setCompletedTasks, setSelectedMedal, setDecisionHabit, setShowFireworks, showToast]);

  /** ─── 团队投票 ─── */
  const handleTeamVote = useCallback(async (
    habitId: string,
    choice: 'continue' | 'cashout',
    newDays?: number
  ) => {
    const habit = tasks.find(t => t.id === habitId);
    if (!habit) return;

    const currentVotes: VoteEntry[] = habit.voteStatus ?? [];
    const alreadyVoted = currentVotes.find(v => v.userId === session?.user?.id);
    if (alreadyVoted) { showToast('你已投票'); return; }

    const newVote: VoteEntry = {
      userId: session?.user?.id,
      choice,
      newDays,
      votedAt: Date.now(),
    };
    const updatedVotes = [...currentVotes, newVote];

    setTasks(prev => prev.map(t => t.id === habitId ? { ...t, voteStatus: updatedVotes } : t));
    await supabase.from('habits').update({ vote_status: updatedVotes }).eq('id', habitId);

    const memberCount = habit.members?.length ?? 1;
    const hasCashout = updatedVotes.some(v => v.choice === 'cashout');
    const allVoted = updatedVotes.length >= memberCount;

    if (hasCashout || allVoted) {
      if (hasCashout || !updatedVotes.every(v => v.choice === 'continue')) {
        // 一票否决 → 结算
        await handleDecision(habit, 'cashout');
      } else {
        // 全员同意 → 继续
        const agreedDays = newDays ?? habit.totalDays + 30;
        await handleDecision(habit, 'continue', agreedDays);
      }
      await supabase.from('habits').update({ vote_status: [] }).eq('id', habitId);
    } else {
      showToast(choice === 'continue' ? `同意继续 ${newDays} 天` : '已投票结束');
    }
  }, [tasks, session, setTasks, handleDecision, showToast]);

  /** ─── 删除 ─── */
  const handleDelete = useCallback((id: string) => {
    const habit = tasks.find(t => t.id === id);
    if (habit?.type === 'team' && habit.isStarted && !habit.isFailed && !habit.isArchived) {
      showToast('团队任务已开始，不可中途退出或删除');
      return;
    }
    setConfirmDeleteId(id);
  }, [tasks, setConfirmDeleteId, showToast]);

  const confirmDelete = useCallback(async () => {
    if (!confirmDeleteId) return;
    setTasks(prev => prev.filter(t => t.id !== confirmDeleteId));
    setCompletedTasks(prev => prev.filter(t => t.id !== confirmDeleteId));
    setActivities(prev => prev.filter(a => a.habitId !== confirmDeleteId));
    await supabase.from('habits').delete().eq('id', confirmDeleteId);
    await supabase.from('activities').delete().eq('habit_id', confirmDeleteId);
    setConfirmDeleteId(null);
    showToast('任务已删除');
  }, [confirmDeleteId, setTasks, setCompletedTasks, setActivities, setConfirmDeleteId, showToast]);

  /** ─── 创建任务 ─── */
  const handleAddTask = useCallback(async () => {
    if (!taskName.trim()) return;
    const newTask: Habit = {
      id: Math.random().toString(36).substring(2, 15),
      name: taskName,
      totalDays: taskDays,
      currentProgress: 0,
      type: taskType,
      status: 'normal',
      isCompletedToday: false,
      creatorId: userProfile.id,
      inviteCode: taskType === 'team'
        ? Math.random().toString(36).substring(2, 8).toUpperCase()
        : undefined,
      members: taskType === 'team'
        ? [{ id: userProfile.id, name: userProfile.name, avatar: userProfile.avatar }]
        : undefined,
      isStarted: taskType === 'single',
    };

    setTasks(prev => [newTask, ...prev]);
    setTaskName('');
    setIsModalOpen(false);

    await supabase.from('habits').insert({
      id: newTask.id,
      user_id: session.user.id,
      name: newTask.name,
      total_days: newTask.totalDays,
      current_progress: 0,
      type: newTask.type,
      status: 'normal',
      is_completed_today: false,
      creator_id: session.user.id,
      invite_code: newTask.inviteCode,
      members: newTask.members,
      is_started: newTask.isStarted,
      is_archived: false,
    });
  }, [session, userProfile, taskName, taskDays, taskType, setTasks, setTaskName, setIsModalOpen]);

  /** ─── 加入团队 ─── */
  const handleJoinTeam = useCallback(async () => {
    if (!joinCode.trim()) return;
    const code = joinCode.trim().toUpperCase();
    let teamTask = tasks.find(t => t.inviteCode === code);

    if (!teamTask) {
      const { data } = await supabase.from('habits').select('*').eq('invite_code', code).single();
      if (data) {
        teamTask = {
          id: data.id, name: data.name, totalDays: data.total_days,
          currentProgress: data.current_progress, type: data.type,
          status: data.status, isCompletedToday: data.is_completed_today,
          creatorId: data.creator_id, inviteCode: data.invite_code,
          members: data.members || [], isStarted: data.is_started,
        };
      } else { showToast('邀请码无效'); return; }
    }

    if (teamTask.isStarted) { showToast('挑战已开始，无法加入'); return; }
    if ((teamTask.members?.length ?? 0) >= 10) { showToast('团队人数已达上限'); return; }
    if (teamTask.members?.find(m => m.id === userProfile.id)) { showToast('你已在团队中'); return; }

    const updatedMembers = [
      ...(teamTask.members || []),
      { id: userProfile.id, name: userProfile.name, avatar: userProfile.avatar },
    ];
    setTasks(prev => {
      const exists = prev.find(t => t.id === teamTask!.id);
      return exists
        ? prev.map(t => t.id === teamTask!.id ? { ...t, members: updatedMembers } : t)
        : [{ ...teamTask!, members: updatedMembers }, ...prev];
    });
    await supabase.from('habits').update({ members: updatedMembers }).eq('id', teamTask.id);
    setJoinCode('');
    showToast('成功加入团队');
  }, [joinCode, tasks, userProfile, setTasks, setJoinCode, showToast]);

  /** ─── 开始团队挑战（锁死） ─── */
  const handleStartTeam = useCallback(async (teamId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === teamId ? { ...t, isStarted: true, inviteCode: '' } : t
    ));
    await supabase.from('habits').update({ is_started: true, invite_code: null }).eq('id', teamId);
    showToast('🚀 挑战已开始，同生共死！');
  }, [setTasks, showToast]);

  /** ─── 踢人（仅开始前） ─── */
  const handleKickMember = useCallback(async (teamId: string, memberId: string) => {
    const habit = tasks.find(t => t.id === teamId);
    if (!habit) return;
    const updatedMembers = habit.members?.filter(m => m.id !== memberId) || [];
    setTasks(prev => prev.map(t => t.id === teamId ? { ...t, members: updatedMembers } : t));
    await supabase.from('habits').update({ members: updatedMembers }).eq('id', teamId);
    showToast('成员已移除');
  }, [tasks, setTasks, showToast]);

  return {
    checkAndUpdateStreaks,
    handleCheck, handleDecision, handleTeamVote,
    handleDelete, confirmDelete,
    handleAddTask, handleJoinTeam, handleStartTeam, handleKickMember,
  };
};
