import { useEffect, useRef, useState } from 'react';
import { DEFAULT_USER_PROFILE } from '../constants/app';
import { FriendSubTab, Habit, HomeSubTab, Post, Tab, UserProfile, Visibility } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useHabitStore, useActivityStore } from '../store/useContentStore';

// Keys that should be preserved when clearing cache
export const SETTINGS_KEYS = [
  'habit_appBackground', 'habit_appearance', 'habit_defaultVisibility',
  'habit_dailyReminder', 'habit_reminderTimes', 'lastViewedFriendsAt',
] as const;

const readLocal = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};

export const useAppState = () => {
  // --- Zustand Store Hooks ---
  const {
    session, setSession,
    userProfile, setUserProfile,
    userCheckInDays, setUserCheckInDays,
    friends, setFriends,
    friendRequests, setFriendRequests,
    followings, setFollowings,
    followers, setFollowers,
    activeTab, setActiveTab,
    toast, setToast,
  } = useAppStore();

  const {
    tasks, setTasks,
    completedTasks, setCompletedTasks,
    selectedTaskDetails, setSelectedTaskDetails,
  } = useHabitStore();

  const {
    activities, setActivities,
    selectedPost, setSelectedPost,
    fetchStatus, setFetchStatus,
  } = useActivityStore();

  // --- Local UI State (Still needed for specific interactions) ---
  const [homeSubTab, setHomeSubTab] = useState<HomeSubTab>('discovery');
  const [friendSubTab, setFriendSubTab] = useState<FriendSubTab>('feed');
  const [tasksSubTab, setTasksSubTab] = useState<'ongoing' | 'completed'>('ongoing');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoodOpen, setIsMoodOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  
  const [checkInHabitId, setCheckInHabitId] = useState<string>('');
  const [checkInContent, setCheckInContent] = useState<string>('');
  const [checkInImages, setCheckInImages] = useState<string[]>([]);
  
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteMeta, setConfirmDeleteMeta] = useState<{ id: string; name: string; isArchived: boolean } | null>(null);
  const [confirmFriendDelete, setConfirmFriendDelete] = useState<{ id: string; name: string } | null>(null);
  
  const [currentMood, setCurrentMood] = useState(() => {
    const saved = localStorage.getItem('habit_mood');
    const savedDate = localStorage.getItem('habit_moodDate');
    const today = new Date().toDateString();
    if (saved && savedDate === today) {
      return saved;
    }
    return '😆';
  });

  const [decisionHabit, setDecisionHabit] = useState<Habit | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingId, setIsEditingId] = useState(false);
  
  const [taskName, setTaskName] = useState('');
  const [taskDays, setTaskDays] = useState(30);
  const [taskType, setTaskType] = useState<'single' | 'team'>('single');
  const [joinCode, setJoinCode] = useState('');
  const [settingsCategory, setSettingsCategory] = useState<'root' | 'account' | 'general' | 'about' | 'background'>('root');
  const [activeSubPage, setActiveSubPage] = useState<'account_security' | 'privacy' | 'feedback' | 'reminders' | null>(null);
  const [appBackground, setAppBackground] = useState<string | null>(() => readLocal('habit_appBackground', null));
  const [dailyReminder, setDailyReminder] = useState(() => readLocal('habit_dailyReminder', true));
  const [defaultVisibility, setDefaultVisibility] = useState<Visibility>(() => readLocal('habit_defaultVisibility', 'public'));
  const [isVisibilitySheetOpen, setIsVisibilitySheetOpen] = useState(false);
  const [appearance, setAppearance] = useState<'system' | 'light' | 'dark'>(() => readLocal('habit_appearance', 'system'));
  const [isAppearanceSheetOpen, setIsAppearanceSheetOpen] = useState(false);
  const [cacheSize, setCacheSize] = useState('0 B');
  const [reminderTimes, setReminderTimes] = useState<string[]>(() => readLocal('habit_reminderTimes', ['08:00']));
  
  // #6: checkInVisibility defaults to user's saved defaultVisibility
  const [checkInVisibility, setCheckInVisibility] = useState<Visibility>(defaultVisibility);
  
  const [selectedMedal, setSelectedMedal] = useState<{ days: number; taskName: string } | null>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassInput, setNewPassInput] = useState('');
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [timePickerValue, setTimePickerValue] = useState('08:00');
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);
  
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null); // user profile page
  const [kickConfirm, setKickConfirm] = useState<{ teamId: string; memberId: string; memberName: string } | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const [lastViewedFriendsAt, setLastViewedFriendsAt] = useState(() => Number(localStorage.getItem('lastViewedFriendsAt')) || 0);
  const [lastViewedRequestsAt, setLastViewedRequestsAt] = useState(() => Number(localStorage.getItem('lastViewedRequestsAt')) || 0);
  const bgInputRef = useRef<HTMLInputElement>(null);


  // #27: Persist settings to localStorage
  useEffect(() => { localStorage.setItem('habit_appBackground', JSON.stringify(appBackground)); }, [appBackground]);
  useEffect(() => { localStorage.setItem('habit_appearance', JSON.stringify(appearance)); }, [appearance]);
  useEffect(() => { localStorage.setItem('habit_defaultVisibility', JSON.stringify(defaultVisibility)); }, [defaultVisibility]);
  useEffect(() => { localStorage.setItem('habit_dailyReminder', JSON.stringify(dailyReminder)); }, [dailyReminder]);
  useEffect(() => { localStorage.setItem('habit_reminderTimes', JSON.stringify(reminderTimes)); }, [reminderTimes]);
  useEffect(() => { localStorage.setItem('lastViewedFriendsAt', lastViewedFriendsAt.toString()); }, [lastViewedFriendsAt]);
  useEffect(() => { localStorage.setItem('lastViewedRequestsAt', lastViewedRequestsAt.toString()); }, [lastViewedRequestsAt]);

  useEffect(() => {
    localStorage.setItem('habit_mood', currentMood);
    localStorage.setItem('habit_moodDate', new Date().toDateString());
  }, [currentMood]);



  return {
    session, setSession,
    activeTab, setActiveTab,
    homeSubTab, setHomeSubTab,
    friendSubTab, setFriendSubTab,
    tasksSubTab, setTasksSubTab,
    tasks, setTasks,
    completedTasks, setCompletedTasks,
    isModalOpen, setIsModalOpen,
    isMoodOpen, setIsMoodOpen,
    isCheckInOpen, setIsCheckInOpen,
    checkInVisibility, setCheckInVisibility,
    checkInHabitId, setCheckInHabitId,
    checkInContent, setCheckInContent,
    checkInImages, setCheckInImages,
    activities, setActivities,
    editingPostId, setEditingPostId,
    confirmDeleteId, setConfirmDeleteId,
    confirmDeleteMeta, setConfirmDeleteMeta,
    confirmFriendDelete, setConfirmFriendDelete,
    selectedTaskDetails, setSelectedTaskDetails,
    currentMood, setCurrentMood,
    decisionHabit, setDecisionHabit,
    isSearching, setIsSearching,
    searchQuery, setSearchQuery,
    searchResults, setSearchResults,
    searchHistory, setSearchHistory,
    isSettingsOpen, setIsSettingsOpen,
    isEditingName, setIsEditingName,
    isEditingId, setIsEditingId,
    userProfile, setUserProfile,
    taskName, setTaskName,
    taskDays, setTaskDays,
    taskType, setTaskType,
    joinCode, setJoinCode,
    settingsCategory, setSettingsCategory,
    activeSubPage, setActiveSubPage,
    appBackground, setAppBackground,
    dailyReminder, setDailyReminder,
    defaultVisibility, setDefaultVisibility,
    isVisibilitySheetOpen, setIsVisibilitySheetOpen,
    appearance, setAppearance,
    isAppearanceSheetOpen, setIsAppearanceSheetOpen,
    cacheSize, setCacheSize,
    reminderTimes, setReminderTimes,
    toast, setToast,
    selectedPost, setSelectedPost,
    selectedMedal, setSelectedMedal,
    isLogoutConfirmOpen, setIsLogoutConfirmOpen,
    isPasswordModalOpen, setIsPasswordModalOpen,
    newPassInput, setNewPassInput,
    isTimePickerOpen, setIsTimePickerOpen,
    timePickerValue, setTimePickerValue,
    editingTimeIndex, setEditingTimeIndex,
    userCheckInDays, setUserCheckInDays,
    friendRequests, setFriendRequests,
    friends, setFriends,
    followings, setFollowings,
    followers, setFollowers,
    viewingProfile, setViewingProfile,
    kickConfirm, setKickConfirm,
    showFireworks, setShowFireworks,
    fetchStatus, setFetchStatus,
    lastViewedFriendsAt, setLastViewedFriendsAt,
    lastViewedRequestsAt, setLastViewedRequestsAt,
    bgInputRef,
  };

};
