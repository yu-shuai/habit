import { useRef, useState } from 'react';
import { DEFAULT_USER_PROFILE } from '../constants/app';
import { FriendSubTab, Habit, HomeSubTab, Post, Tab, UserProfile, Visibility } from '../types';

export const useAppState = () => {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>('tasks');
  const [homeSubTab, setHomeSubTab] = useState<HomeSubTab>('discovery');
  const [friendSubTab, setFriendSubTab] = useState<FriendSubTab>('feed');
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
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [taskName, setTaskName] = useState('');
  const [taskDays, setTaskDays] = useState(30);
  const [taskType, setTaskType] = useState<'single' | 'team'>('single');
  const [joinCode, setJoinCode] = useState('');
  const [settingsCategory, setSettingsCategory] = useState<'root' | 'account' | 'general' | 'about' | 'background'>('root');
  const [activeSubPage, setActiveSubPage] = useState<'account_security' | 'privacy' | 'feedback' | 'reminders' | null>(null);
  const [appBackground, setAppBackground] = useState<string | null>(null);
  const [dailyReminder, setDailyReminder] = useState(true);
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
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [followings, setFollowings] = useState<string[]>([]); // array of user UUIDs being followed
  const [followers, setFollowers] = useState<any[]>([]); // array of user profiles following the current user
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null); // user profile page
  const [kickConfirm, setKickConfirm] = useState<{ teamId: string; memberId: string; memberName: string } | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const bgInputRef = useRef<HTMLInputElement>(null);

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
    bgInputRef,
  };
};
