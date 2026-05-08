import { ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FriendSubTab, Habit, HomeSubTab, InteractionScope, Post, Tab, Visibility } from '../types';
import HomeTab from './tabs/HomeTab';
import FriendsTab from './tabs/FriendsTab';
import TasksTab from './tabs/TasksTab';
import MeTab from './tabs/MeTab';

interface AppContentProps {
  activeTab: Tab;
  // ... 其他 props 保持不变
  homeSubTab: HomeSubTab;
  setHomeSubTab: (tab: HomeSubTab) => void;
  friendSubTab: FriendSubTab;
  setFriendSubTab: (tab: FriendSubTab) => void;
  friendRequests: any[];
  onAcceptRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  tasksSubTab: 'ongoing' | 'completed';
  setTasksSubTab: (tab: 'ongoing' | 'completed') => void;
  joinCode: string;
  setJoinCode: (code: string) => void;
  handleJoinTeam: () => void;
  handleStartTeam: (teamId: string) => void;
  handleKickMember: (teamId: string, memberId: string) => void;
  handleCheck: (id: string, skipAutoPost?: boolean) => void;
  handleDelete: (id: string) => void;
  handleTeamVote?: (habitId: string, choice: 'continue' | 'cashout', newDays?: number) => void;
  currentUserId?: string;
  onDeleteFriend?: (friendId: string) => void;
  onClaimReward?: (habit: Habit) => void;
  handleLike: (id: string, scope?: InteractionScope) => void;
  handleAddComment: (postId: string, text: string, scope?: InteractionScope) => void;
  handleDeleteComment: (postId: string, commentId: string) => void;
  handleChangeVisibility: (postId: string, visibility: Visibility) => void;
  handleDeletePost?: (postId: string) => void;
  handleEditPost?: (postId: string) => void;
  showToast: (message: string) => void;
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => void;
  updateProfile: (updates: Partial<{ name: string; avatar: string }>) => Promise<void>;
  isEditingName: boolean;
  setIsEditingName: (v: boolean) => void;
  isEditingId: boolean;
  setIsEditingId: (v: boolean) => void;
  updateProfileId: (newId: string) => Promise<void>;
  setSelectedMedal: (medal: { days: number; taskName: string } | null) => void;
  onViewProfile: (userId: string) => void;
  hasNewFriendPosts?: boolean;
  totalLikes: number;
  fetchStatus?: string;
  onLoadMore?: () => void;
  onRefreshLogs?: () => void;
}


export default function AppContent(props: AppContentProps) {
  const {
    activeTab,
    homeSubTab, setHomeSubTab,
    friendSubTab, setFriendSubTab, friendRequests, onAcceptRequest, onRejectRequest,
    tasksSubTab, setTasksSubTab,
    joinCode, setJoinCode,
    handleJoinTeam, handleStartTeam, handleKickMember,
    handleCheck, handleDelete, handleTeamVote, currentUserId, onDeleteFriend, onClaimReward,
    handleLike, handleAddComment, handleDeleteComment, handleChangeVisibility, handleDeletePost, handleEditPost,
    showToast,
    handleImageUpload, updateProfile,
    isEditingName, setIsEditingName,
    isEditingId, setIsEditingId, updateProfileId,
    setSelectedMedal,
    onViewProfile,
    hasNewFriendPosts,
    totalLikes,
    fetchStatus,
    onLoadMore,
    onRefreshLogs,
  } = props;


  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full h-full"
        >
          {(() => {
            switch (activeTab) {
              case 'home':
                return (
                  <HomeTab
                    homeSubTab={homeSubTab} setHomeSubTab={setHomeSubTab}
                    joinCode={joinCode} setJoinCode={setJoinCode}
                    handleJoinTeam={handleJoinTeam} handleStartTeam={handleStartTeam} handleKickMember={handleKickMember}
                    handleLike={handleLike} handleAddComment={handleAddComment}
                    handleDeleteComment={handleDeleteComment} handleChangeVisibility={handleChangeVisibility}
                    handleDeletePost={handleDeletePost}
                    handleEditPost={handleEditPost}
                    handleTeamVote={handleTeamVote}
                    onViewProfile={onViewProfile}
                    fetchStatus={fetchStatus}
                    onLoadMore={onLoadMore}
                  />

                );
              case 'friends':
                return (
                  <FriendsTab
                    friendSubTab={friendSubTab} setFriendSubTab={setFriendSubTab}
                    handleLike={handleLike} handleAddComment={handleAddComment}
                    handleDeleteComment={handleDeleteComment} handleChangeVisibility={handleChangeVisibility}
                    handleDeletePost={handleDeletePost}
                    handleEditPost={handleEditPost}
                    onAcceptRequest={onAcceptRequest} onRejectRequest={onRejectRequest}
                    onViewProfile={onViewProfile}
                    hasNewFriendPosts={hasNewFriendPosts}
                    fetchStatus={fetchStatus}
                    onLoadMore={onLoadMore}
                  />

                );
              case 'tasks':
                return (
                  <TasksTab
                    handleCheck={handleCheck}
                    handleDelete={handleDelete}
                    handleTeamVote={handleTeamVote}
                    currentUserId={currentUserId}
                    handleLike={handleLike}
                    handleAddComment={handleAddComment}
                    handleDeleteComment={handleDeleteComment}
                    handleChangeVisibility={handleChangeVisibility}
                    handleDeletePost={handleDeletePost}
                    handleEditPost={handleEditPost}
                    fetchStatus={fetchStatus}
                  />
                );
              case 'me':
                return (
                  <MeTab
                    isEditingName={isEditingName} setIsEditingName={setIsEditingName}
                    isEditingId={isEditingId} setIsEditingId={setIsEditingId}
                    tasksSubTab={tasksSubTab} setTasksSubTab={setTasksSubTab}
                    handleImageUpload={handleImageUpload}
                    updateProfile={updateProfile}
                    updateProfileId={updateProfileId}
                    setSelectedMedal={setSelectedMedal}
                    onViewProfile={onViewProfile}
                    showToast={showToast}
                    handleDelete={handleDelete}
                    onDeleteFriend={onDeleteFriend}
                    onClaimReward={onClaimReward}
                    totalLikes={totalLikes}
                    fetchStatus={fetchStatus}
                    onRefreshLogs={onRefreshLogs}
                  />
                );
              default:
                return null;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
