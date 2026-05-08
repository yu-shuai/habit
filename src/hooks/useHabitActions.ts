import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Habit, Post, UserProfile, VoteEntry, Visibility } from '../types';
import { getMedalForDays, getTodayString } from '../utils/app';

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
  setConfirmDeleteMeta?: (meta: { id: string; name: string; isArchived: boolean } | null) => void;
  setDecisionHabit: (habit: Habit | null) => void;
  setSelectedMedal: (medal: { days: number; taskName: string } | null) => void;
  setIsModalOpen: (open: boolean) => void;
  setTaskName: (name: string) => void;
  setJoinCode: (code: string) => void;
  setUserCheckInDays: (updater: (prev: number) => number) => void;
  setShowFireworks: (show: boolean) => void;
  showToast: (message: string) => void;
  setHabitLogs: (updater: (prev: any[]) => any[]) => void;
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
  setConfirmDeleteMeta,
  setDecisionHabit,
  setSelectedMedal,
  setIsModalOpen,
  setTaskName,
  setJoinCode,
  setUserCheckInDays,
  setShowFireworks,
  showToast,
  setHabitLogs,
}: UseHabitActionsParams) => {

  /** ─── 检查每个任务是否断签，更新惩罚/失败状态 ─── */
  const checkAndUpdateStreaks = useCallback(async (currentTasks: Habit[]) => {
    const todayStr = getTodayString();
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    for (const habit of currentTasks) {
      if (habit.isArchived || habit.isFailed || !habit.lastCheckDate) continue;
      if (habit.lastCheckDate === todayStr) continue;

      if (habit.penaltyMode) {
        if (habit.lastCheckDate < yesterdayStr) {
          await supabase.from('habits').update({
            is_failed: true, is_archived: true, archived_at: new Date().toISOString()
          }).eq('id', habit.id);
          setTasks(prev => prev.filter(t => t.id !== habit.id));
          setCompletedTasks(prev => [{ ...habit, isFailed: true, isArchived: true }, ...prev]);
          showToast(`「${habit.name}」惩罚期断签，任务失败`);
        }
      } else {
        if (habit.lastCheckDate < yesterdayStr) {
          await supabase.from('habits').update({ penalty_mode: true, penalty_days: 0 }).eq('id', habit.id);
          setTasks(prev => prev.map(t => t.id === habit.id ? { ...t, penaltyMode: true, penaltyDays: 0 } : t));
          showToast(`「${habit.name}」已进入惩罚期，需连续打卡 3 天`);
        }
      }
    }
  }, [setTasks, setCompletedTasks, showToast]);

  /** ─── 打卡 ─── */
  const handleCheck = useCallback(async (id: string, skipAutoPost = false) => {
    const habit = tasks.find(t => t.id === id);
    if (!habit || habit.isFailed) return;

    if (habit.currentProgress >= habit.totalDays) {
      if (habit.type === 'team' && habit.creatorId !== session?.user?.id) {
        showToast('等待队长进行结算决策');
        return;
      }
      setDecisionHabit(habit);
      return;
    }

    if (habit.type === 'team' && !habit.isStarted) return;

    const todayStr = getTodayString();

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
    setHabitLogs(prev => [...prev, { 
      habit_id: id, 
      user_id: session?.user?.id, 
      completed_date: todayStr 
    }]);

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
            showToast('🎉 团队任务完成！点击卡片进行结算');
          } else {
            showToast('🎉 团队任务已完成，等待队长结算');
          }
        }
        showToast('🎉 全员打卡！进度 +1');
      } else {
        const remaining = (updatedMembers || []).filter(m => m.lastCheckDate !== todayStr).length;
        showToast(`已打卡！还差 ${remaining} 人`);
      }
      setShowFireworks(true);
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
        showToast('🎉 任务完成！点击卡片进行结算');
      }
      
      // 触发庆祝动效
      setShowFireworks(true);
    }

    if (!skipAutoPost) {
      const visibility = habit.type === 'team' ? 'friends' : 'private';
      // 统一使用进度作为天数，确保与 UI 和手动打卡逻辑一致
      const isTeam = habit.type === 'team';
      const allMembersChecked = isTeam && (habit.members?.every(m => 
        m.id === session?.user?.id ? true : m.lastCheckDate === todayStr
      ));
      const dayNumber = isTeam 
        ? (allMembersChecked ? habit.currentProgress + 1 : habit.currentProgress || 1)
        : newProgress;

      const autoPostId = `auto-${id}-${userProfile.id}-${todayStr}`;
      const autoPost: Post = {
        id: autoPostId,
        habitId: id,
        user: { id: userProfile.id, name: userProfile.name, avatar: userProfile.avatar },
        images: [],
        tag: `${habit.name} · 第${dayNumber}天`,
        likedBy: [],
        comments: [],
        visibility: visibility as Visibility,
        content: `✅ 已完成今日「${habit.name}」挑战！第 ${dayNumber} 天`,
        createdAt: Date.now(),
      };
      
      setActivities(prev => {
        if (prev.some(a => a.id === autoPost.id)) return prev;
        return [autoPost, ...prev];
      });

      await supabase.from('activities').insert({
        id: autoPostId,
        habit_id: id,
        user_id: userProfile.id,
        user: autoPost.user,
        images: [],
        tag: autoPost.tag,
        content: autoPost.content,
        visibility: autoPost.visibility,
        liked_by: [],
        comments: [],
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
      if (medal) {
        setSelectedMedal({ days: medal, taskName: habit.name });
        // Persist medal as an activity record (won't be removed when deleting habit)
        const medalActivityId = `medal-${habit.id}-${medal}-${Date.now()}`;
        const medalPost: any = {
          id: medalActivityId,
          habit_id: habit.id,
          habitId: habit.id,
          user_id: userProfile.id,
          user: { id: userProfile.id, name: userProfile.name, avatar: userProfile.avatar },
          images: [],
          tag: `medal:${medal}`,
          content: `🏅 获得 ${medal} 天勋章 · 「${habit.name}」`,
          visibility: 'private',
          liked_by: [],
          likedBy: [],
          comments: [],
          created_at: new Date().toISOString(),
          createdAt: Date.now(),
          type: 'medal',
        };
        setActivities(prev => [medalPost as Post, ...prev]);
        await supabase.from('activities').insert({
          id: medalActivityId,
          habit_id: habit.id,
          user_id: userProfile.id,
          user: medalPost.user,
          images: [],
          tag: medalPost.tag,
          content: medalPost.content,
          visibility: 'private',
          liked_by: [],
          comments: [],
          type: 'medal',
        });
      }

      setShowFireworks(true);
      setTimeout(() => setShowFireworks(false), 6000);

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
  }, [setTasks, setCompletedTasks, setActivities, setSelectedMedal, setDecisionHabit, setShowFireworks, showToast, userProfile]);

  /** ─── 团队投票 ─── */
  const handleTeamVote = useCallback(async (
    habitId: string,
    choice: 'continue' | 'cashout',
    newDays?: number
  ) => {
    const habit = tasks.find(t => t.id === habitId);
    if (!habit) return;

    const userId = session?.user?.id;
    if (!userId) return;

    const memberCount = habit.members?.length ?? 1;
    const currentVotes: VoteEntry[] = habit.voteStatus ?? [];
    const proposal = currentVotes.find(v => v.userId === habit.creatorId && v.choice === 'continue' && typeof v.newDays === 'number');
    const now = Date.now();

    // Captain initiates settlement
    if (!proposal) {
      if (habit.creatorId !== userId) {
        showToast('等待队长发起结算/加码投票');
        return;
      }

      if (choice === 'cashout') {
        await handleDecision(habit, 'cashout');
        await supabase.from('habits').update({ vote_status: [] }).eq('id', habitId);
        setTasks(prev => prev.map(t => t.id === habitId ? { ...t, voteStatus: [] } : t));
        return;
      }

      const proposedDays = newDays;
      if (!proposedDays || proposedDays <= habit.totalDays) {
        showToast('加码天数必须大于当前目标天数');
        return;
      }

      const captainProposal: VoteEntry = { userId, choice: 'continue', newDays: proposedDays, votedAt: now };
      const updated = [captainProposal];
      setTasks(prev => prev.map(t => t.id === habitId ? { ...t, voteStatus: updated } : t));
      await supabase.from('habits').update({ vote_status: updated }).eq('id', habitId);
      showToast(`已发起加码投票：${proposedDays} 天（24小时内需全员同意）`);
      return;
    }

    // Timeout → treat as veto
    const isTimedOut = (now - proposal.votedAt) > 24 * 60 * 60 * 1000;
    if (isTimedOut) {
      await handleDecision(habit, 'cashout');
      await supabase.from('habits').update({ vote_status: [] }).eq('id', habitId);
      setTasks(prev => prev.map(t => t.id === habitId ? { ...t, voteStatus: [] } : t));
      showToast('投票超时：按拒绝处理，已结算');
      return;
    }

    const alreadyVoted = currentVotes.some(v => v.userId === userId);
    if (alreadyVoted) { showToast('你已投票'); return; }
    if (habit.creatorId === userId) { showToast('你已发起投票，等待队员表态'); return; }

    if (choice === 'cashout') {
      const updatedVotes = [...currentVotes, { userId, choice: 'cashout', votedAt: now } as VoteEntry];
      setTasks(prev => prev.map(t => t.id === habitId ? { ...t, voteStatus: updatedVotes } : t));
      await supabase.from('habits').update({ vote_status: updatedVotes }).eq('id', habitId);
      await handleDecision(habit, 'cashout');
      await supabase.from('habits').update({ vote_status: [] }).eq('id', habitId);
      setTasks(prev => prev.map(t => t.id === habitId ? { ...t, voteStatus: [] } : t));
      return;
    }

    // Member agrees
    const updatedVotes = [...currentVotes, { userId, choice: 'continue', votedAt: now } as VoteEntry];
    setTasks(prev => prev.map(t => t.id === habitId ? { ...t, voteStatus: updatedVotes } : t));
    await supabase.from('habits').update({ vote_status: updatedVotes }).eq('id', habitId);

    const hasVeto = updatedVotes.some(v => v.choice === 'cashout');
    const allMembersVoted = updatedVotes.length >= memberCount; // includes captain proposal
    const allContinue = allMembersVoted && !hasVeto && updatedVotes.every(v => v.choice === 'continue');

    if (allContinue) {
      // Apply extension (no medal now). Keep current_progress as-is, just raise total_days.
      const nextGoal = proposal.newDays!;
      setTasks(prev => prev.map(t => t.id === habitId ? { ...t, totalDays: nextGoal, isCompletedToday: false, voteStatus: [] } : t));
      await supabase.from('habits').update({
        total_days: nextGoal,
        is_completed_today: false,
        vote_status: [],
      }).eq('id', habitId);
      showToast(`全员同意：进入加码延期（${nextGoal} 天）`);
    } else {
      showToast('已投票');
    }
  }, [tasks, session, setTasks, handleDecision, showToast]);

  /** ─── 团队投票超时扫描（24h 未全员同意 → 结算） ─── */
  const checkTeamVoteTimeouts = useCallback(async (currentTasks: Habit[]) => {
    const now = Date.now();
    const candidates = currentTasks.filter(h => h.type === 'team' && (h.voteStatus?.length || 0) > 0 && h.currentProgress >= h.totalDays && !h.isFailed && !h.isArchived);
    for (const habit of candidates) {
      const proposal = (habit.voteStatus || []).find(v => v.userId === habit.creatorId && v.choice === 'continue' && typeof v.newDays === 'number');
      if (!proposal) continue;
      const memberCount = habit.members?.length ?? 1;
      const hasVeto = (habit.voteStatus || []).some(v => v.choice === 'cashout');
      const allMembersVoted = (habit.voteStatus || []).length >= memberCount;
      const allContinue = allMembersVoted && !hasVeto && (habit.voteStatus || []).every(v => v.choice === 'continue');
      if (allContinue) continue;
      if ((now - proposal.votedAt) > 24 * 60 * 60 * 1000) {
        await handleDecision(habit, 'cashout');
        await supabase.from('habits').update({ vote_status: [] }).eq('id', habit.id);
        setTasks(prev => prev.map(t => t.id === habit.id ? { ...t, voteStatus: [] } : t));
      }
    }
  }, [handleDecision, setTasks]);

  /** ─── 删除 ─── */
  const handleDelete = useCallback((id: string) => {
    const habit = tasks.find(t => t.id === id) || completedTasks.find(t => t.id === id);
    if (!habit) return;

    if (habit.type === 'team' && habit.isStarted && !habit.isFailed && !habit.isArchived && !habit.captainDeleted) {
      if (habit.creatorId === session?.user?.id) {
        setConfirmDeleteId(id);
        setConfirmDeleteMeta?.({ id, name: habit.name, isArchived: false });
      } else {
        showToast('只有队长可以删除进行中的团队任务');
      }
      return;
    }
    setConfirmDeleteId(id);
    setConfirmDeleteMeta?.({ id, name: habit.name, isArchived: !!habit.isArchived });
  }, [tasks, completedTasks, session, setConfirmDeleteId, showToast]);

  const confirmDelete = useCallback(async () => {
    if (!confirmDeleteId) return;
    const habit = tasks.find(t => t.id === confirmDeleteId) || completedTasks.find(t => t.id === confirmDeleteId);

    if (habit?.type === 'team' && habit.isStarted && !habit.isFailed && !habit.isArchived && !habit.captainDeleted && habit.creatorId === session?.user?.id) {
      await supabase.from('habits').update({ captain_deleted: true }).eq('id', confirmDeleteId);
      setTasks(prev => prev.map(t => t.id === confirmDeleteId ? { ...t, captainDeleted: true } : t));
      setCompletedTasks(prev => prev.map(t => t.id === confirmDeleteId ? { ...t, captainDeleted: true } : t));
      setConfirmDeleteId(null);
      setConfirmDeleteMeta?.(null);
      showToast('任务已标记为删除，队员可自行移除');
      return;
    }

    setTasks(prev => prev.filter(t => t.id !== confirmDeleteId));
    setCompletedTasks(prev => prev.filter(t => t.id !== confirmDeleteId));
    setActivities(prev => prev.filter(a => a.habitId !== confirmDeleteId));
    await supabase.from('habits').delete().eq('id', confirmDeleteId);
    await supabase.from('activities').delete().eq('habit_id', confirmDeleteId).neq('type', 'medal');
    setConfirmDeleteId(null);
    setConfirmDeleteMeta?.(null);
    showToast('任务已删除');
  }, [confirmDeleteId, tasks, completedTasks, session, setTasks, setCompletedTasks, setActivities, setConfirmDeleteId, showToast]);

  /** ─── 创建任务 ─── */
  const handleAddTask = useCallback(async () => {
    if (!taskName.trim()) return;
    const newTask: Habit = {
      id: crypto.randomUUID(),
      name: taskName,
      totalDays: taskDays,
      currentProgress: 0,
      type: taskType,
      status: 'normal',
      isCompletedToday: false,
      creatorId: userProfile.id,
      inviteCode: taskType === 'team'
        ? crypto.randomUUID().substring(0, 6).toUpperCase()
        : undefined,
      members: taskType === 'team'
        ? [{ id: userProfile.id, name: userProfile.name, avatar: userProfile.avatar }]
        : undefined,
      isStarted: taskType === 'single',
    };

    setTasks(prev => [newTask, ...prev]);
    setTaskName('');
    setIsModalOpen(false);

    const { error } = await supabase.from('habits').insert({
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
    if (error) {
      // Rollback optimistic update
      setTasks(prev => prev.filter(t => t.id !== newTask.id));
      showToast('创建任务失败，请重试');
    }
  }, [session, userProfile, taskName, taskDays, taskType, setTasks, setTaskName, setIsModalOpen, showToast]);

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
    const prevTasks = [...tasks];
    setTasks(prev => {
      const exists = prev.find(t => t.id === teamTask!.id);
      return exists
        ? prev.map(t => t.id === teamTask!.id ? { ...t, members: updatedMembers } : t)
        : [{ ...teamTask!, members: updatedMembers }, ...prev];
    });
    const { error } = await supabase.from('habits').update({ members: updatedMembers }).eq('id', teamTask.id);
    if (error) {
      setTasks(() => prevTasks);
      showToast('加入团队失败，请重试');
      return;
    }
    setJoinCode('');
    showToast('成功加入团队');
  }, [joinCode, tasks, userProfile, setTasks, setJoinCode, showToast]);

  /** ─── 开始团队挑战（锁死） ─── */
  const handleStartTeam = useCallback(async (teamId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === teamId ? { ...t, isStarted: true, inviteCode: '' } : t
    ));
    const { error } = await supabase.from('habits').update({ is_started: true, invite_code: null }).eq('id', teamId);
    if (error) {
      setTasks(prev => prev.map(t =>
        t.id === teamId ? { ...t, isStarted: false } : t
      ));
      showToast('开始挑战失败，请重试');
      return;
    }
    showToast('🚀 挑战已开始，同生共死！');
  }, [setTasks, showToast]);

  /** ─── 踢人（仅开始前） ─── */
  const handleKickMember = useCallback(async (teamId: string, memberId: string) => {
    const habit = tasks.find(t => t.id === teamId);
    if (!habit) return;
    const updatedMembers = habit.members?.filter(m => m.id !== memberId) || [];
    setTasks(prev => prev.map(t => t.id === teamId ? { ...t, members: updatedMembers } : t));
    const { error } = await supabase.from('habits').update({ members: updatedMembers }).eq('id', teamId);
    if (error) {
      setTasks(prev => prev.map(t => t.id === teamId ? { ...t, members: habit.members } : t));
      showToast('移除成员失败，请重试');
      return;
    }
    showToast('成员已移除');
  }, [tasks, setTasks, showToast]);

  /** ─── 领取已完成任务的奖励 ─── */
  const handleClaimReward = useCallback(async (habit: Habit) => {
    const existingMedal = activities.find(
      a => a.type === 'medal' && a.habitId === habit.id && (a.user?.id === userProfile.id || (a as any).user_id === userProfile.id)
    );
    if (existingMedal) {
      showToast('奖励已领取');
      return;
    }

    const medal = getMedalForDays(habit.totalDays);
    if (medal) {
      setSelectedMedal({ days: medal, taskName: habit.name });
      const medalActivityId = `medal-${habit.id}-${medal}-${userProfile.id}`;
      const medalPost: any = {
        id: medalActivityId,
        habit_id: habit.id,
        habitId: habit.id,
        user_id: userProfile.id,
        user: { id: userProfile.id, name: userProfile.name, avatar: userProfile.avatar },
        images: [],
        tag: `medal:${medal}`,
        content: `🏅 获得 ${medal} 天勋章 · 「${habit.name}」`,
        visibility: 'private',
        liked_by: [],
        likedBy: [],
        comments: [],
        created_at: new Date().toISOString(),
        createdAt: Date.now(),
        type: 'medal',
      };
      setActivities(prev => [medalPost as Post, ...prev]);
      await supabase.from('activities').insert({
        id: medalActivityId,
        habit_id: habit.id,
        user_id: userProfile.id,
        user: medalPost.user,
        images: [],
        tag: medalPost.tag,
        content: medalPost.content,
        visibility: 'private',
        liked_by: [],
        comments: [],
        type: 'medal',
      });
    }
    setShowFireworks(true);
    setTimeout(() => setShowFireworks(false), 6000);
  }, [activities, userProfile, setSelectedMedal, setActivities, setShowFireworks, showToast]);

  return {
    checkAndUpdateStreaks,
    handleCheck, handleDecision, handleTeamVote,
    checkTeamVoteTimeouts,
    handleDelete, confirmDelete,
    handleAddTask, handleJoinTeam, handleStartTeam, handleKickMember,
    handleClaimReward,
  };
};
