import { ChangeEvent } from 'react';
import { FriendSubTab, Habit, HomeSubTab, InteractionScope, Post, Tab, UserProfile, Visibility } from '../types';
import HomeTab from './tabs/HomeTab';
import FriendsTab from './tabs/FriendsTab';
import TasksTab from './tabs/TasksTab';
import MeTab from './tabs/MeTab';

interface AppContentProps {
  activeTab: Tab;
  // Home
  homeSubTab: HomeSubTab;
  setHomeSubTab: (tab: HomeSubTab) => void;
  followings: string[];
  // Friends
  friendSubTab: FriendSubTab;
  setFriendSubTab: (tab: FriendSubTab) => void;
  friendRequests: any[];
  onAcceptRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  // Tasks
  tasksSubTab: 'ongoing' | 'completed';
  setTasksSubTab: (tab: 'ongoing' | 'completed') => void;
  tasks: Habit[];
  completedTasks: Habit[];
  activities: Post[];
  friends: any[];
  // Team
  joinCode: string;
  setJoinCode: (code: string) => void;
  handleJoinTeam: () => void;
  handleStartTeam: (teamId: string) => void;
  handleKickMember: (teamId: string, memberId: string) => void;
  // Habit
  handleCheck: (id: string, skipAutoPost?: boolean) => void;
  handleDelete: (id: string) => void;
  // Activity
  handleLike: (id: string, scope?: InteractionScope) => void;
  handleAddComment: (postId: string, text: string, scope?: InteractionScope) => void;
  handleDeleteComment: (postId: string, commentId: string) => void;
  handleChangeVisibility: (postId: string, visibility: Visibility) => void;
  setSelectedPost: (post: Post | null) => void;
  setSelectedTaskDetails: (task: Habit | null) => void;
  // User
  userProfile: UserProfile;
  showToast: (message: string) => void;
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => void;
  setUserProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  updateProfile: (updates: Partial<{ name: string; avatar: string }>) => Promise<void>;
  isEditingName: boolean;
  setIsEditingName: (v: boolean) => void;
  isEditingId: boolean;
  setIsEditingId: (v: boolean) => void;
  updateProfileId: (newId: string) => Promise<void>;
  userCheckInDays: number;
  setSelectedMedal: (medal: { days: number; taskName: string } | null) => void;
  // Profile view
  onViewProfile: (userId: string) => void;
  hasNewFriendPosts?: boolean;
  followers: any[];
  totalLikes: number;
}

export default function AppContent(props: AppContentProps) {
  const {
    activeTab,
    homeSubTab, setHomeSubTab, followings,
    friendSubTab, setFriendSubTab, friendRequests, onAcceptRequest, onRejectRequest,
    tasksSubTab, setTasksSubTab,
    tasks, completedTasks, activities, friends,
    joinCode, setJoinCode,
    handleJoinTeam, handleStartTeam, handleKickMember,
    handleCheck, handleDelete,
    handleLike, handleAddComment, handleDeleteComment, handleChangeVisibility,
    setSelectedPost, setSelectedTaskDetails,
    userProfile, showToast,
    handleImageUpload, setUserProfile, updateProfile,
    isEditingName, setIsEditingName,
    isEditingId, setIsEditingId, updateProfileId,
    userCheckInDays, setSelectedMedal,
    onViewProfile,
    hasNewFriendPosts,
    followers,
    totalLikes,
  } = props;

  switch (activeTab) {
    case 'home':
      return (
        <HomeTab
          homeSubTab={homeSubTab} setHomeSubTab={setHomeSubTab}
          activities={activities} tasks={tasks}
          userProfile={userProfile} followings={followings}
          joinCode={joinCode} setJoinCode={setJoinCode}
          handleJoinTeam={handleJoinTeam} handleStartTeam={handleStartTeam} handleKickMember={handleKickMember}
          setSelectedTaskDetails={setSelectedTaskDetails}
          handleLike={handleLike} handleAddComment={handleAddComment}
          handleDeleteComment={handleDeleteComment} handleChangeVisibility={handleChangeVisibility}
          setSelectedPost={setSelectedPost} showToast={showToast}
        />
      );
    case 'friends':
      return (
        <FriendsTab
          friendSubTab={friendSubTab} setFriendSubTab={setFriendSubTab}
          activities={activities} friends={friends} friendRequests={friendRequests}
          userProfile={userProfile}
          handleLike={handleLike} handleAddComment={handleAddComment}
          handleDeleteComment={handleDeleteComment} handleChangeVisibility={handleChangeVisibility}
          setSelectedPost={setSelectedPost}
          onAcceptRequest={onAcceptRequest} onRejectRequest={onRejectRequest}
          onViewProfile={onViewProfile}
          hasNewFriendPosts={hasNewFriendPosts}
        />
      );
    case 'tasks':
      return (
        <TasksTab
          tasksSubTab={tasksSubTab} setTasksSubTab={setTasksSubTab}
          tasks={tasks} completedTasks={completedTasks}
          handleCheck={handleCheck} handleDelete={handleDelete}
        />
      );
    case 'me':
      return (
        <MeTab
          userProfile={userProfile}
          tasks={tasks} completedTasks={completedTasks}
          friends={friends} userCheckInDays={userCheckInDays}
          isEditingName={isEditingName} setIsEditingName={setIsEditingName}
          isEditingId={isEditingId} setIsEditingId={setIsEditingId}
          tasksSubTab={tasksSubTab} setTasksSubTab={setTasksSubTab}
          handleImageUpload={handleImageUpload}
          setUserProfile={setUserProfile} updateProfile={updateProfile}
          updateProfileId={updateProfileId}
          setSelectedMedal={setSelectedMedal}
          setSelectedTaskDetails={setSelectedTaskDetails}
          onViewProfile={onViewProfile}
          showToast={showToast}
          followers={followers}
          totalLikes={totalLikes}
        />
      );
  }
}
