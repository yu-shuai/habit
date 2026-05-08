import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Habit, Post } from '../types';

interface HabitState {
  tasks: Habit[];
  setTasks: (updater: Habit[] | ((prev: Habit[]) => Habit[])) => void;
  completedTasks: Habit[];
  setCompletedTasks: (updater: Habit[] | ((prev: Habit[]) => Habit[])) => void;
  
  // 正在进行中的特定交互状态
  selectedTaskDetails: Habit | null;
  setSelectedTaskDetails: (habit: Habit | null) => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set) => ({
      tasks: [],
      setTasks: (updater) => set((state) => ({
        tasks: typeof updater === 'function' ? updater(state.tasks) : updater
      })),
      completedTasks: [],
      setCompletedTasks: (updater) => set((state) => ({
        completedTasks: typeof updater === 'function' ? updater(state.completedTasks) : updater
      })),
      selectedTaskDetails: null,
      setSelectedTaskDetails: (selectedTaskDetails) => set({ selectedTaskDetails }),
    }),
    {
      name: 'habit-storage',
      partialize: (state) => ({ tasks: state.tasks, completedTasks: state.completedTasks }),
    }
  )
);

interface ActivityState {
  activities: Post[];
  setActivities: (updater: Post[] | ((prev: Post[]) => Post[])) => void;
  selectedPost: Post | null;
  setSelectedPost: (post: Post | null) => void;
  fetchStatus: string;
  setFetchStatus: (status: string) => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      activities: [],
      setActivities: (updater) => set((state) => ({
        activities: typeof updater === 'function' ? updater(state.activities) : updater
      })),
      selectedPost: null,
      setSelectedPost: (selectedPost) => set({ selectedPost }),
      fetchStatus: 'idle',
      setFetchStatus: (fetchStatus) => set({ fetchStatus }),
    }),
    {
      name: 'activity-storage',
      partialize: (state) => ({ activities: state.activities }),
    }
  )
);
