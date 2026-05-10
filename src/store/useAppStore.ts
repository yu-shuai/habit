import { create } from 'zustand';
import { UserProfile, Post, Habit } from '../types';

interface AppState {
  // Auth
  session: any | null;
  setSession: (session: any | null) => void;

  // Profile
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  userCheckInDays: number;
  setUserCheckInDays: (days: number | ((prev: number) => number)) => void;

  // Friends & Social
  friends: any[];
  setFriends: (friends: any[]) => void;
  friendRequests: any[];
  setFriendRequests: (updater: any[] | ((prev: any[]) => any[])) => void;
  followings: string[];
  setFollowings: (updater: string[] | ((prev: string[]) => string[])) => void;
  followers: any[];
  setFollowers: (followers: any[]) => void;


  // UI State
  activeTab: 'home' | 'friends' | 'tasks' | 'me';
  setActiveTab: (tab: 'home' | 'friends' | 'tasks' | 'me') => void;
  // App Update
  appUpdate: { version: string; build_number: number; release_notes: string; download_url: string; is_mandatory: boolean } | null;
  setAppUpdate: (update: any | null) => void;
  currentAppInfo: { version: string; build: string } | null;
  setCurrentAppInfo: (info: any | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth initial
  session: null,
  setSession: (session) => set({ session }),

  // Profile initial
  userProfile: { id: '', name: '未登录', avatar: '' },
  setUserProfile: (updater) => set((state) => ({
    userProfile: typeof updater === 'function' ? updater(state.userProfile) : updater
  })),
  userCheckInDays: 0,
  setUserCheckInDays: (updater) => set((state) => ({
    userCheckInDays: typeof updater === 'function' ? updater(state.userCheckInDays) : updater
  })),

  // Social initial
  friends: [],
  setFriends: (friends) => set({ friends }),
  friendRequests: [],
  setFriendRequests: (updater) => set((state) => ({
    friendRequests: typeof updater === 'function' ? updater(state.friendRequests) : updater
  })),
  followings: [],
  setFollowings: (updater) => set((state) => ({
    followings: typeof updater === 'function' ? updater(state.followings) : updater
  })),
  followers: [],
  setFollowers: (followers) => set({ followers }),


  // UI initial
  activeTab: 'home',
  setActiveTab: (activeTab) => set({ activeTab }),
  toast: null,
  setToast: (toast) => set({ toast }),
  
  // App Update initial
  appUpdate: null,
  setAppUpdate: (appUpdate) => set({ appUpdate }),
  currentAppInfo: null,
  setCurrentAppInfo: (currentAppInfo) => set({ currentAppInfo }),
}));
