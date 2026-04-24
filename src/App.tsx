/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, ChangeEvent, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';
import {
  Plus,
  Home,
  Users,
  CheckSquare,
  User,
  X,
  Check,
  Flame,
  Search,
  Settings,
  Lock,
  LogOut,
  ChevronRight,
  Camera,
  Bell,
  Settings2,
  Copy,
  MoreHorizontal,
  Trash2,
  Clock,
  Mail,
  Shield,
  Palette,
  Headphones,
  Smile,
  Info,
  FileText,
  ShieldCheck
} from 'lucide-react';
import SettingsItem from './components/SettingsItem';
import DecisionOverlay from './components/DecisionOverlay';
import HabitCard from './components/HabitCard';
import MomentItem from './components/MomentItem';
import { CheckInDrawer, CreateTaskModal, DeleteConfirmModal, TaskDetailsDrawer } from './components/CheckInModal';
import {
  SettingsPanel,
  AccountSecurity,
  FeedbackPanel,
  RemindersPanel,
  PrivacyPanel,
  PasswordModal,
  TimePickerModal,
  AppearanceSheet,
  VisibilitySheet,
  MedalModal,
  MoodModal
} from './components/Settings';

// --- Types ---
import { Tab, Visibility, InteractionScope, Habit, Post } from './types';

// --- Main App ---

export default function App() {
  const [session, setSession] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<Tab>('tasks');
  const [homeSubTab, setHomeSubTab] = useState<'discovery' | 'team'>('discovery');
  const [tasksSubTab, setTasksSubTab] = useState<'ongoing' | 'completed'>('ongoing');
  const [tasks, setTasks] = useState<Habit[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Habit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoodOpen, setIsMoodOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkInVisibility, setCheckInVisibility] = useState<Visibility>('public');
  const [checkInHabitId, setCheckInHabitId] = useState<string>('');
  const [checkInContent, setCheckInContent] = useState<string>('');
  const [checkInImages, setCheckInImages] = useState<string[]>([]);
  const [activities, setActivities] = useState<Post[]>([]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<Habit | null>(null);
  const [currentMood, setCurrentMood] = useState('😆');
  const [decisionHabit, setDecisionHabit] = useState<Habit | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingId, setIsEditingId] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '自律玩家',
    avatar: 'https://picsum.photos/seed/me/200/200',
    id: ''
  });
  const [taskName, setTaskName] = useState('');
  const [taskDays, setTaskDays] = useState(30);
  const [taskType, setTaskType] = useState<'single' | 'team'>('single');
  const [joinCode, setJoinCode] = useState('');
  const [settingsCategory, setSettingsCategory] = useState<'root' | 'account' | 'general' | 'about' | 'background'>('root');
  const [activeSubPage, setActiveSubPage] = useState<'account_security' | 'privacy' | 'feedback' | 'reminders' | null>(null);
  const [appBackground, setAppBackground] = useState<string | null>(null);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [phoneDiscovery, setPhoneDiscovery] = useState(true);
  const [defaultVisibility, setDefaultVisibility] = useState<Visibility>('public');
  const [isVisibilitySheetOpen, setIsVisibilitySheetOpen] = useState(false);
  const [appearance, setAppearance] = useState<'system' | 'light' | 'dark'>('system');
  const [isAppearanceSheetOpen, setIsAppearanceSheetOpen] = useState(false);
  const [cacheSize, setCacheSize] = useState('0 B');
  const [reminderTimes, setReminderTimes] = useState<string[]>(['08:00']);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedMedal, setSelectedMedal] = useState<{ days: number; taskName: string } | null>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassInput, setNewPassInput] = useState('');
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [timePickerValue, setTimePickerValue] = useState('08:00');
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);
  const [userCheckInDays, setUserCheckInDays] = useState(0);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any | null>(null);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const bgInputRef = useRef<HTMLInputElement>(null);

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
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
      fetchHabits();
      fetchActivities();
      fetchFriendRequests();
      fetchFriends();
    }
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      const newProfile = {
        id: session.user.id,
        name: session.user.email?.split('@')[0] || '自律玩家',
        avatar: `https://picsum.photos/seed/${session.user.id}/200/200`
      };
      await supabase.from('profiles').insert(newProfile);
      setUserProfile(newProfile);
    } else if (data) {
      setUserProfile(data);
    }

    const { data: logData } = await supabase
      .from('habit_logs')
      .select('completed_date')
      .eq('user_id', session.user.id);

    if (logData) {
      const uniqueDays = new Set(logData.map(l => l.completed_date)).size;
      setUserCheckInDays(uniqueDays);
    }
  };

  const updateProfile = async (updates: Partial<{ name: string; avatar: string }>) => {
    if (!session?.user?.id) return;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id);
    if (error) console.error('Error updating profile:', error.message);
  };

  const updateProfileId = async (newId: string) => {
    if (!session?.user?.id) return;
    if (!newId.trim()) {
      showToast('ID不能为空');
      return;
    }

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', newId)
      .single();

    if (existing && existing.id !== session.user.id) {
      showToast('该ID已被使用');
      setUserProfile(prev => ({ ...prev, id: session.user.id }));
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ id: newId })
      .eq('id', session.user.id);

    if (error) {
      console.error('Error updating ID:', error.message);
      showToast('ID修改失败');
    } else {
      showToast('ID修改成功');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .or(`id.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(10);

    if (data) {
      setSearchResults(data.filter(p => p.id !== session?.user?.id));
    }
    setIsSearching(false);
  };

  const handleSendFriendRequest = async (receiverId: string) => {
    const { error } = await supabase.from('friendships').insert({
      requester_id: session?.user?.id,
      receiver_id: receiverId
    });

    if (error) {
      showToast('已发送过好友请求或已是好友');
    } else {
      showToast('好友请求已发送');
    }
  };

  const handleAcceptFriendRequest = async (requestId: string) => {
    await supabase.from('friendships').update({ status: 'accepted', updated_at: new Date().toISOString() }).eq('id', requestId);
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    showToast('已同意好友请求');
  };

  const handleRejectFriendRequest = async (requestId: string) => {
    await supabase.from('friendships').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('id', requestId);
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    showToast('已拒绝好友请求');
  };

  const fetchFriendRequests = async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from('friendships')
      .select('*')
      .eq('receiver_id', session.user.id)
      .eq('status', 'pending');

    if (data) {
      const requestsWithProfiles = await Promise.all(data.map(async r => {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', r.requester_id).single();
        return { ...r, requester: profile };
      }));
      setFriendRequests(requestsWithProfiles);
    }
  };

  const fetchFriends = async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .eq('status', 'accepted');

    if (data) {
      const friendIds = data.map(d => d.requester_id === session.user.id ? d.receiver_id : d.requester_id);
      const uniqueFriendIds = [...new Set(friendIds)];
      const { data: profiles } = await supabase.from('profiles').select('*').in('id', uniqueFriendIds);
      if (profiles) {
        setFriends(profiles);
      }
    }
  };
  useEffect(() => {
    const root = window.document.documentElement;
    if (appearance === 'dark') {
      root.classList.add('dark');
      if (!appBackground) document.body.style.backgroundColor = '#1a1a1a';
    } else if (appearance === 'light') {
      root.classList.remove('dark');
      if (!appBackground) document.body.style.backgroundColor = '#f8f9fa';
    } else {
      // System
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
        if (!appBackground) document.body.style.backgroundColor = '#1a1a1a';
      } else {
        root.classList.remove('dark');
        if (!appBackground) document.body.style.backgroundColor = '#f8f9fa';
      }
    }
  }, [appearance, appBackground]);

  useEffect(() => {
    if (appBackground) {
      document.body.style.backgroundColor = appBackground;
    }
  }, [appBackground]);

  // Notification Reminder Logic
  useEffect(() => {
    if (!dailyReminder) return;

    // Request permission if needed
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkReminder = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (reminderTimes.includes(currentTime)) {
        if (Notification.permission === 'granted') {
          new Notification('HABIT 提醒', {
            body: '该打卡啦！自律的一天从现在开始任务。',
            icon: '/favicon.ico'
          });
        } else {
          showToast('打卡时间到了！');
        }
      }
    };

    const interval = setInterval(checkReminder, 60000);
    checkReminder();

    return () => clearInterval(interval);
  }, [dailyReminder, reminderTimes]);

  const fetchHabits = async () => {
    if (!session?.user?.id) return;
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .or(`user_id.eq.${session.user.id},creator_id.eq.${session.user.id},members.cs.[{"id":"${session.user.id}"}]`);

    if (data) {
      const mappedTasks = data.map(h => ({
        id: h.id,
        name: h.name,
        totalDays: h.total_days || 30,
        currentProgress: h.current_progress || 0,
        type: h.type || 'single',
        status: h.status || 'normal',
        isCompletedToday: h.is_completed_today || false,
        isArchived: h.is_archived || false,
        creatorId: h.creator_id,
        inviteCode: h.invite_code,
        members: h.members || [],
        isStarted: h.is_started ?? true
      }));

      const active = mappedTasks.filter(t => !t.isArchived);
      const completed = mappedTasks.filter(t => t.isArchived);

      setTasks(active);
      setCompletedTasks(completed);
    } else if (error) {
      console.error('Error fetching habits:', error.message);
    }
  };

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setActivities(data.map(a => ({
        ...a,
        likedBy: a.liked_by || [],
        habitId: a.habit_id,
        createdAt: new Date(a.created_at).getTime()
      })));
    } else if (error) {
      console.error('Error fetching activities:', error.message);
    }
  };

  if (!session) {
    return <Auth onLogin={() => { }} />;
  }

  const isDarkColor = (color: string | null) => {
    if (!color) return false;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  };

  const isDark = isDarkColor(appBackground);

  const emojis = ['🤪', '😆', '🥰', '😎', '🥳', '💪', '👍', '🧐', '😴', '🥱', '😫', '😭', '🤒', '😷', '💔', '😒', '🤯', '🤡', '💩', '👻', '🎸', '📖', '🏀', '⚽', '🌛', '🧡', '👀', '🦥', '😤', '😬', '🌹', '☕', '😊'];

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (upload) => {
        if (upload.target?.result) {
          callback(upload.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const handlePublishCheckIn = async () => {
    if (!checkInHabitId) return;
    const habit = tasks.find(t => t.id === checkInHabitId);
    if (!habit) return;

    const today = new Date().setHours(0, 0, 0, 0);
    // Find any post created by current user for this habit today (auto or custom)
    const existingTodayPost = activities.find(a =>
      a.habitId === checkInHabitId &&
      a.user.id === userProfile.id &&
      new Date(a.createdAt).setHours(0, 0, 0, 0) === today
    );

    if (editingPostId || existingTodayPost) {
      // Update existing post
      const targetId = editingPostId || existingTodayPost?.id;

      const updatedPost = {
        content: checkInContent || existingTodayPost?.content,
        images: checkInImages.length > 0 ? checkInImages : existingTodayPost?.images,
        visibility: checkInVisibility,
        created_at: new Date().toISOString()
      };

      setActivities(prev => prev.map(a => a.id === targetId ? {
        ...a,
        ...updatedPost,
        createdAt: Date.now()
      } : a));

      await supabase.from('activities').update(updatedPost).eq('id', targetId);

      if (!habit.isCompletedToday) {
        handleCheck(checkInHabitId, true);
      }

      showToast(editingPostId ? '修改已保存' : '打卡内容已更新');
    } else {
      // New check-in
      handleCheck(checkInHabitId, true);

      const newPost: Post = {
        id: Date.now().toString(),
        habitId: checkInHabitId,
        user: {
          id: userProfile.id,
          name: userProfile.name,
          avatar: userProfile.avatar
        },
        images: checkInImages,
        tag: habit.name,
        likedBy: [],
        comments: [],
        visibility: checkInVisibility,
        content: checkInContent || '✅ 已打卡，今日挑战达成。',
        createdAt: Date.now()
      };

      setActivities(prev => [newPost, ...prev]);

      await supabase.from('activities').insert({
        id: newPost.id,
        habit_id: newPost.habitId,
        user_id: session.user.id,
        user: newPost.user,
        images: newPost.images,
        tag: newPost.tag,
        content: newPost.content,
        visibility: newPost.visibility,
        liked_by: [],
        comments: [],
        created_at: new Date().toISOString()
      });

      showToast('发布成功');
    }

    setIsCheckInOpen(false);
    setCheckInContent('');
    setCheckInHabitId('');
    setCheckInImages([]);
    setEditingPostId(null);
  };

  const handleAddTask = async () => {
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
      inviteCode: taskType === 'team' ? Math.random().toString(36).substring(2, 8).toUpperCase() : undefined,
      members: taskType === 'team' ? [{ ...userProfile }] : undefined,
      isStarted: taskType === 'single'
    };

    setTasks([newTask, ...tasks]);
    setTaskName('');
    setIsModalOpen(false);

    // Persist to Supabase
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
      is_archived: false
    });
  };

  const handleJoinTeam = async () => {
    if (!joinCode.trim()) return;

    // First search in local tasks
    let teamTask = tasks.find(t => t.inviteCode === joinCode.trim().toUpperCase());

    // If not found locally, search in DB
    if (!teamTask) {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('invite_code', joinCode.trim().toUpperCase())
        .single();

      if (data) {
        teamTask = {
          id: data.id,
          name: data.name,
          totalDays: data.total_days,
          currentProgress: data.current_progress,
          type: data.type,
          status: data.status,
          isCompletedToday: data.is_completed_today,
          creatorId: data.creator_id,
          inviteCode: data.invite_code,
          members: data.members || [],
          isStarted: data.is_started
        };
      } else {
        alert('邀请码无效或团队不存在');
        return;
      }
    }

    if (teamTask.isStarted) {
      alert('挑战已经开始，无法加入');
      return;
    }
    if (teamTask.members?.find(m => m.id === userProfile.id)) {
      alert('你已在团队中');
      return;
    }

    const updatedMembers = [...(teamTask.members || []), { ...userProfile }];

    setTasks(prev => {
      const exists = prev.find(t => t.id === teamTask!.id);
      if (exists) {
        return prev.map(t => t.id === teamTask!.id ? { ...t, members: updatedMembers } : t);
      } else {
        return [{ ...teamTask!, members: updatedMembers }, ...prev];
      }
    });

    await supabase.from('habits')
      .update({ members: updatedMembers })
      .eq('id', teamTask.id);

    setJoinCode('');
    showToast('成功加入团队');
  };

  const handleStartTeam = async (teamId: string) => {
    setTasks(prev => prev.map(t => t.id === teamId ? { ...t, isStarted: true, inviteCode: '' } : t));
    await supabase.from('habits').update({ is_started: true, invite_code: null }).eq('id', teamId);
    showToast('挑战已开始！');
  };

  const handleKickMember = async (teamId: string, memberId: string) => {
    const habit = tasks.find(t => t.id === teamId);
    if (!habit) return;

    const updatedMembers = habit.members?.filter(m => m.id !== memberId) || [];

    setTasks(prev => prev.map(t => t.id === teamId ? {
      ...t,
      members: updatedMembers
    } : t));

    await supabase.from('habits').update({ members: updatedMembers }).eq('id', teamId);
    showToast('成员已移除');
  };

  const handleCheck = (id: string, skipAutoPost = false) => {
    let habitToProcess: Habit | null = null;

    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === id) {
          if (t.isCompletedToday) return t;
          if (t.type === 'team' && !t.isStarted) return t;

          habitToProcess = t;
          const newProgress = Math.min(t.currentProgress + 1, t.totalDays);

          supabase.from('habits').update({
            current_progress: newProgress,
            is_completed_today: true
          }).eq('id', id).then();

          supabase.from('habit_logs').insert({
            habit_id: id,
            user_id: session?.user?.id,
            completed_date: new Date().toISOString().split('T')[0]
          }).then(({ data }) => {
            if (data) {
              setUserCheckInDays(prev => prev + 1);
            }
          });

          return {
            ...t,
            currentProgress: newProgress,
            isCompletedToday: true
          };
        }
        return t;
      });
      return updated;
    });

    // Handle post-update side effects outside of setTasks map
    // We use a small delay or just wait for next tick to ensure tasks state is available if needed,
    // but here we can just use the habitToProcess we captured.
    if (habitToProcess) {
      const habit = habitToProcess as Habit;
      const newProgress = Math.min(habit.currentProgress + 1, habit.totalDays);

      if (newProgress === habit.totalDays) {
        setTimeout(() => setDecisionHabit({ ...habit, currentProgress: newProgress, isCompletedToday: true }), 800);
      }

      if (!skipAutoPost) {
        // Double check activities to prevent duplicates (using functional update to be safe)
        setActivities(prevAct => {
          const today = new Date().setHours(0, 0, 0, 0);
          const existingToday = prevAct.find(a =>
            a.habitId === id &&
            a.user.id === userProfile.id &&
            new Date(a.createdAt).setHours(0, 0, 0, 0) === today
          );

          if (!existingToday) {
            const autoPost: Post = {
              id: `auto-${Date.now()}`,
              habitId: id,
              user: {
                id: userProfile.id,
                name: userProfile.name,
                avatar: userProfile.avatar
              },
              images: [],
              tag: habit.name,
              likedBy: [],
              comments: [],
              visibility: 'private',
              content: '✅ 已打卡，今日挑战达成。',
              createdAt: Date.now()
            };
            return [autoPost, ...prevAct];
          }
          return prevAct;
        });
      }
    }
  };

  const handleDecision = (choice: 'cashout' | 'continue') => {
    if (!decisionHabit) return;

    if (choice === 'cashout') {
      const completedHabit = { ...decisionHabit, isArchived: true };
      setCompletedTasks(prev => [completedHabit, ...prev]);
      setTasks(prev => prev.filter(t => t.id !== decisionHabit.id));
      setSelectedMedal({ days: decisionHabit.totalDays, taskName: decisionHabit.name });

      supabase.from('habits').update({
        is_archived: true,
        current_progress: decisionHabit.totalDays
      }).eq('id', decisionHabit.id).then();
    } else {
      const nextGoalMap: Record<number, number> = { 7: 30, 30: 90, 90: 180, 180: 360, 360: 1000 };
      const nextGoal = nextGoalMap[decisionHabit.totalDays] || decisionHabit.totalDays * 2;

      setTasks(prev => prev.map(t => {
        if (t.id === decisionHabit.id) {
          return {
            ...t,
            totalDays: nextGoal,
            isCompletedToday: false
          };
        }
        return t;
      }));

      supabase.from('habits').update({
        total_days: nextGoal,
        is_completed_today: false
      }).eq('id', decisionHabit.id).then();
    }
    setDecisionHabit(null);
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId) {
      setTasks(prev => prev.filter(t => t.id !== confirmDeleteId));
      setCompletedTasks(prev => prev.filter(t => t.id !== confirmDeleteId));
      setActivities(prev => prev.filter(a => a.habitId !== confirmDeleteId));

      await supabase.from('habits').delete().eq('id', confirmDeleteId);
      await supabase.from('activities').delete().eq('habit_id', confirmDeleteId);

      setConfirmDeleteId(null);
      showToast('任务已删除');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="flex flex-col pb-32">
            <div className="flex gap-8 px-8 mt-4 overflow-x-auto py-2 no-scrollbar">
              <button
                onClick={() => setHomeSubTab('discovery')}
                className={`font-headline font-black text-2xl tracking-tighter italic transition-all ${homeSubTab === 'discovery' ? 'border-b-4 border-black text-black' : 'text-neutral-300'}`}
              >
                广场
              </button>
              <button
                onClick={() => setHomeSubTab('team')}
                className={`font-headline font-black text-2xl tracking-tighter italic transition-all ${homeSubTab === 'team' ? 'border-b-4 border-black text-black' : 'text-neutral-300'}`}
              >
                团队
              </button>
            </div>

            {homeSubTab === 'discovery' ? (
              <div className="flex flex-col pb-10">
                {activities.filter(a => a.visibility === 'public').map((post) => (
                  <MomentItem
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                    onChangeVisibility={handleChangeVisibility}
                    onViewDetail={setSelectedPost}
                    currentUserProfile={userProfile}
                    currentScope="public"
                  />
                ))}
                {activities.filter(a => a.visibility === 'public').length === 0 && (
                  <div className="py-24 text-center">
                    <p className="text-[10px] font-black tracking-[0.4em] uppercase text-neutral-300 italic">广场暂无动态</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-10 px-8 pb-12 mt-6">
                {/* Join Team Input */}
                <div className="bg-neutral-50 p-6 rounded-[2.5rem] flex flex-col gap-4 border-2 border-dashed border-neutral-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-2">加入挑战小队</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="输入 6 位邀请码"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="flex-1 bg-white px-6 py-4 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-black outline-none transition-all uppercase tracking-[0.2em]"
                    />
                    <button
                      onClick={handleJoinTeam}
                      className="bg-black text-white px-6 rounded-2xl font-headline font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform"
                    >
                      加入
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  {tasks.filter(t => t.type === 'team').map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTaskDetails(t)}
                      className="bg-neutral-900 rounded-[3rem] p-8 text-white editorial-shadow relative overflow-hidden group transition-transform cursor-pointer active:scale-[0.98]"
                    >
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t.isStarted ? '进行中' : '筹备中'}</span>
                            <h4 className="text-3xl font-headline font-black italic mt-1 leading-none uppercase tracking-tighter">{t.name}</h4>
                          </div>
                          {!t.isStarted && t.creatorId === userProfile.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartTeam(t.id);
                              }}
                              className="bg-emerald-400 text-neutral-900 px-5 py-2 rounded-full font-headline font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform shadow-lg"
                            >
                              开始挑战
                            </button>
                          )}
                        </div>
                        <div className="bg-white/5 p-5 rounded-2xl flex justify-between items-center mb-10">
                          <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">邀请码</span>
                            <span className="text-lg font-headline font-black tracking-[0.3em] uppercase">{t.inviteCode}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(t.inviteCode || '');
                              showToast('邀请码已复制');
                            }}
                            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                          >
                            <Copy size={16} />
                          </button>
                        </div>

                        <div className="flex flex-col gap-12">
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t.isStarted ? '小队今日状态' : `小队成员 (${t.members?.length}/10)`}</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              {t.members?.map(m => {
                                // Use latest profile if it's the current user
                                const displayMember = m.id === userProfile.id ? userProfile : m;

                                // Check if member checked in today
                                const hasCheckedInToday = activities.some(a =>
                                  a.habitId === t.id &&
                                  (a.user.id === m.id || a.user.name === m.name) &&
                                  new Date(a.createdAt).toDateString() === new Date().toDateString()
                                );

                                return (
                                  <div key={m.id} className="relative group/member">
                                    <img src={displayMember.avatar} className={`w-12 h-12 rounded-[1.25rem] object-cover border-2 shadow-lg ${hasCheckedInToday ? 'border-emerald-400' : 'border-white/10'}`} referrerPolicy="no-referrer" />
                                    {hasCheckedInToday && (
                                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-neutral-900 flex items-center justify-center">
                                        <Check size={8} className="text-neutral-900" strokeWidth={4} />
                                      </div>
                                    )}
                                    {!t.isStarted && t.creatorId === userProfile.id && m.id !== userProfile.id && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleKickMember(t.id, m.id);
                                        }}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-neutral-900 opacity-0 group-hover/member:opacity-100 transition-opacity"
                                      >
                                        <X size={10} />
                                      </button>
                                    )}
                                    <span className="absolute -bottom-1 -left-1 text-[8px] bg-neutral-800 text-white/60 px-1.5 py-0.5 rounded italic font-black uppercase scale-75 truncate max-w-[50px]">
                                      {displayMember.name.split('_')[0]}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-end justify-between mb-4">
                              <div className="text-right flex-1">
                                <p className="text-4xl font-headline font-black italic leading-none">{t.currentProgress}/{t.totalDays}</p>
                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest text-emerald-400 mt-2">团队打卡进度</p>
                              </div>
                            </div>
                            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-400 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                                style={{ width: `${(t.currentProgress / t.totalDays) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-[-40px] right-[-40px] opacity-[0.03] rotate-12 scale-[2] pointer-events-none">
                        <Users size={160} strokeWidth={4} />
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => t.type === 'team').length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center gap-6 opacity-30 select-none">
                      <div className="w-20 h-20 bg-neutral-50 rounded-[2.5rem] flex items-center justify-center">
                        <Users size={32} className="text-neutral-400" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] italic leading-relaxed">集结志同道合的小伙伴<br />开启团队自律之旅</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      case 'friends':
        return (
          <div className="flex flex-col pb-32">
            {activities.filter(a => a.visibility === 'friends' || a.visibility === 'public').map((activity) => (
              <MomentItem
                key={activity.id}
                post={activity}
                onLike={handleLike}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                onChangeVisibility={handleChangeVisibility}
                onViewDetail={setSelectedPost}
                currentUserProfile={userProfile}
                currentScope="friends"
              />
            ))}

            {activities.filter(a => a.visibility === 'friends' || a.visibility === 'public').length === 0 && (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200">
                  <Users size={32} />
                </div>
                <p className="text-neutral-400 font-medium font-headline tracking-wide uppercase text-sm">
                  朋友们还没开始今日挑战
                </p>
              </div>
            )}
          </div>
        );
      case 'tasks':
        return (
          <main className="flex-grow pt-10 pb-32 px-6">
            <div className="flex gap-6 mb-8 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setTasksSubTab('ongoing')}
                className={`font-headline font-black text-xl tracking-tighter italic transition-all flex-shrink-0 ${tasksSubTab === 'ongoing' ? 'border-b-4 border-black text-black' : 'text-neutral-300'}`}
              >
                进行中
              </button>
              <button
                onClick={() => setTasksSubTab('completed')}
                className={`font-headline font-black text-xl tracking-tighter italic transition-all flex-shrink-0 ${tasksSubTab === 'completed' ? 'border-b-4 border-black text-black' : 'text-neutral-300'}`}
              >
                已完成
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <AnimatePresence mode="popLayout">
                {(tasksSubTab === 'ongoing' ? tasks : completedTasks).map(habit => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onCheck={handleCheck}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>

              {(tasksSubTab === 'ongoing' ? tasks : completedTasks).length === 0 && (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-300">
                    <CheckSquare size={32} />
                  </div>
                  <p className="text-neutral-400 font-medium font-headline tracking-wide uppercase text-sm">
                    {tasksSubTab === 'ongoing' ? '暂无进行中任务，开始你的自律之旅吧' : '暂无已完成任务'}
                  </p>
                </div>
              )}
            </div>
          </main>
        );
      case 'me':
        return (
          <div className="flex flex-col pb-32">
            <div className="flex flex-col items-center gap-8 py-10">
              <div className="relative p-2 rounded-[3rem] border-2 border-neutral-100 group cursor-pointer">
                <img src={userProfile.avatar} className="w-24 h-24 rounded-[2.5rem] object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/20 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, (url) => {
                      setUserProfile(prev => ({ ...prev, avatar: url }));
                      updateProfile({ avatar: url });
                    })}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center border-4 border-white">
                  <Flame size={14} className="text-white fill-white" />
                </div>
              </div>

              <div className="text-center flex flex-col items-center gap-1">
                {isEditingName ? (
                  <input
                    autoFocus
                    className="font-headline font-black text-2xl tracking-tighter italic uppercase bg-neutral-100 px-4 py-1 rounded-xl outline-none text-center"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                    onBlur={() => {
                      setIsEditingName(false);
                      updateProfile({ name: userProfile.name });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsEditingName(false);
                        updateProfile({ name: userProfile.name });
                      }
                    }}
                  />
                ) : (
                  <h2
                    onClick={() => setIsEditingName(true)}
                    className="font-headline font-black text-2xl tracking-tighter italic uppercase hover:text-[#576b95] transition-colors cursor-pointer"
                  >
                    {userProfile.name}
                  </h2>
                )}

                {isEditingId ? (
                  <input
                    autoFocus
                    className="text-[10px] text-neutral-900 font-black tracking-[0.3em] uppercase bg-neutral-100 px-4 py-1 rounded-lg outline-none text-center mt-1"
                    value={userProfile.id}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, id: e.target.value }))}
                    onBlur={async () => {
                      setIsEditingId(false);
                      await updateProfileId(userProfile.id);
                    }}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        setIsEditingId(false);
                        await updateProfileId(userProfile.id);
                      }
                    }}
                  />
                ) : (
                  <p
                    onClick={() => setIsEditingId(true)}
                    className="text-[10px] text-neutral-400 font-black tracking-[0.3em] uppercase hover:text-[#576b95] transition-colors cursor-pointer"
                  >
                    ID: {userProfile.id}
                  </p>
                )}
              </div>

              <div className="flex gap-16">
                <div className="text-center">
                  <p className="text-xl font-headline font-black italic">{friends.length}</p>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">好友</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-headline font-black italic">{tasks.length}</p>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">任务</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-headline font-black italic">
                    {userCheckInDays}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">打卡天数</p>
                </div>
              </div>
            </div>

            <div className="px-8 flex flex-col gap-6 mt-8">
              <div className="flex items-center gap-3">
                <Search size={18} className="text-neutral-400" />
                <input
                  type="text"
                  placeholder="搜索用户ID或用户名"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1 bg-neutral-100 px-4 py-3 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-neutral-100">
                  {searchResults.map(user => (
                    <div key={user.id} className="p-4 flex items-center justify-between border-b border-neutral-50 last:border-b-0">
                      <div className="flex items-center gap-3" onClick={() => setSelectedUserProfile(user)}>
                        <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-sm">{user.name}</p>
                          <p className="text-[10px] text-neutral-400 uppercase tracking-widest">ID: {user.id}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendFriendRequest(user.id)}
                        className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full active:scale-95 transition-transform"
                      >
                        加好友
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-8 flex flex-col gap-8">
              <div className="flex justify-between items-baseline">
                <h3 className="font-sans font-extrabold text-2xl tracking-wider text-neutral-900">勋章墙</h3>
                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">已获得: {tasks.filter(t => t.isArchived).length}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[7, 30, 90, 180, 360, 500].map((days, idx) => {
                  const earnedTask = tasks.find(t => t.isArchived && t.currentProgress >= days);
                  const isUnlocked = !!earnedTask;

                  // Icon mapping based on days
                  const getIcon = (d: number) => {
                    if (d <= 7) return 'local_fire_department';
                    if (d <= 30) return 'verified_user';
                    if (d <= 90) return 'stars';
                    if (d <= 180) return 'diamond';
                    return 'workspace_premium';
                  };

                  return (
                    <motion.div
                      key={idx}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => isUnlocked && setSelectedMedal({ days, taskName: earnedTask.name })}
                      className="aspect-square bg-white rounded-2xl flex flex-col items-center justify-center gap-3 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                    >
                      {/* Badge Display Case */}
                      <div className={`relative w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center shadow-inner ${!isUnlocked ? 'grayscale opacity-40' : ''}`}>
                        <span className="material-symbols-rounded text-3xl text-black select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {getIcon(days)}
                        </span>
                        {!isUnlocked && (
                          <div className="absolute bottom-0 right-0 w-5 h-5 bg-black rounded-full flex items-center justify-center border-2 border-white">
                            <Lock size={10} className="text-white" fill="currentColor" />
                          </div>
                        )}
                      </div>

                      {/* Typography */}
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`font-sans font-black text-lg tracking-tight leading-none ${isUnlocked ? 'text-black' : 'text-gray-300'}`}>
                          {days}天
                        </span>
                        <span className={`text-[10px] uppercase tracking-widest ${isUnlocked ? 'text-black font-bold' : 'text-gray-300 font-medium'}`}>
                          {isUnlocked ? '已解锁' : '未解锁'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* User's personal check-in history */}
            <div className="px-8 flex flex-col gap-6 mt-12 pb-12">
              <h3 className="font-headline font-black text-lg tracking-widest italic uppercase">我的任务</h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setTasksSubTab('ongoing')}
                  className={`font-headline font-black text-sm tracking-tighter italic transition-all flex-shrink-0 ${tasksSubTab === 'ongoing' ? 'border-b-2 border-black text-black' : 'text-neutral-300'}`}
                >
                  进行中
                </button>
                <button
                  onClick={() => setTasksSubTab('completed')}
                  className={`font-headline font-black text-sm tracking-tighter italic transition-all flex-shrink-0 ${tasksSubTab === 'completed' ? 'border-b-2 border-black text-black' : 'text-neutral-300'}`}
                >
                  已完成
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {(tasksSubTab === 'ongoing' ? tasks : completedTasks).map(t => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTaskDetails(t)}
                    className="p-6 bg-neutral-900 rounded-[2rem] text-white flex flex-col gap-4 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className="relative z-10">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{t.type === 'team' ? '团队' : '个人'} 任务</span>
                        {t.isCompletedToday && <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />}
                      </div>
                      <h4 className="text-xl font-headline font-black italic uppercase tracking-tighter mt-1">{t.name}</h4>
                      <div className="mt-8 flex items-baseline justify-between w-full">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-headline font-black italic">{t.currentProgress}</span>
                          <span className="text-[10px] font-black text-white/40 uppercase">/ {t.totalDays} 天</span>
                        </div>
                        <button className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 transition-colors">查看档案</button>
                      </div>
                    </div>
                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
                      {t.type === 'team' ? <Users size={100} /> : <CheckSquare size={100} />}
                    </div>
                  </div>
                ))}
                {(tasksSubTab === 'ongoing' ? tasks : completedTasks).length === 0 && (
                  <div className="py-16 text-center text-[10px] font-bold text-neutral-300 uppercase tracking-widest italic border-2 border-dashed border-neutral-50 rounded-[2rem]">
                    {tasksSubTab === 'ongoing' ? '暂无进行中任务' : '暂无已完成任务'}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  const handleLike = async (id: string, scope: InteractionScope = 'public') => {
    if (!session?.user?.id) return;

    setActivities(prev => prev.map(a => {
      if (a.id === id) {
        const alreadyLiked = a.likedBy.find(l => l.userId === session.user.id && l.scope === scope);
        let newLikedBy;
        if (alreadyLiked) {
          newLikedBy = a.likedBy.filter(l => !(l.userId === session.user.id && l.scope === scope));
        } else {
          newLikedBy = [...a.likedBy, { name: userProfile.name, userId: session.user.id, scope }];
        }

        // Persist
        supabase.from('activities').update({ liked_by: newLikedBy }).eq('id', id).then();

        return { ...a, likedBy: newLikedBy };
      }
      return a;
    }));
  };

  const handleAddComment = async (postId: string, text: string, scope: InteractionScope = 'public') => {
    if (!session?.user?.id) return;

    setActivities(prev => prev.map(a => {
      if (a.id === postId) {
        const newComment = {
          id: Date.now().toString(),
          user: userProfile.name,
          userId: session.user.id,
          text,
          createdAt: Date.now(),
          scope
        };
        const newComments = [...a.comments, newComment];

        // Persist
        supabase.from('activities').update({ comments: newComments }).eq('id', postId).then();

        return {
          ...a,
          comments: newComments
        };
      }
      return a;
    }));
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    setActivities(prev => prev.map(a => {
      if (a.id === postId) {
        const newComments = a.comments.filter(c => c.id !== commentId);

        // Persist
        supabase.from('activities').update({ comments: newComments }).eq('id', postId).then();

        return {
          ...a,
          comments: newComments
        };
      }
      return a;
    }));
  };

  const handleChangeVisibility = async (postId: string, visibility: Visibility) => {
    setActivities(prev => prev.map(a => {
      if (a.id === postId) {
        const updated = { ...a, visibility };

        // Persist
        supabase.from('activities').update({ visibility }).eq('id', postId).then();

        return updated;
      }
      return a;
    }));
    showToast('可见范围已修改');
  };

  const getHeaderRightIcon = () => {
    switch (activeTab) {
      case 'home':
      case 'friends':
        return <Search size={22} strokeWidth={2.5} />;
      case 'tasks':
        return <Plus size={24} strokeWidth={3} />;
      case 'me':
        return <Settings size={22} strokeWidth={2.5} onClick={() => setIsSettingsOpen(true)} />;
    }
  };

  return (
    <div
      className={`min-h-screen max-w-lg mx-auto flex flex-col font-sans selection:bg-black selection:text-white ${appBackground ? '' : 'bg-white'} relative overflow-hidden transition-colors duration-500 ${isDark ? 'text-white' : 'text-neutral-900'}`}
      style={appBackground ? {
        backgroundColor: appBackground,
      } : {}}
    >
      {/* Header */}
      <header className={`sticky top-0 z-40 ${isDark ? 'bg-black/60' : 'bg-white/80'} backdrop-blur-xl h-20 flex items-center justify-between px-8 shadow-sm transition-all duration-500`}>
        <motion.button
          onClick={() => setIsMoodOpen(true)}
          whileHover={{ scale: 1.2, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="text-2xl"
        >
          {currentMood}
        </motion.button>

        <h1 className={`font-headline font-extrabold text-xl tracking-[0.25em] ${isDark ? 'text-white' : 'text-black'} transition-colors duration-500`}>
          HABIT
        </h1>

        <button
          onClick={() => {
            if (activeTab === 'tasks') setIsModalOpen(true);
            else if (activeTab === 'home' || activeTab === 'friends') setIsSearching(true);
            else if (activeTab === 'me') setIsSettingsOpen(true);
          }}
          className={`w-10 h-10 flex items-center justify-center ${isDark ? 'hover:bg-white/10' : 'hover:bg-neutral-100'} rounded-full transition-colors`}
        >
          {getHeaderRightIcon()}
        </button>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[100] bg-white flex flex-col max-w-lg mx-auto left-0 right-0"
          >
            <div className="flex items-center gap-4 p-6 border-b border-neutral-100">
              <button onClick={() => setIsSearching(false)} className="p-2 -ml-2">
                <ChevronRight className="rotate-180" size={24} />
              </button>
              <div className="flex-1 relative">
                <input
                  autoFocus
                  type="text"
                  placeholder="搜索任务或动态..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-100 px-10 py-2.5 rounded-full text-sm outline-none font-medium"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      if (!searchHistory.includes(searchQuery)) {
                        setSearchHistory(prev => [searchQuery, ...prev.slice(0, 4)]);
                      }
                    }
                  }}
                />
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  if (searchQuery.trim() && !searchHistory.includes(searchQuery)) {
                    setSearchHistory(prev => [searchQuery, ...prev.slice(0, 4)]);
                  }
                }}
                className="text-sm font-bold text-neutral-900"
              >
                搜索
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-10">
              {!searchQuery && (
                <>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400">最近搜索</h4>
                      <button onClick={() => setSearchHistory([])} className="text-[#576b95] text-[10px] font-bold">清除历史</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map(h => (
                        <button
                          key={h}
                          onClick={() => setSearchQuery(h)}
                          className="px-4 py-2 bg-neutral-50 rounded-full text-xs font-medium text-neutral-600 border border-neutral-100"
                        >
                          {h}
                        </button>
                      ))}
                      {searchHistory.length === 0 && <p className="text-xs text-neutral-300 italic">暂无历史记录</p>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400">大家都在搜</h4>
                    <div className="grid grid-cols-2 gap-y-4">
                      {[
                        { rank: 1, text: '30天冥想挑战', hot: true },
                        { rank: 2, text: '早起打卡群', hot: true },
                        { rank: 3, text: '英语口语进阶', hot: false },
                        { rank: 4, text: '今日最佳瞬间', hot: false },
                        { rank: 5, text: '硬核健身榜单', hot: false },
                        { rank: 6, text: '小队招募中', hot: false }
                      ].map(item => (
                        <button
                          key={item.text}
                          onClick={() => {
                            setSearchQuery(item.text);
                            if (!searchHistory.includes(item.text)) {
                              setSearchHistory(prev => [item.text, ...prev.slice(0, 4)]);
                            }
                          }}
                          className="flex items-center gap-3 text-left hover:opacity-70 transition-opacity"
                        >
                          <span className="w-5 h-5 flex items-center justify-center rounded text-[10px] font-black bg-black text-white">{item.rank}</span>
                          <span className="text-sm font-medium text-neutral-700 flex-1 truncate">{item.text}</span>
                          {item.hot && <div className="w-1 h-1 bg-red-500 rounded-full animate-ping" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {searchQuery && (
                <div className="flex flex-col gap-8 pb-10">
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400">相关任务</h4>
                    {tasks.filter(t => t.name.includes(searchQuery)).map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setIsSearching(false);
                          setActiveTab('tasks');
                        }}
                        className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <CheckSquare size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{t.name}</p>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{t.currentProgress}/{t.totalDays} 天</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-neutral-300" />
                      </div>
                    ))}
                    {tasks.filter(t => t.name.includes(searchQuery)).length === 0 && (
                      <p className="text-xs text-neutral-300 italic">未找到匹配任务</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400">动态内容</h4>
                    {activities.filter(a => a.content?.includes(searchQuery) || a.tag.includes(searchQuery)).map(post => (
                      <MomentItem
                        key={post.id}
                        post={post}
                        onLike={handleLike}
                        onAddComment={handleAddComment}
                        onDeleteComment={handleDeleteComment}
                        onChangeVisibility={handleChangeVisibility}
                        onViewDetail={setSelectedPost}
                        currentUserProfile={userProfile}
                        currentScope="public"
                      />
                    ))}
                    {activities.filter(a => a.content?.includes(searchQuery) || a.tag.includes(searchQuery)).length === 0 && (
                      <p className="text-xs text-neutral-300 italic">未找到匹配动态</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main View Area */}
      <div className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Nav */}
      <nav className={`fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-40 h-24 ${isDark ? 'bg-black/90 border-white/10' : 'bg-white/95 border-neutral-50'} backdrop-blur-xl flex items-center justify-between px-6 pb-2 border-t transition-all duration-500`}>
        <button onClick={() => setActiveTab('home')} className="flex flex-col items-center gap-1.5 flex-1 group">
          <div className="relative flex flex-col items-center">
            <Home size={22} className={`${activeTab === 'home' ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-white/30' : 'text-neutral-500/40')} group-hover:text-black transition-colors`} />
            {activeTab === 'home' && <motion.div layoutId="nav-dot" className={`w-1 h-1 ${isDark ? 'bg-white' : 'bg-black'} rounded-full mt-1.5`} />}
          </div>
          <span className={`text-[10px] font-bold tracking-widest ${activeTab === 'home' ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-white/30' : 'text-neutral-500/40')} group-hover:text-black uppercase`}>首页</span>
        </button>
        <button onClick={() => setActiveTab('friends')} className="flex flex-col items-center gap-1.5 flex-1 group">
          <div className="relative flex flex-col items-center">
            <Users size={22} className={`${activeTab === 'friends' ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-white/30' : 'text-neutral-500/40')} group-hover:text-black transition-colors`} />
            {activeTab === 'friends' && <motion.div layoutId="nav-dot" className={`w-1 h-1 ${isDark ? 'bg-white' : 'bg-black'} rounded-full mt-1.5`} />}
          </div>
          <span className={`text-[10px] font-bold tracking-widest ${activeTab === 'friends' ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-white/30' : 'text-neutral-500/40')} group-hover:text-black uppercase`}>朋友</span>
        </button>

        {/* Main Action FAB */}
        <div className="relative -top-6 flex flex-col items-center">
          <button
            onClick={() => setIsCheckInOpen(true)}
            className={`w-16 h-16 ${isDark ? 'bg-neutral-800 border-white ring-4 ring-white/10' : 'bg-white border-neutral-800'} border-4 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all duration-500`}
          >
            <span className={`text-xl font-headline font-black ${isDark ? 'text-white' : 'text-neutral-900'}`}>打</span>
          </button>
        </div>

        <button onClick={() => setActiveTab('tasks')} className="flex flex-col items-center gap-1.5 flex-1 group">
          <div className="relative flex flex-col items-center">
            <CheckSquare size={22} className={`${activeTab === 'tasks' ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-white/30' : 'text-neutral-500/40')} group-hover:text-black transition-colors`} />
            {activeTab === 'tasks' && <motion.div layoutId="nav-dot" className={`w-1 h-1 ${isDark ? 'bg-white' : 'bg-black'} rounded-full mt-1.5`} />}
          </div>
          <span className={`text-[10px] font-bold tracking-widest ${activeTab === 'tasks' ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-white/30' : 'text-neutral-500/40')} group-hover:text-black uppercase`}>任务</span>
        </button>
        <button onClick={() => setActiveTab('me')} className="flex flex-col items-center gap-1.5 flex-1 group">
          <div className="relative flex flex-col items-center">
            <User size={22} className={`${activeTab === 'me' ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-white/30' : 'text-neutral-500/40')} group-hover:text-black transition-colors`} />
            {activeTab === 'me' && <motion.div layoutId="nav-dot" className={`w-1 h-1 ${isDark ? 'bg-white' : 'bg-black'} rounded-full mt-1.5`} />}
          </div>
          <span className={`text-[10px] font-bold tracking-widest ${activeTab === 'me' ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-white/30' : 'text-neutral-500/40')} group-hover:text-black uppercase`}>我</span>
        </button>
      </nav>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 z-[50]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-[3rem] z-[120] p-8 pb-12 flex flex-col gap-10 editorial-shadow overflow-y-auto"
            >
              <div className="flex justify-between items-center">
                <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 font-medium">取消</button>
                <h2 className="font-headline font-extrabold text-lg">新建任务</h2>
                <div className="w-8" />
              </div>

              <div className="flex flex-col gap-12">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="输入任务名称"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className="w-full text-2xl font-headline font-bold border-b-2 border-neutral-100 py-4 focus:border-black outline-none transition-colors rounded-none bg-transparent"
                  />
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-neutral-900">目标天数</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={taskDays}
                        onChange={(e) => setTaskDays(Number(e.target.value))}
                        className="w-12 text-right font-bold text-xl outline-none bg-transparent"
                      />
                      <span className="text-neutral-400 font-medium">天</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest">* 任务一旦创建，目标天数不可修改</p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setTaskType('single')}
                    className={`flex-1 py-4 rounded-full font-bold transition-all ${taskType === 'single' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-500'}`}
                  >
                    单人任务
                  </button>
                  <button
                    onClick={() => setTaskType('team')}
                    className={`flex-1 py-4 rounded-full font-bold transition-all ${taskType === 'team' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-500'}`}
                  >
                    团队任务
                  </button>
                </div>

                <button
                  onClick={handleAddTask}
                  className="w-full py-5 bg-black text-white rounded-full font-headline font-black text-lg shadow-2xl active:scale-95 transition-transform"
                >
                  确定创建
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Deletion Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteId(null)}
              className="fixed inset-0 bg-black/60 z-[201]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-sm bg-white rounded-[2.5rem] p-10 z-[202] text-center editorial-shadow"
            >
              <h3 className="font-headline font-black text-xl italic uppercase tracking-tighter mb-4">删除不可逆</h3>
              <p className="text-sm text-neutral-500 font-medium leading-relaxed mb-8">
                该任务下所有的打卡记录与勋章进度将永久消失。<br />确定要放弃这个目标吗？
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmDelete} className="w-full py-4 bg-red-500 text-white rounded-full font-bold uppercase tracking-widest text-xs">彻底删除</button>
                <button onClick={() => setConfirmDeleteId(null)} className="w-full py-4 bg-neutral-100 text-neutral-400 rounded-full font-bold uppercase tracking-widest text-xs">点错了</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Task Details Drawer */}
      <AnimatePresence>
        {selectedTaskDetails && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTaskDetails(null)}
              className="fixed inset-0 bg-black/60 z-[150]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-[3.5rem] z-[160] p-0 flex flex-col h-[80vh] editorial-shadow overflow-hidden"
            >
              <div className="p-8 border-b border-neutral-50 flex justify-between items-center bg-neutral-900 text-white">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">任务归档</span>
                  <h2 className="font-headline font-black text-2xl italic uppercase tracking-tighter leading-none mt-1">{selectedTaskDetails.name}</h2>
                </div>
                <button onClick={() => setSelectedTaskDetails(null)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto bg-white footer-safe">
                {(() => {
                  const habitActivities = activities.filter(a => a.habitId === selectedTaskDetails.id);
                  const sortedActivities = [...habitActivities].sort((a, b) => b.createdAt - a.createdAt);

                  return sortedActivities.map(act => (
                    <MomentItem
                      key={act.id}
                      post={act}
                      onLike={handleLike}
                      onAddComment={handleAddComment}
                      onDeleteComment={handleDeleteComment}
                      onChangeVisibility={handleChangeVisibility}
                      onViewDetail={setSelectedPost}
                      currentUserProfile={userProfile}
                      currentScope={selectedTaskDetails.type === 'team' ? 'team' : 'friends'}
                      showScopeSelector={true}
                      allowedScopes={selectedTaskDetails.type === 'team' ? ['public', 'friends', 'team'] : ['public', 'friends']}
                    />
                  ));
                })()}
                {activities.filter(a => a.habitId === selectedTaskDetails.id).length === 0 && (
                  <div className="py-24 text-center">
                    <p className="text-[10px] font-black tracking-[0.4em] uppercase text-neutral-300 italic">尚未开始记录</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Check-In Drawer */}
      <AnimatePresence>
        {isCheckInOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckInOpen(false)}
              className="fixed inset-0 bg-black/60 z-[100]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-[3.5rem] z-[110] p-10 flex flex-col gap-10 editorial-shadow h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center">
                <button onClick={() => {
                  setIsCheckInOpen(false);
                  setEditingPostId(null);
                }} className="text-neutral-400 font-bold uppercase text-xs tracking-widest">取消</button>
                <h2 className="font-headline font-black text-xl italic uppercase tracking-tighter">
                  {editingPostId ? '修改瞬间' : '今日打卡'}
                </h2>
                <button
                  onClick={handlePublishCheckIn}
                  className="bg-black text-white px-6 py-2 rounded-full font-headline font-black text-xs uppercase tracking-widest active:scale-95 transition-transform"
                >
                  {editingPostId ? '保存' : '发布'}
                </button>
              </div>

              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">{editingPostId ? '对应任务' : '选择任务'}</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {tasks.map(t => {
                      const isTeamReady = t.type === 'single' || t.isStarted;
                      return (
                        <button
                          key={t.id}
                          disabled={!!editingPostId || !isTeamReady}
                          onClick={() => setCheckInHabitId(t.id)}
                          className={`flex-shrink-0 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${checkInHabitId === t.id ? 'bg-black text-white' : 'bg-neutral-50 text-neutral-400 border-2 border-transparent hover:border-neutral-200'} ${editingPostId && checkInHabitId !== t.id ? 'opacity-30' : ''} ${t.isCompletedToday ? 'relative' : ''} ${!isTeamReady ? 'opacity-20 cursor-not-allowed' : ''}`}
                        >
                          {t.name}
                          {!isTeamReady && <Lock size={8} className="absolute top-1 right-1" />}
                          {t.isCompletedToday && (
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                          )}
                        </button>
                      )
                    })}
                    {tasks.length === 0 && <p className="text-xs font-bold text-neutral-300 italic">暂无进行中的任务</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">分享瞬间</label>
                  <textarea
                    placeholder="分享此刻的自律感..."
                    value={checkInContent}
                    onChange={(e) => setCheckInContent(e.target.value)}
                    className="w-full h-32 bg-neutral-50 p-6 rounded-[2rem] text-lg font-medium outline-none resize-none border-2 border-transparent focus:border-neutral-100 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">上传图片</label>
                  <div className="grid grid-cols-4 gap-2">
                    {checkInImages.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm group">
                        <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          onClick={() => setCheckInImages(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} className="text-white" />
                        </button>
                      </div>
                    ))}
                    {checkInImages.length < 9 && (
                      <label className="aspect-square bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-100 flex flex-col items-center justify-center text-neutral-300 hover:bg-neutral-100 transition-colors cursor-pointer">
                        <Camera size={20} />
                        <span className="text-[8px] font-black uppercase mt-1 text-neutral-400">本地上传</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            files.forEach(file => {
                              handleImageUpload({ target: { files: [file] } } as any, (url) => setCheckInImages(prev => [...prev, url]));
                            });
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">权限设置</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'public', label: '公开', icon: <Users size={14} /> },
                      { id: 'friends', label: '仅好友', icon: <Users size={14} className="text-emerald-500" /> },
                      { id: 'private', label: '仅自己', icon: <Lock size={14} /> }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setCheckInVisibility(opt.id as Visibility)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-[2rem] transition-all border-2 ${checkInVisibility === opt.id ? 'border-neutral-900 bg-neutral-900 text-white shadow-lg' : 'border-neutral-50 bg-neutral-50 text-neutral-400 hover:border-neutral-200'}`}
                      >
                        {opt.icon}
                        <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Decision Overlay */}
      <AnimatePresence>
        {decisionHabit && (
          <DecisionOverlay
            habit={decisionHabit}
            onDecision={handleDecision}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 max-w-lg mx-auto bg-neutral-50 z-[204] p-0 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-white px-8 pt-12 pb-6 flex items-center justify-center relative border-b border-neutral-100">
                <button
                  onClick={() => {
                    if (settingsCategory === 'root') setIsSettingsOpen(false);
                    else setSettingsCategory('root');
                  }}
                  className="absolute left-6 top-12 p-2 -mt-1 text-neutral-900"
                >
                  <ChevronRight className="rotate-180" size={24} strokeWidth={2.5} />
                </button>
                <h2 className="font-headline font-black text-2xl italic uppercase tracking-tighter text-neutral-900">
                  {settingsCategory === 'root' ? '设置' :
                    settingsCategory === 'background' ? '背景设置' :
                      settingsCategory === 'account' ? '账号安全' :
                        settingsCategory === 'general' ? '通用设置' : '关于'}
                </h2>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pb-12">
                {settingsCategory === 'root' ? (
                  <div className="px-6 py-8 flex flex-col gap-10">
                    {/* Group 1: Account */}
                    <div className="flex flex-col gap-3">
                      <h3 className="px-2 text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">账号</h3>
                      <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm divide-y divide-neutral-50">
                        <SettingsItem icon={<Shield size={20} />} label="账号与安全" onClick={() => setActiveSubPage('account_security')} />
                        <SettingsItem icon={<Lock size={20} />} label="隐私设置" isLast onClick={() => setActiveSubPage('privacy')} />
                      </div>
                    </div>

                    {/* Group 2: Notifications */}
                    <div className="flex flex-col gap-3">
                      <h3 className="px-2 text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">通知与提醒</h3>
                      <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm divide-y divide-neutral-50">
                        <SettingsItem
                          icon={<Bell size={20} />}
                          label="打卡提醒设置"
                          statusText={dailyReminder ? `${reminderTimes.length} 个提醒` : '已关闭'}
                          onClick={() => setActiveSubPage('reminders')}
                        />
                      </div>
                    </div>

                    {/* Group 3: General */}
                    <div className="flex flex-col gap-3">
                      <h3 className="px-2 text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">通用</h3>
                      <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm divide-y divide-neutral-50">
                        <SettingsItem
                          icon={<Palette size={20} />}
                          label="外观设置"
                          statusText={appearance === 'system' ? '跟随系统' : appearance === 'light' ? '浅色模式' : '深色模式'}
                          onClick={() => setIsAppearanceSheetOpen(true)}
                        />
                        <SettingsItem
                          icon={<Trash2 size={20} />}
                          label="清除缓存"
                          statusText={cacheSize}
                          showArrow={false}
                          onClick={() => {
                            localStorage.clear();
                            setCacheSize('0 B');
                            showToast('缓存已清理');
                          }}
                          isLast
                        />
                      </div>
                    </div>

                    {/* Group 4: Support & Feedback */}
                    <div className="flex flex-col gap-3">
                      <h3 className="px-2 text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">支持与反馈</h3>
                      <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm divide-y divide-neutral-50">
                        <SettingsItem icon={<Headphones size={20} />} label="意见反馈" onClick={() => setActiveSubPage('feedback')} />
                        <SettingsItem icon={<Smile size={20} />} label="加入官方社群" />
                        <SettingsItem icon={<Info size={20} />} label="关于 Habit" isLast onClick={() => setSettingsCategory('about')} />
                      </div>
                    </div>

                    {/* Group 5: Danger Zone */}
                    <div className="pb-24">
                      <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm">
                        <SettingsItem
                          label="退出登录"
                          isCentered
                          isDanger
                          isLast
                          onClick={() => setIsLogoutConfirmOpen(true)}
                        />
                      </div>
                    </div>
                  </div>
                ) : settingsCategory === 'background' ? (
                  <div className="px-8 py-10 flex flex-col gap-10">
                    <div className="flex flex-col gap-4">
                      <h3 className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">背景预设</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { name: '默认', color: '#ffffff' },
                          { name: '薄雾', color: '#f8f9fa' },
                          { name: '陶土', color: '#faf7f2' },
                          { name: '宁静', color: '#f0f4f8' },
                          { name: '森林', color: '#f1f5f0' },
                          { name: '淡雅', color: '#fff9f9' },
                          { name: '极简', color: '#f0f0f0' },
                          { name: '复古', color: '#fdfcf0' },
                          { name: '暗影', color: '#1a1a1a' },
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => setAppBackground(preset.color === '#ffffff' ? null : preset.color)}
                            className={`
                                   flex flex-col gap-3 p-4 rounded-[2rem] border-2 transition-all active:scale-95
                                   ${(appBackground === preset.color || (preset.color === '#ffffff' && !appBackground)) ? 'border-neutral-900 bg-white shadow-xl' : 'border-neutral-100 bg-white hover:border-neutral-200'}
                                 `}
                          >
                            <div
                              className="w-full aspect-square rounded-2xl border border-neutral-100 shadow-inner"
                              style={{ backgroundColor: preset.color }}
                            />
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest text-center">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-neutral-50 p-6 rounded-[2rem] border border-neutral-100 mt-4">
                      <p className="text-[10px] font-bold text-neutral-400 leading-relaxed italic">
                        提示: 选择纯色背景可以让界面更简洁，阅读体验更专注。深色背景下文字将自动适配。
                      </p>
                    </div>
                  </div>
                ) : settingsCategory === 'about' ? (
                  <div className="px-6 py-8 flex flex-col gap-10">
                    <div className="flex flex-col items-center gap-4 py-10">
                      <div className="w-20 h-20 bg-black rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                        <Flame size={40} className="text-white fill-white" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-headline font-black text-2xl italic uppercase tracking-tighter">Habit</h3>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] mt-1">Version 1.0.4 (Build 2026)</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm divide-y divide-neutral-50">
                      <SettingsItem icon={<FileText size={20} />} label="用户协议" />
                      <SettingsItem icon={<ShieldCheck size={20} />} label="隐私政策" />
                      <SettingsItem icon={<Info size={20} />} label="官方网站" isLast />
                    </div>

                    <p className="text-center text-[10px] font-medium text-neutral-300 px-10 leading-relaxed">
                      © 2026 Habit Studio. All rights reserved. <br />
                      致力于让自律成为一种生活方式。
                    </p>
                  </div>
                ) : (
                  <div className="p-12 flex flex-col items-center justify-center text-center gap-6">
                    <div className="w-20 h-20 bg-neutral-100 rounded-[2.5rem] flex items-center justify-center text-neutral-300">
                      <Info size={40} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-headline font-black italic uppercase tracking-tighter">功能暂未开放</h3>
                      <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">工程师正在玩命开发中...</p>
                    </div>
                    <button
                      onClick={() => setSettingsCategory('root')}
                      className="mt-4 px-8 py-3 bg-black text-white rounded-full font-headline font-black text-xs uppercase tracking-widest active:scale-95 transition-transform"
                    >
                      返回设置
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Account Security Subpage */}
      <AnimatePresence>
        {activeSubPage === 'account_security' && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 max-w-lg mx-auto bg-neutral-50 z-[205] p-0 flex flex-col overflow-hidden"
          >
            <div className="bg-white px-8 pt-12 pb-6 flex items-center justify-center relative border-b border-neutral-100">
              <button onClick={() => setActiveSubPage(null)} className="absolute left-6 top-12 p-2 -mt-1 text-neutral-900">
                <ChevronRight className="rotate-180" size={24} strokeWidth={2.5} />
              </button>
              <h2 className="font-headline font-black text-2xl italic uppercase tracking-tighter text-neutral-900">账号与安全</h2>
            </div>
            <div className="px-6 py-8 flex flex-col gap-10">
              <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm divide-y divide-neutral-50">
                <SettingsItem
                  label="修改密码"
                  onClick={() => setIsPasswordModalOpen(true)}
                  isLast
                />
              </div>
              <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm">
                <SettingsItem
                  label="注销账号"
                  isCentered
                  isDanger
                  isLast
                  onClick={async () => {
                    if (confirm('确定要注销账号吗？此操作将使您退出登录并清除本地数据。')) {
                      await supabase.auth.signOut();
                      localStorage.clear();
                      showToast('账号已注销');
                      setIsSettingsOpen(false);
                    }
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Settings Subpage */}
      <AnimatePresence>
        {activeSubPage === 'privacy' && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 max-w-lg mx-auto bg-neutral-50 z-[205] p-0 flex flex-col overflow-hidden"
          >
            <div className="bg-white px-8 pt-12 pb-6 flex items-center justify-center relative border-b border-neutral-100">
              <button onClick={() => setActiveSubPage(null)} className="absolute left-6 top-12 p-2 -mt-1 text-neutral-900">
                <ChevronRight className="rotate-180" size={24} strokeWidth={2.5} />
              </button>
              <h2 className="font-headline font-black text-2xl italic uppercase tracking-tighter text-neutral-900">隐私设置</h2>
            </div>
            <div className="px-6 py-8 flex flex-col gap-10">
              <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm divide-y divide-neutral-50">
                <SettingsItem
                  label="个人主页可见范围"
                  statusText={defaultVisibility === 'public' ? '公开' : defaultVisibility === 'friends' ? '仅朋友' : '私密'}
                  onClick={() => setIsVisibilitySheetOpen(true)}
                  isLast
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Subpage */}
      <AnimatePresence>
        {activeSubPage === 'feedback' && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 max-w-lg mx-auto bg-neutral-50 z-[205] p-0 flex flex-col overflow-hidden"
          >
            <div className="bg-white px-8 pt-12 pb-6 flex items-center justify-center relative border-b border-neutral-100">
              <button onClick={() => setActiveSubPage(null)} className="absolute left-6 top-12 p-2 -mt-1 text-neutral-900">
                <ChevronRight className="rotate-180" size={24} strokeWidth={2.5} />
              </button>
              <h2 className="font-headline font-black text-2xl italic uppercase tracking-tighter text-neutral-900">意见反馈</h2>
            </div>
            <div className="px-8 py-10 flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <h3 className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">联系邮箱</h3>
                <div className="bg-white rounded-[2rem] p-8 border border-neutral-100 shadow-sm flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-400">
                      <Mail size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">QQ 邮箱</span>
                      <span className="text-sm font-bold">3232896860@qq.com</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-400">
                      <Mail size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Gmail</span>
                      <span className="text-sm font-bold">syu52942@gmail.com</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900 p-8 rounded-[2.5rem] text-white">
                <h4 className="text-lg font-headline font-black italic uppercase tracking-tighter mb-2">感谢反馈</h4>
                <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest">
                  您的每一条建议都是我前进的动力。
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications & Reminders Subpage */}
      <AnimatePresence>
        {activeSubPage === 'reminders' && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 max-w-lg mx-auto bg-neutral-50 z-[205] p-0 flex flex-col overflow-hidden"
          >
            <div className="bg-white px-8 pt-12 pb-6 flex items-center justify-center relative border-b border-neutral-100">
              <button onClick={() => setActiveSubPage(null)} className="absolute left-6 top-12 p-2 -mt-1 text-neutral-900">
                <ChevronRight className="rotate-180" size={24} strokeWidth={2.5} />
              </button>
              <h2 className="font-headline font-black text-2xl italic uppercase tracking-tighter text-neutral-900">通知与提醒</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-8">
              <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm">
                <SettingsItem
                  icon={<Bell size={20} />}
                  label="每日打卡提醒"
                  showArrow={false}
                  showToggle={true}
                  isToggled={dailyReminder}
                  onToggle={setDailyReminder}
                  isLast
                />
              </div>

              {dailyReminder && (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-baseline px-2">
                    <h3 className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">提醒时间列表</h3>
                    <span className="text-[10px] font-bold text-neutral-300">{reminderTimes.length}/5</span>
                  </div>
                  <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm divide-y divide-neutral-50">
                    {reminderTimes.map((time, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-6 py-5 hover:bg-neutral-50 transition-colors cursor-pointer group"
                        onClick={() => {
                          setEditingTimeIndex(index);
                          setTimePickerValue(time);
                          setIsTimePickerOpen(true);
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-neutral-900 group-hover:scale-110 transition-transform"><Clock size={20} /></div>
                          <span className="font-sans font-bold text-[14px] text-neutral-800">{time}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          {reminderTimes.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setReminderTimes(prev => prev.filter((_, i) => i !== index));
                                showToast('已删除提醒');
                              }}
                              className="text-red-400 p-1 hover:scale-110 transition-transform"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {reminderTimes.length < 5 && (
                    <button
                      onClick={() => {
                        setEditingTimeIndex(null);
                        setTimePickerValue('08:00');
                        setIsTimePickerOpen(true);
                      }}
                      className="w-full py-5 bg-neutral-900 text-white rounded-[2rem] font-headline font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-transform mt-2"
                    >
                      添加提醒时间
                    </button>
                  )}
                </div>
              )}

              <div className="bg-neutral-100 p-8 rounded-[2.5rem]">
                <p className="text-[10px] font-medium text-neutral-400 leading-relaxed uppercase tracking-widest text-center">
                  开启提醒后，我们将在设定的时间点为您推送打卡通知。为了确保收到通知，请在系统设置中允许 Habit 发送通知。
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Logout Confirmation Modal */}
      <AnimatePresence>
        {isLogoutConfirmOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoutConfirmOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-[3.5rem] p-10 editorial-shadow text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-red-500">
                <LogOut size={32} />
              </div>
              <h3 className="font-headline font-black text-2xl italic uppercase tracking-tighter mb-4">确定退出登录？</h3>
              <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest leading-relaxed mb-10">
                退出后您将无法接收到即时提醒，<br />需要重新登录才能同步数据。
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setIsLogoutConfirmOpen(false);
                    setIsSettingsOpen(false);
                    showToast('已安全退出');
                  }}
                  className="w-full py-5 bg-black text-white rounded-2xl font-headline font-black text-sm uppercase tracking-widest active:scale-95 transition-transform"
                >
                  确定退出
                </button>
                <button
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  className="w-full py-5 text-neutral-400 font-headline font-black text-xs uppercase tracking-widest active:scale-95 transition-transform"
                >
                  返回
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Change Password Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsPasswordModalOpen(false);
                setNewPassInput('');
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-[3.5rem] p-10 editorial-shadow"
            >
              <div className="w-16 h-16 bg-neutral-50 rounded-[2rem] flex items-center justify-center mb-8 text-neutral-900">
                <Lock size={28} />
              </div>
              <h3 className="font-headline font-black text-2xl italic uppercase tracking-tighter mb-2">修改登录密码</h3>
              <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest leading-relaxed mb-8">
                请输入新的登录密码，长度至少为 6 位。
              </p>
              <div className="flex flex-col gap-6">
                <div className="relative">
                  <input
                    autoFocus
                    type="password"
                    placeholder="输入新密码"
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={async () => {
                      if (newPassInput.length < 6) {
                        showToast('密码长度至少为 6 位');
                        return;
                      }
                      const { error } = await supabase.auth.updateUser({ password: newPassInput });
                      if (error) {
                        showToast('修改失败: ' + error.message);
                      } else {
                        showToast('密码修改成功');
                        setIsPasswordModalOpen(false);
                        setNewPassInput('');
                      }
                    }}
                    className="w-full py-5 bg-black text-white rounded-2xl font-headline font-black text-sm uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    确认修改
                  </button>
                  <button
                    onClick={() => {
                      setIsPasswordModalOpen(false);
                      setNewPassInput('');
                    }}
                    className="w-full py-2 text-neutral-400 font-headline font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    取消
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Time Picker Modal */}
      <AnimatePresence>
        {isTimePickerOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTimePickerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-[3.5rem] p-10 editorial-shadow text-center"
            >
              <div className="w-16 h-16 bg-neutral-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-neutral-900">
                <Clock size={28} />
              </div>
              <h3 className="font-headline font-black text-2xl italic uppercase tracking-tighter mb-2">
                {editingTimeIndex !== null ? '修改提醒时间' : '添加提醒时间'}
              </h3>
              <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest leading-relaxed mb-8">
                请选择您希望接收打卡提醒的时间。
              </p>
              <div className="flex flex-col gap-8">
                <div className="flex justify-center items-center gap-4">
                  <input
                    type="time"
                    value={timePickerValue}
                    onChange={(e) => setTimePickerValue(e.target.value)}
                    className="bg-neutral-100 px-8 py-6 rounded-3xl text-3xl font-headline font-black italic border-none focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      if (editingTimeIndex !== null) {
                        const newTimes = [...reminderTimes];
                        newTimes[editingTimeIndex] = timePickerValue;
                        setReminderTimes(newTimes);
                        showToast('时间已更新');
                      } else {
                        setReminderTimes(prev => [...prev, timePickerValue].sort());
                        showToast('提醒已添加');
                      }
                      setIsTimePickerOpen(false);
                    }}
                    className="w-full py-5 bg-black text-white rounded-2xl font-headline font-black text-sm uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    确认
                  </button>
                  <button
                    onClick={() => setIsTimePickerOpen(false)}
                    className="w-full py-2 text-neutral-400 font-headline font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    取消
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Appearance Bottom Sheet */}
      <AnimatePresence>
        {isAppearanceSheetOpen && (
          <div className="fixed inset-0 z-[210] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAppearanceSheetOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative bg-white w-full max-w-lg rounded-t-[3rem] p-8 pb-12 editorial-shadow"
            >
              <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mb-8" />
              <h3 className="font-headline font-black text-xl text-center mb-8 italic uppercase tracking-tighter">外观设置</h3>
              <div className="flex flex-col gap-2">
                {[
                  { id: 'system', label: '跟随系统' },
                  { id: 'light', label: '浅色模式' },
                  { id: 'dark', label: '深色模式' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setAppearance(option.id as any);
                      setIsAppearanceSheetOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-6 py-5 rounded-2xl hover:bg-neutral-50 transition-colors"
                  >
                    <span className="font-sans font-bold text-[14px] text-neutral-800 tracking-tight">{option.label}</span>
                    {appearance === option.id && <Check size={20} className="text-black" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Visibility Bottom Sheet */}
      <AnimatePresence>
        {isVisibilitySheetOpen && (
          <div className="fixed inset-0 z-[210] flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVisibilitySheetOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative bg-white w-full max-w-lg rounded-t-[3rem] p-8 pb-12 editorial-shadow"
            >
              <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mb-8" />
              <h3 className="font-headline font-black text-xl text-center mb-8 italic uppercase tracking-tighter">可见范围</h3>
              <div className="flex flex-col gap-2">
                {[
                  { id: 'public', label: '公开' },
                  { id: 'friends', label: '仅朋友' },
                  { id: 'private', label: '仅自己' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setDefaultVisibility(option.id as any);
                      setIsVisibilitySheetOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-6 py-5 rounded-2xl hover:bg-neutral-50 transition-colors"
                  >
                    <span className="font-sans font-bold text-[14px] text-neutral-800 tracking-tight">{option.label}</span>
                    {defaultVisibility === option.id && <Check size={20} className="text-black" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Medal Detail Modal */}
      <AnimatePresence>
        {selectedMedal && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMedal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 editorial-shadow text-center flex flex-col items-center gap-6"
            >
              <div className={`w-24 h-24 rounded-full flex items-center justify-center relative shadow-xl ${selectedMedal.days <= 30 ? 'bg-amber-100 text-amber-500' :
                selectedMedal.days <= 180 ? 'bg-emerald-100 text-emerald-500' :
                  'bg-blue-100 text-blue-500'
                }`}>
                {selectedMedal.days <= 30 ? <Flame size={48} fill="currentColor" /> :
                  selectedMedal.days <= 180 ? <ShieldCheck size={48} fill="currentColor" /> :
                    <CheckSquare size={48} fill="currentColor" />}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-headline font-black text-2xl italic uppercase tracking-tighter">已解锁 {selectedMedal.days} 天勋章</h3>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-relaxed px-4">
                  恭喜你在任务 <span className="text-neutral-900">“{selectedMedal.taskName}”</span> 中坚持不懈，获得了这枚珍贵的勋章。
                </p>
              </div>
              <button
                onClick={() => setSelectedMedal(null)}
                className="w-full py-4 bg-black text-white rounded-2xl font-headline font-black text-xs uppercase tracking-widest active:scale-95 transition-transform"
              >
                太棒了
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mood Modal */}
      <AnimatePresence>
        {isMoodOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoodOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 editorial-shadow"
            >
              <h3 className="font-headline font-black text-xl text-center mb-8">今日心情</h3>
              <div className="grid grid-cols-4 gap-4">
                {emojis.map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setCurrentMood(emoji);
                      setIsMoodOpen(false);
                    }}
                    className={`
                      text-3xl p-3 rounded-2xl transition-all aspect-square flex items-center justify-center
                      ${currentMood === emoji
                        ? 'shadow-[0_10px_30px_rgba(0,0,0,0.15)] ring-2 ring-neutral-900 ring-offset-4 scale-110 z-10'
                        : 'hover:bg-neutral-50'}
                    `}
                    animate={currentMood === emoji ? {
                      y: [0, -4, 0],
                    } : {}}
                    transition={{
                      y: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
              <button
                onClick={() => setIsMoodOpen(false)}
                className="mt-10 w-full py-4 bg-neutral-100 text-neutral-900 font-bold rounded-2xl"
              >
                关闭
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[300] bg-white flex flex-col max-w-lg mx-auto left-0 right-0 overflow-y-auto"
          >
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <button onClick={() => setSelectedPost(null)} className="p-2 -ml-2 text-neutral-900">
                <ChevronRight className="rotate-180" size={24} />
              </button>
              <h3 className="font-headline font-black italic uppercase tracking-tighter">详情内容</h3>
              <div className="w-10" />
            </div>
            <div className="pb-32">
              <MomentItem
                post={selectedPost}
                onLike={handleLike}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                onChangeVisibility={handleChangeVisibility}
                currentUserProfile={userProfile}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[1000] bg-neutral-900 text-white px-6 py-3 rounded-full text-xs font-bold shadow-2xl tracking-widest uppercase border border-white/10"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

